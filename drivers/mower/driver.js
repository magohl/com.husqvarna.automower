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