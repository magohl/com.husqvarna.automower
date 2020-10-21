'use strict';

const Homey = require('homey');
const AutomowerApiUtil = require('/lib/automowerapiutil.js');
const fetch = require('node-fetch');

module.exports = class MowerDevice extends Homey.Device {

  async onInit() {
    this.log('MowerDevice has been initialized');

    if (!this.util) this.util = new AutomowerApiUtil({homey: this.homey });

    this._timerId = null;
    this._pollingInterval = this.getSettings().polling_interval * 60000;

    this.initFlows();

    if (eval(this.getSettings().polling))
      this.refreshCapabilities();
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

    if (changedKeys.includes('polling_interval')) {
      if ( this._timerId ) {
        clearTimeout( this._timerId );
        this._timerId = null;
      }
      this._pollingInterval = newSettings.polling_interval * 60000;
      if (eval(this.getSettings().polling))
        this.refreshCapabilities();
    }

    if (changedKeys.includes('polling') && eval(newSettings.polling) == false) {
      if ( this._timerId ) {
        clearTimeout( this._timerId );
        this._timerId = null;
      }
    }

    if (changedKeys.includes('polling') && eval(newSettings.polling) == true) {
      if ( this._timerId ) {
        clearTimeout( this._timerId );
        this._timerId = null;
      }
      this.refreshCapabilities();
    }
  }

  async initFlows() {
    this.log('MowerDevice initalize flows');

    /* Action 'pause' */
    this.homey.flow.getActionCard('pause')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice FlowAction pause triggered');
        let id = this.getData().id;
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
        let id = this.getData().id;
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
        let id = this.getData().id;
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
        let id = this.getData().id;
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
        let id = this.getData().id;
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
      let id = this.getData().id;
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
        return (args.activity === this.getCapabilityValue('mower_activity_capability'));
      });  

    /* Condition 'state_is' */
    this.homey.flow.getConditionCard('state_is')
      .registerRunListener(async (args, state) => {
        this.log('MowerDevice Flow-condition state_is triggered');
        return (args.state === this.getCapabilityValue('mower_state_capability'));
      });
  }
  
  async refreshCapabilities() {
    try
    {
      this.log( "MowerDevice refreshCapabilities" );
      this.unsetWarning();

      let id = this.getData().id;
      var mowerData = await this.util.getMower(id);

      if ( mowerData ) {
        this.setAvailable();
        this.updateCapablity( "mower_mode_capability", mowerData.data.attributes.mower.mode );
        this.updateCapablity( "mower_activity_capability", mowerData.data.attributes.mower.activity );
        this.updateCapablity( "mower_state_capability", mowerData.data.attributes.mower.state );
        this.updateCapablity( "mower_errorcode_capability", mowerData.data.attributes.mower.errorCode.toString() );
        this.updateCapablity( "mower_battery_capability", mowerData.data.attributes.battery.batteryPercent );
      }
      else {
          this.setWarning( "No data received", null );
      }
    }
    catch ( err ) {
        this.log( "MowerDevice refresh error: " + err );
        this.setWarning( "error getting mower status", null );
    }

    this._timerId = setTimeout( () =>
    {
        this.refreshCapabilities();
    }, this._pollingInterval );
  }

  async updateCapablity(capability, value) {
    let currentValue = this.getCapabilityValue(capability);
    this.setCapabilityValue( capability, value );
    if (currentValue != value) {
      this.homey.flow.getDeviceTriggerCard(`${capability}_changed`)
        .trigger( this, {'value': value}, {})
        .catch(this.error);
    }
  }

}
