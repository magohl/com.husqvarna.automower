# Husqvarna Automower

Athom Homey smart-home app to control the Husqvarna Automower

### Changelog
* 1.0 first version

### Capabilities
* Automower Activity
* Automower State
* Automower Mode
* Automower Errorcode
* Automower Batery level

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
* Park until next scheduled run
* Park until further notice
* Park for a duration of time, overriding schedule
* Resume schedule
* Start mower and cut for a duration of time, overriding schedule

### Device settings
* Polling enabled
* Polling interval

### App settings
* Username
* Password
* Appkey

## Howto guide
* Register for a (free) account on Husqvarna developer portal https://developer.husqvarnagroup.cloud/docs/getting-started#/docs/getting-started
* Create an 'application' in the developer portal to get an appkey
* Install app in Homey
* Configure credentials in Homey App settings
* Add device in Homey
* Use triggers, conditions or actions in your Homey flows or chech the status in the device overview.

### Rate limitations
Note that the Husqvarna API currently has an rate limitation of 10,000 calls per month and account. By default this homey app poll the Husqvarna Automower Connect API every 10 minutes. You can change this in app settings.