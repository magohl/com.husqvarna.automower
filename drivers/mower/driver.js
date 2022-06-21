'use strict';

const Homey = require('homey');
const AutomowerApiUtil = require('/lib/automowerapiutil.js');

module.exports = class MowerDriver extends Homey.Driver {

  async onInit() {
    if (!this.util) {
      this.util = new AutomowerApiUtil({homey: this.homey });
      await this.util.login(true);
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

    /* Action 'pause' */
    this.homey.flow.getActionCard('pause')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice FlowAction pause triggered');
        let id = args.Automower.getData().id;
        let data = {
          data: {
            type: 'ParkUntilFurtherNotice'
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
        console.log(args);
        return (args.state === args.Automower.getCapabilityValue('mower_state_capability'));
      });
  }
}