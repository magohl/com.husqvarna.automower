'use strict';

const fetch = require('node-fetch');
const baseLoginApiUrl = 'https://api.authentication.husqvarnagroup.dev/v1';
const baseAutomowerApiUrl = 'https://api.amc.husqvarna.dev/v1';

module.exports = class AutomowerApiUtil {

  constructor(opts) {
    this.homey = opts.homey;
  }

  /* Login */
  /* TODO: Switch to AuthorizationCode + refreshtoken flow */
  async login() {
    const username = this.homey.settings.get('username');
    const password = this.homey.settings.get('password');
    const appkey = this.homey.settings.get('appkey');

    if (!username || !password  || !appkey) {
      this.homey.error('Credentials not configured in the app settnings');
      throw new Error('Please configure Husqvarna Api credentials in app settings first, then try again!');
    }

    const params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('client_id', appkey);
    params.set('username', username);
    params.set('password', password);
  
    const res = await fetch(`${baseLoginApiUrl}/oauth2/token`, { 
      method: 'POST',
      body: params
    })
    .catch(err => {
      this.homey.error(err);
    })
    .then(function(response) {
      if (response.status >= 400 && response.status < 600) {
        this.homey.error(`Server responeded with http/${response.status}`);
        throw new Error("Bad response from API. Check credentials and connection and try again!");
      }
      return response;
    });

    return res.json();

  }

  /* List mowers */
  async listMowers() {
    let appkey = this.homey.settings.get('appkey');

    let token = await this.login();

    const requestOptions = {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'X-Api-Key': appkey,
        'Authorization-Provider': 'husqvarna'
      }
    };

    const res = await fetch(`${baseAutomowerApiUrl}/mowers`, requestOptions)
      .then(function(response) {
        if (response.status >= 400 && response.status < 600) {
          this.homey.error(`Server responeded with http/${response.status}`);
          throw new Error("Bad response from API. Check credentials and connection and try again!");
        }
        return response;
      })
      .then(res => res.text())
      .then(text => JSON.parse(text))
      .catch(err => {
        this.homey.error(err)
      });
  
    
    const mowers = res.data.map(device => ( {
      name: `${device.attributes.system.name}`,
      data: ({
        id: device.id,
        serial: device.attributes.system.serialNumber.toString(),
        model: device.attributes.system.model
      }),
    }));

    return mowers;
  }

  /* Get mower status */
  async getMower(mowerId) {
    let appkey = this.homey.settings.get('appkey');
    let token = await this.login();

    const requestOptions = {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'X-Api-Key': appkey,
        'Authorization-Provider': 'husqvarna'
      }
    };

    const res = await fetch(`${baseAutomowerApiUrl}/mowers/${mowerId}`, requestOptions)
      .then(function(response) {
        if (response.status >= 400 && response.status < 600) {
          this.homey.error(`Server responeded with http/${response.status}`);
          throw new Error("Bad response from API. Check credentials and connection and try again!");
        }
        return response;
      })
      .then(res => res.text())
      .then(text => JSON.parse(text))
      .catch(err => {
        this.homey.error(err);
        throw new Error(err);
      });

      return res;
  }

  /* Send command to control Automower */
  async sendMowerAction(mowerId, data) {
    let appkey = this.homey.settings.get('appkey');
    let token = await this.login();

    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'X-Api-Key': appkey,
        'Authorization-Provider': 'husqvarna',
        'Content-Type': 'application/vnd.api+json'
      },
      body: JSON.stringify(data)
    };

    const res = await fetch(`${baseAutomowerApiUrl}/mowers/${mowerId}/actions`, requestOptions)
      .catch(err => {
        this.homey.error(err);
        throw new Error(err);
      })
      .then(function(response) {
        if (response.status >= 400 && response.status < 600) {
          this.homey.error(`Server responeded with http/${response.status}`);
          throw new Error("Bad response from API. Check credentials and connection and try again!");
        }
        return response;
      });

      return true;
  }

}