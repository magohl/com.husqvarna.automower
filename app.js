'use strict';

const Homey = require('homey');

module.exports = class MowerApp extends Homey.App {

  async onInit() {
    this.log('MowerApp has been initialized');
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MowerApp settings where changed');
  }
}