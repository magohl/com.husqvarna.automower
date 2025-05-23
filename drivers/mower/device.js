// Updated drivers/mower/device.js with EPOS zone support
'use strict';

const Homey = require('homey');
const AutomowerApiUtil = require('../../lib/automowerapiutil.js');
const ErrorCodes = require('./errorcodes.js');
const fetch = require('node-fetch');
const dayjs = require('dayjs');
var calendar = require('dayjs/plugin/calendar');
dayjs.extend(calendar);

module.exports = class MowerDevice extends Homey.Device {

  async onInit() {
    this.log('MowerDevice has been initialized');

    await this.addCapabilityIfNeeded('mower_nextstart_capability');
    await this.addCapabilityIfNeeded('mower_inactivereason_capability');
    await this.addCapabilityIfNeeded('mower_lastposition_capability');
    await this.addCapabilityIfNeeded('mower_current_zone');

    if (!this.util) this.util = new AutomowerApiUtil({ homey: this.homey });

    this._timerId = null;
    this._pollingInterval = this.getSettings().polling_interval * 60000;
    this._workAreas = []; // Cache för arbetszoner

    if (eval(this.getSettings().polling))
      this.refreshCapabilitiesFromInterval();
  }

  async onAdded() { this.log('MowerDevice has been added'); }
  async onRenamed(name) { this.log('MowerDevice was renamed'); }
  async onDeleted() {
    this.log('MowerDevice has been deleted');
    if (this._timerId) clearTimeout(this._timerId);
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MowerDevice settings where changed');
    const newPolling = newSettings.polling === 'true';
    const pollingChanged = changedKeys.includes('polling');
    const intervalChanged = changedKeys.includes('polling_interval');
    if (intervalChanged || (pollingChanged && !newPolling)) {
      if (this._timerId) {
        clearTimeout(this._timerId);
        this._timerId = null;
      }
    }
    if (intervalChanged) this._pollingInterval = newSettings.polling_interval * 60000;
    if ((intervalChanged && newPolling) || (pollingChanged && newPolling)) {
      await this.refreshCapabilitiesFromInterval();
    }
  }

  async addCapabilityIfNeeded(capability) {
    if (!this.getCapabilities().includes(capability)) {
      this.log(`Adding missing capability: ${capability}`);
      await this.addCapability(capability);
    }
  }

  async refreshCapabilitiesFromInterval() {
    await this.refreshMowerCapabilities();
    this._timerId = setTimeout(async () => {
      await this.refreshCapabilitiesFromInterval();
    }, this._pollingInterval);
  }

  async refreshMowerCapabilities() {
    try {
      this.log("MowerDevice refreshMowerCapabilities");
      this.unsetWarning();

      let id = this.getData().id;
      var mowerData = await this.util.getMower(id);

      if (mowerData) {
        const attr = mowerData.data.attributes;
        this.setAvailable();

        await this.updateCapablity("mower_mode_capability", attr.mower.mode);
        await this.updateCapablity("mower_activity_capability", attr.mower.activity);
        await this.updateCapablity("mower_state_capability", attr.mower.state);
        await this.updateCapablity("mower_errorcode_capability", ErrorCodes.getErrorDescriptionById(attr.mower.errorCode), {
          'value': attr.mower.errorCode,
          'description': ErrorCodes.getErrorDescriptionById(attr.mower.errorCode)
        });
        await this.updateCapablity("mower_battery_capability", attr.battery.batteryPercent);
        await this.updateCapablity("mower_nextstart_capability", this.timeStampToNextStart(attr.planner.nextStartTimestamp));
        await this.updateCapablity("mower_inactivereason_capability", attr.mower.inactiveReason);
        await this.updateCapablity("mower_lastposition_capability", `${attr.positions[0].latitude},${attr.positions[0].longitude}`, {
          'latitude': attr.positions[0].latitude,
          'longitude': attr.positions[0].longitude
        });

        // Uppdatera aktuell zon
        await this.updateCurrentZone(mowerData);

      } else {
        this.setWarning("No data received", null);
      }
    } catch (err) {
      this.log("MowerDevice refresh error: " + err);
      this.log(err.stack);
      this.setWarning("error getting mower status", null);
    }
  }

  // Hämta arbetszoner från Husqvarna API
  async getWorkAreas() {
    try {
      const mowerId = this.getData().id;
      this.log(`Getting work areas for mower: ${mowerId}`);
      
      // Använd cachade data om de finns och är färska (< 5 minuter gamla)
      if (this._workAreas && this._workAreas.length > 0 && 
          this._workAreasLastUpdate && 
          (Date.now() - this._workAreasLastUpdate) < 300000) {
        this.log('Using cached work areas:', this._workAreas);
        return this._workAreas;
      }

      // Försök först via util-klassens nya metod
      try {
        this._workAreas = await this.util.getMowerWorkAreas(mowerId);
        if (this._workAreas && this._workAreas.length > 0) {
          this._workAreasLastUpdate = Date.now();
          this.log(`Successfully fetched ${this._workAreas.length} work areas via util`);
          return this._workAreas;
        }
      } catch (utilError) {
        this.log('Util method failed, trying direct API call:', utilError);
      }

      // Fallback: försök direkt API-anrop om util-metoden inte fungerar
      if (this.util.apiCall) {
        const response = await this.util.apiCall('GET', `/mowers/${mowerId}/workAreas`);
        
        if (response && response.data) {
          this._workAreas = response.data.map(area => ({
            id: area.id,
            name: area.attributes.name || `Zone ${area.id}`,
            enabled: area.attributes.enabled !== false,
            cuttingHeight: area.attributes.cuttingHeight
          }));
          this._workAreasLastUpdate = Date.now();
          this.log(`Successfully fetched ${this._workAreas.length} work areas via direct API`);
        } else {
          this.log('No work areas data received from direct API call');
          this._workAreas = [];
        }
      }

      return this._workAreas || [];
      
    } catch (error) {
      this.log('Error fetching work areas:', error);
      this.log('Error stack:', error.stack);
      // Returnera tomma data istället för att krascha
      return [];
    }
  }

  // Starta klippning i specifik arbetszon med tidsgräns
  async startInWorkArea(workAreaId, duration) {
    try {
      const mowerId = this.getData().id;
      
      const actionData = {
        data: {
          type: 'StartInWorkArea',
          attributes: {
            workAreaId: parseInt(workAreaId),
            duration: duration * 60 // Konvertera timmar till minuter
          }
        }
      };

      // Använd befintlig util-klass för att skicka action
      const result = await this.util.sendMowerAction(mowerId, actionData);
      
      this.log(`Started mowing in work area ${workAreaId} for ${duration} hours`);
      return result;
    } catch (error) {
      this.log('Error starting mower in work area:', error);
      throw error;
    }
  }

  // Starta klippning i specifik arbetszon tills den är klar
  async startInWorkAreaComplete(workAreaId) {
    try {
      const mowerId = this.getData().id;
      
      // Skicka utan duration för att låta klipparen slutföra zonen
      const actionData = {
        data: {
          type: 'StartInWorkArea',
          attributes: {
            workAreaId: parseInt(workAreaId)
            // Ingen duration = klipp tills zonen är klar
          }
        }
      };

      // Använd befintlig util-klass för att skicka action
      const result = await this.util.sendMowerAction(mowerId, actionData);
      
      this.log(`Started mowing in work area ${workAreaId} until complete`);
      return result;
    } catch (error) {
      this.log('Error starting mower in work area:', error);
      throw error;
    }
  }

  // Uppdatera aktuell zon baserat på mower-data
  async updateCurrentZone(mowerData) {
    try {
      const attr = mowerData.data.attributes;
      let currentZoneName = 'Unknown';

      // Först, försök hitta zonen från mower.workAreaId
      if (attr.mower && attr.mower.workAreaId) {
        const workAreas = await this.getWorkAreas();
        const currentZone = workAreas.find(area => 
          parseInt(area.id) === parseInt(attr.mower.workAreaId)
        );
        
        if (currentZone) {
          currentZoneName = currentZone.name;
        }
      }
      
      // Alternativt, om workAreas finns direkt i mower-data (som din nuvarande kod)
      else if (attr.workAreas && Array.isArray(attr.workAreas)) {
        const currentZoneId = attr.mower.workAreaId;
        const currentZone = attr.workAreas.find(z => z.workAreaId === currentZoneId);
        if (currentZone && currentZone.name) {
          currentZoneName = currentZone.name;
        }
      }

      // Uppdatera capability och trigga flow om zonen har ändrats
      const previousZone = this.getCapabilityValue('mower_current_zone');
      
      await this.updateCapablity("mower_current_zone", currentZoneName);
      
      // Extra trigger för zone-changed eftersom det är en viktig händelse
      if (previousZone && previousZone !== currentZoneName) {
        this.log(`Zone changed from ${previousZone} to ${currentZoneName}`);
      }

    } catch (error) {
      this.log('Error updating current zone:', error);
      // Sätt till Unknown om något går fel
      await this.updateCapablity("mower_current_zone", "Unknown");
    }
  }

  async updateCapablity(capability, value, triggerValue = { 'value': value }) {
    let currentValue = await this.getCapabilityValue(capability);
    await this.setCapabilityValue(capability, value);

    if (capability === 'mower_errorcode_capability' && currentValue === '0' && value === '---') {
      currentValue = await this.getCapabilityValue(capability);
    }

    if (currentValue != value) {
      this.homey.flow.getDeviceTriggerCard(`${capability}_changed`)
        .trigger(this, triggerValue, {})
        .catch(this.error);
    }
  }

  timeStampToNextStart(timestamp) {
    let nextStart = new Date(timestamp);
    return dayjs(nextStart).calendar(null, {
      sameDay: 'H:mm',
      nextDay: '[Tomorrow] H:mm',
      nextWeek: 'dddd H:mm',
      lastDay: '---',
      lastWeek: '---',
      sameElse: '---'
    });
  }
}