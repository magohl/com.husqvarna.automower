'use strict';

const Homey = require('homey');
const AutomowerApiUtil = require('../../lib/automowerapiutil.js');
const fetch = require('node-fetch');

/* Date and Time stuff */
const dayjs = require('dayjs');;
var calendar = require('dayjs/plugin/calendar');
dayjs.extend(calendar);

module.exports = class MowerDevice extends Homey.Device {

  async onInit() {
    this.log('MowerDevice has been initialized');

    /* Add updated capabilities, since first version, if needed */
    this.addCapabilityIfNeeded('mower_nextstart_capability');
    this.addCapabilityIfNeeded('mower_inactivereason_capability');

    if (!this.util) this.util = new AutomowerApiUtil({homey: this.homey });
   
    this._timerId = null;
    this._pollingInterval = this.getSettings().polling_interval * 60000;

    if (eval(this.getSettings().polling))
      this.refreshCapabilitiesFromInterval();
  }

  async onAdded() {
    this.log('MowerDevice has been added');
  }

  async onRenamed(name) {
    this.log('MowerDevice was renamed');
  }

  async onDeleted() {
    this.log('MowerDevice has been deleted');
    if ( this._timerId )
    {
        clearTimeout( this._timerId );
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MowerDevice settings where changed');

    const newPolling = newSettings.polling === 'true';
    const pollingChanged = changedKeys.includes('polling');
    const intervalChanged = changedKeys.includes('polling_interval');

    /* Timer cleanup */
    if (intervalChanged || (pollingChanged && !newPolling)) {
      if (this._timerId) {
        clearTimeout(this._timerId);
        this._timerId = null;
      }
    }

    /* Update interval time */
    if (intervalChanged) {
      this._pollingInterval = newSettings.polling_interval * 60000;
    }

    /* Reactivate polling based on current settings */
    if ((intervalChanged && newPolling) || (pollingChanged && newPolling)) {
      this.refreshCapabilitiesFromInterval();
    }

  }

  async addCapabilityIfNeeded(capability) {
    if (!this.getCapabilities().includes(capability)) {
      this.log('Capability ' + capability + ' not found, lets call addCapability.')
      this.addCapability(capability);
    }
  }

  async refreshCapabilitiesFromInterval() {
    await this.refreshMowerCapabilities()
    this._timerId = setTimeout( () =>
    {
        this.refreshCapabilitiesFromInterval();
    }, this._pollingInterval );
  }

  async refreshMowerCapabilities() {
    try
    {
      this.log( "MowerDevice refreshMowerCapabilities" );
      this.unsetWarning();

      let id = this.getData().id;
      var mowerData = await this.util.getMower(id);

      if ( mowerData ) {
        this.setAvailable();
        this.updateCapablity( "mower_mode_capability", mowerData.data.attributes.mower.mode );
        this.updateCapablity( "mower_activity_capability", mowerData.data.attributes.mower.activity );
        this.updateCapablity( "mower_state_capability", mowerData.data.attributes.mower.state );
        this.updateCapablity( "mower_errorcode_capability", mowerData.data.attributes.mower.errorCode, true );
        this.updateCapablity( "mower_battery_capability", mowerData.data.attributes.battery.batteryPercent );
        this.updateCapablity( "mower_nextstart_capability", this.timeStampToNextStart(mowerData.data.attributes.planner.nextStartTimestamp) );
        this.updateCapablity( "mower_inactivereason_capability", mowerData.data.attributes.mower.inactiveReason );
      }
      else {
          this.setWarning( "No data received", null );
      }
    }
    catch ( err ) {
        this.log( "MowerDevice refresh error: " + err );
        this.log(err.stack);
        this.setWarning( "error getting mower status", null );
    }

  }

  async updateCapablity(capability, value, overrideAndForceWriteCapabilityAsString = false) {

    let currentValue = this.getCapabilityValue(capability);
    this.setCapabilityValue( capability, (overrideAndForceWriteCapabilityAsString) ? value.toString() : value);

    if (currentValue != value) {
      this.homey.flow.getDeviceTriggerCard(`${capability}_changed`)
        .trigger( this, {'value': value}, {})
        .catch(this.error);
    }
  }

  timeStampToNextStart(timestamp) {
    let nextStart = new Date(timestamp);
    let nextStartText = dayjs(nextStart).calendar(null, {
      sameDay: 'H:mm', // ( 9:35 )
      nextDay: '[Tomorrow] H:mm', // ( Tomorrow 21:10 )
      nextWeek: 'dddd H:mm', // ( Sunday 14:00 )
      lastDay: '---', // N/A
      lastWeek: '---', // N/A
      sameElse: '---' // N/A
    });
    return nextStartText;
  }
}