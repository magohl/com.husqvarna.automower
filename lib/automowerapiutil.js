'use strict';

const fetch = require('node-fetch');
const baseLoginApiUrl = 'https://api.authentication.husqvarnagroup.dev/v1';
const baseAutomowerApiUrl = 'https://api.amc.husqvarna.dev/v1';

let cachedLoginResponse;
let lastLogin;
let grantTypePasswordPreReq;
let grantTypeClientCredentialsPreReq;

module.exports = class AutomowerApiUtil {

  constructor(opts) {
    this.homey = opts.homey;
  }

  /* Login */
  /* Support both old grant_type 'password' (username/passowrd/appkey) and 'client_credentials' (appkey/appsecret) */
  /* If all credentials is available prefer client_credentials */
  async _login() {
    const username = this.homey.settings.get('username');
    const password = this.homey.settings.get('password');
    const appkey = this.homey.settings.get('appkey');
    const appsecret = this.homey.settings.get('appsecret');

    // requirements for (old) grant_type 'Password' fulfilled
    if (username && password && appkey) {
      grantTypePasswordPreReq = true;
      console.log('grantTypePasswordPreReq:'+grantTypePasswordPreReq);
    }

    // requirements for (new) grant_type 'client_credentials' fulfilled
    if (appkey && appsecret ) {
      grantTypeClientCredentialsPreReq = true;
      console.log('grantTypeClientCredentialsPreReq:'+grantTypeClientCredentialsPreReq);
    }

    if (!grantTypePasswordPreReq && !grantTypeClientCredentialsPreReq) {
      this.homey.error('Credentials not configured in the app settnings');
      throw new Error('Please configure Husqvarna Api credentials in app settings first, then try again!');
    }

    const params = new URLSearchParams();

    // prefer grant_type client_credentials
    if (grantTypeClientCredentialsPreReq) {
      params.set('grant_type', 'client_credentials');
      params.set('client_id', appkey);
      params.set('client_secret', appsecret);
    } else {
      params.set('grant_type', 'password');
      params.set('client_id', appkey);
      params.set('username', username);
      params.set('password', password);
    }
    
    let that = this;
    const res = await fetch(`${baseLoginApiUrl}/oauth2/token`, { 
      method: 'POST',
      body: params
    })
    .catch(err => {
      this.homey.error(err);
      throw new Error(err);
    })
    .then(function(response) {
      if (response.status >= 400 && response.status < 600) {
        that.homey.error(`Server responded with http/${response.status}`);
        throw new Error("Bad response from API. Check credentials and connection and try again!");
      }
      return response;
    });

    return res.json();

  }

  async login(force) {
    if (force || !cachedLoginResponse || lastLogin <= Date.now()-(1000*cachedLoginResponse.expires_in) ) {
      let response = await this._login();
      cachedLoginResponse = response;
      lastLogin = Date.now();
    }

    return cachedLoginResponse;
  }

  /* List mowers */
  async listMowers() {
    let appkey = this.homey.settings.get('appkey');

    let token = await this.login(true);

    const requestOptions = {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'X-Api-Key': appkey,
        'Authorization-Provider': 'husqvarna'
      }
    };

    let that = this;
    const res = await fetch(`${baseAutomowerApiUrl}/mowers`, requestOptions)
      .then(function(response) {
        if (response.status >= 400 && response.status < 600) {
          that.homey.error(`Server responded with http/${response.status}`);
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

    let that = this;
    const res = await fetch(`${baseAutomowerApiUrl}/mowers/${mowerId}`, requestOptions)
      .then(function(response) {
        if (response.status >= 400 && response.status < 600) {
          that.homey.error(`Server responded with http/${response.status}`);
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

    let that = this;
    const res = await fetch(`${baseAutomowerApiUrl}/mowers/${mowerId}/actions`, requestOptions)
      .catch(err => {
        this.homey.error(err);
        throw new Error(err);
      })
      .then(function(response) {
        if (response.status >= 400 && response.status < 600) {
          that.homey.error(`Server responded with http/${response.status}`);
          throw new Error("Bad response from API. Check credentials and connection and try again!");
        }
        return response;
      });

      return true;
  }

}