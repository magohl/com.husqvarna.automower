# Husqvarna Automower

Athom Homey smart-home app to control the Husqvarna Automowers equipped with Automower Connect.

### Changelog
* 1.0.0 - first version available for testing
* 1.0.1 - updated flow card titles, app image, description, readme

### Capabilities
* Activity
* State
* Mode
* Errorcode
* Batery level

### Triggers
* Activity changed
* State changed
* Mode changed
* Errorcode changed
* Battery level changed

### Conditons
* Activity is
* State is

### Actions
* Pause
* Park
* Park for duration
* Park until scheduled start
* Resume
* Start for duration

### Device settings
* Polling enabled
* Polling interval

### App settings
* Username
* Password
* Appkey

## Install and configure
* Register for a (free) account on Husqvarna developer portal https://developer.husqvarnagroup.cloud/docs/getting-started#/docs/getting-started
* Create an 'application' in the developer portal to get an appkey
* Install app in Homey (SDK3)
* Configure credentials in Homey App settings
* Add device in Homey
* Use triggers, conditions or actions in your Homey flows or check status in the device overview.

### Rate limitations
Note that the Husqvarna API currently has an rate limitation of 10,000 calls per month and account. By default this homey app poll the Husqvarna Automower Connect API every 10 minutes. You can change this in app settings. Note - if your main usage is flow actions to control the mower, you do not need polling and it can be disabled.