'use strict';

const Homey = require('homey');
const AutomowerApiUtil = require('/lib/automowerapiutil.js');
const fetch = require('node-fetch');

/* Date and Time stuff*/
const dayjs = require('dayjs');;
var calendar = require('dayjs/plugin/calendar');
dayjs.extend(calendar);

module.exports = class MowerDevice extends Homey.Device {

  async onInit() {
    this.log('MowerDevice has been initialized');

    /* Add updated capabilities, since first version, if needed */
    this.addCapabilityIfNeeded('mower_nextstart_capability');

    if (!this.util) this.util = new AutomowerApiUtil({homey: this.homey });
   
    this._timerId = null;
    this._pollingInterval = this.getSettings().polling_interval * 60000;

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

  async addCapabilityIfNeeded(capability) {
    if (!this.getCapabilities().includes(capability)) {
      this.log('Capability ' + capability + ' not found, lets call addCapability.')
      this.addCapability(capability);
    }
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
        this.updateCapablity( "mower_nextstart_capability", this.timeStampToNextStart(mowerData.data.attributes.planner.nextStartTimestamp) );
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