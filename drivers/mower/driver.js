'use strict';

const Homey = require('homey');
const AutomowerApiUtil = require('../../lib/automowerapiutil.js');
const PositionUtil = require('../../lib/positionutil.js');

module.exports = class MowerDriver extends Homey.Driver {

  async onInit() {
    if (!this.util) {
      this.util = new AutomowerApiUtil({homey: this.homey });
      await this.initFlows();
    }
    this.log('MowerDriver has been initialized');
  }

  async onPairListDevices() {
    const mowers = await this.util.listMowers();
    return mowers;
  }

  // Autocomplete-funktion för zoner
  async onZoneAutocomplete(query, args) {
    try {
      this.log('onZoneAutocomplete called with query:', query);
      this.log('Autocomplete args:', args);
      
      // I Homey SDK v3 kan device vara i args.device eller args.Automower
      let device = args.device || args.Automower;
      
      if (!device) {
        this.log('No device found in autocomplete args, trying to get from driver');
        // Fallback: hämta alla enheter från driver
        const devices = this.getDevices();
        if (devices.length > 0) {
          device = devices[0]; // Använd första enheten som fallback
          this.log('Using first device as fallback:', device.getName());
        }
      }
      
      if (!device) {
        this.log('Still no device found, cannot get work areas');
        return [];
      }

      this.log('Getting work areas from device:', device.getName());
      const workAreas = await device.getWorkAreas();
      this.log('Work areas received:', workAreas);
      
      if (!workAreas || workAreas.length === 0) {
        this.log('No work areas found, trying direct API call...');
        // Fallback: använd driver's util direkt
        const mowerId = device.getData().id;
        const directResult = await this.util.getMowerWorkAreas(mowerId);
        this.log('Direct API result:', directResult);
        
        if (directResult && directResult.length > 0) {
          return directResult
            .filter(area => area.name.toLowerCase().includes(query.toLowerCase()))
            .map(area => ({
              name: area.name,
              id: area.id.toString()
            }));
        }
        
        return [];
      }
      
      const filteredAreas = workAreas
        .filter(area => area.name.toLowerCase().includes(query.toLowerCase()))
        .map(area => ({
          name: area.name,
          id: area.id.toString()
        }));
        
      this.log('Filtered areas for autocomplete:', filteredAreas);
      return filteredAreas;
      
    } catch (error) {
      this.log('Error getting work areas for autocomplete:', error);
      this.log('Error stack:', error.stack);
      
      // Sista fallback: använd driver's util direkt med första enheten
      try {
        const devices = this.getDevices();
        if (devices.length > 0) {
          const mowerId = devices[0].getData().id;
          const fallbackResult = await this.util.getMowerWorkAreas(mowerId);
          this.log('Fallback result:', fallbackResult);
          
          if (fallbackResult && fallbackResult.length > 0) {
            return fallbackResult
              .filter(area => area.name.toLowerCase().includes(query.toLowerCase()))
              .map(area => ({
                name: area.name,
                id: area.id.toString()
              }));
          }
        }
      } catch (fallbackError) {
        this.log('Fallback also failed:', fallbackError);
      }
      
      return [];
    }
  }

  // Condition: Kontrollera om aktuell zon är specifik zon
  async onCurrentZoneIs(args) {
    try {
      const device = args.Automower; // I Homey flows heter enheten 'Automower'
      const targetZone = args.zone;
      const currentZone = device.getCapabilityValue('mower_current_zone');
      
      return currentZone === targetZone.name;
    } catch (error) {
      this.log('Error checking current zone:', error);
      return false;
    }
  }

  // Action: Starta klippning i specifik zon med tidsgräns
  async onStartInZone(args) {
    try {
      const device = args.Automower; // I Homey flows heter enheten 'Automower'
      const zone = args.zone;
      const hours = args.hours;
      
      // Anropa Husqvarna API för att starta i specifik zon
      const result = await device.startInWorkArea(zone.id, hours);
      
      this.log(`Started mowing in zone ${zone.name} for ${hours} hours`);
      return result;
    } catch (error) {
      this.log('Error starting mower in zone:', error);
      throw new Error(`Failed to start mowing in zone: ${error.message}`);
    }
  }

  // Action: Starta klippning i specifik zon tills den är klar
  async onStartInZoneComplete(args) {
    try {
      const device = args.Automower; // I Homey flows heter enheten 'Automower'
      const zone = args.zone;
      
      // Anropa Husqvarna API för att starta i specifik zon utan tidsgräns
      const result = await device.startInWorkAreaComplete(zone.id);
      
      this.log(`Started mowing in zone ${zone.name} until complete`);
      return result;
    } catch (error) {
      this.log('Error starting mower in zone:', error);
      throw new Error(`Failed to start mowing in zone: ${error.message}`);
    }
  }

  async initFlows() {
    this.log('MowerDevice initalize flows');

    /* Action 'Poll' */
    this.homey.flow.getActionCard('poll')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice FlowAction poll triggered');
        await args.Automower.refreshMowerCapabilities();
    });

    /* Action 'Pause' */
    this.homey.flow.getActionCard('pause')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice FlowAction pause triggered');
        let id = args.Automower.getData().id;
        let data = {
          data: {
            type: 'Pause'
          }
        };
      let actionResult = await this.util.sendMowerAction(id, data);
      return actionResult;
    });

    /* Action 'ParkUntilNextSchedule' */
    this.homey.flow.getActionCard('park_until_next_schedule')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice FlowAction park_until_next_schedule triggered');
        let id = args.Automower.getData().id;
        let data = {
          data: {
            type: 'ParkUntilNextSchedule'
          }
        };
      let actionResult = await this.util.sendMowerAction(id, data);
      return actionResult;
    });

    /* Action 'ParkUntilFurtherNotice' */
    this.homey.flow.getActionCard('park_until_further_notice')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice FlowAction park_until_further_notice triggered');
        let id = args.Automower.getData().id;
        let data = {
          data: {
            type: 'ParkUntilFurtherNotice'
          }
        };
      let actionResult = await this.util.sendMowerAction(id, data);
      return actionResult;
    });

    /* Action 'Park' */
    this.homey.flow.getActionCard('park_duration')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice FlowAction park_duration triggered');
        let duration = args.hours;
        let id = args.Automower.getData().id;
        let data = {
          data: {
            type: 'Park',
            attributes: {
              duration: duration * 60
            }
          }
        };
      let actionResult = await this.util.sendMowerAction(id, data);
      return actionResult;
    });

    /* Action 'ResumeSchedule' */
    this.homey.flow.getActionCard('resume_schedule')
      .registerRunListener(async (args) => {
        this.log('MowerDevice FlowAction resume_schedule triggered');
        let id = args.Automower.getData().id;
        let data = {
          data: {
            type: 'ResumeSchedule'
          }
        };
      let actionResult = await this.util.sendMowerAction(id, data);
      return actionResult;
    });

    /* Action 'Start' */
    this.homey.flow.getActionCard('start_duration')
    .registerRunListener(async (args, state) => {
      this.log('MowerDevice Flowaction start_duration triggered');
      let duration = args.hours;
      let id = args.Automower.getData().id;
      let data = {
        data: {
          type: 'Start',
          attributes: {
            duration: duration * 60
          }
        }
      };
      let actionResult = await this.util.sendMowerAction(id, data);
      return actionResult;
    });

    /* Action 'Start in Zone' */
    this.homey.flow.getActionCard('start_in_zone')
      .registerRunListener(this.onStartInZone.bind(this))
      .registerArgumentAutocompleteListener('zone', this.onZoneAutocomplete.bind(this));

    /* Action 'Start in Zone Complete' - NY FUNKTION */
    this.homey.flow.getActionCard('start_in_zone_complete')
      .registerRunListener(this.onStartInZoneComplete.bind(this))
      .registerArgumentAutocompleteListener('zone', this.onZoneAutocomplete.bind(this));

    /* Condition 'activity_is' */
    this.homey.flow.getConditionCard('activity_is')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice Flow-condition activity_is triggered');
        return (args.activity === args.Automower.getCapabilityValue('mower_activity_capability'));
      });  

    /* Condition 'state_is' */
    this.homey.flow.getConditionCard('state_is')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice Flow-condition state_is triggered');
        return (args.state === args.Automower.getCapabilityValue('mower_state_capability'));
      });

    /* Condition 'mode_is' */
    this.homey.flow.getConditionCard('mode_is')
      .registerRunListener(async (args, mode) => {
        this.log('MowerDevice Flow-condition mode_is triggered');
        return (args.mode === args.Automower.getCapabilityValue('mower_mode_capability'));
      });

    /* Condition 'current_zone_is' - NY FUNKTION */
    this.homey.flow.getConditionCard('current_zone_is')
      .registerRunListener(this.onCurrentZoneIs.bind(this))
      .registerArgumentAutocompleteListener('zone', this.onZoneAutocomplete.bind(this));

    /* Condition 'latitude_greater_than' */
    this.homey.flow.getConditionCard('latitude_greater_than')
      .registerRunListener(async (args, state) => {
        let latitude = args.Automower.getCapabilityValue('mower_lastposition_capability').split(',')[0];
        let conditionResult = latitude > args.latitude;
        this.log(`MowerDevice Flow-condition latitude_greater_than triggered - condition result ${conditionResult}`);
        return (conditionResult);
      });

    /* Condition 'latitude_less_than' */
    this.homey.flow.getConditionCard('latitude_less_than')
      .registerRunListener(async (args, state) => {
        let latitude = args.Automower.getCapabilityValue('mower_lastposition_capability').split(',')[0];
        let conditionResult = latitude < args.latitude;
        this.log(`MowerDevice Flow-condition latitude_less_than triggered - condition result ${conditionResult}`);
        return (args.latitude < latitude);
      });

    /* Condition 'longitude_greater_than' */
    this.homey.flow.getConditionCard('longitude_greater_than')
      .registerRunListener(async (args, state) => {
        let longitude = args.Automower.getCapabilityValue('mower_lastposition_capability').split(',')[1];
        let conditionResult = longitude > args.longitude;
        this.log(`MowerDevice Flow-condition longitude_greater_than triggered - condition result ${conditionResult}`);
        return (longitude > args.longitude);
      });

    /* Condition 'longitude_less_than' */
    this.homey.flow.getConditionCard('longitude_less_than')
      .registerRunListener(async (args, state) => {
        let longitude = args.Automower.getCapabilityValue('mower_lastposition_capability').split(',')[1];
        let conditionResult = longitude < args.longitude;
        this.log(`MowerDevice Flow-condition longitude_less_than triggered - condition result ${conditionResult}`);
        return (longitude < args.longitude);
      });

    /* Condition 'lastposition_is_inside_any_polygon' */
    this.homey.flow.getConditionCard('lastposition_is_inside_any_polygon')
      .registerRunListener(async (args, state) => {
        /* Turf and GeoJSON uses the format lon,lat while the capability follow the canonical format lat,lon */
        let lastPositionCapability = args.Automower.getCapabilityValue('mower_lastposition_capability');
        let latitude = lastPositionCapability.split(',')[0];
        let longitude = lastPositionCapability.split(',')[1];
        let conditionResult = PositionUtil.checkPointInPolygons([longitude, latitude], args.polygons);

        this.log(`MowerDevice Flow-condition lastposition_is_inside_any_polygon tested with result ${conditionResult}`);
        return (conditionResult);
      });
  }
}