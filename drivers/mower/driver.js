'use strict';

const Homey = require('homey');
const AutomowerApiUtil = require('/lib/automowerapiutil.js');

module.exports = class MowerDriver extends Homey.Driver {

  async onInit() {
    this.log('MowerDriver has been initialized');
    if (!this.util) this.util = new AutomowerApiUtil({homey: this.homey });
  }

  async onPairListDevices() {
    const mowers = await this.util.listMowers();
    return mowers;
  }
}