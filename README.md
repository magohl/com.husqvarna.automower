# Husqvarna Automower

Athom Homey smart-home app to control the Husqvarna Automowers equipped with Automower Connect.

### Changelog
* 1.0.0 - first version available for testing
* 1.0.1 - updated flow card titles, app image, description, readme
* 1.1.0 - Added new error codes from Husqvarna. Added 'Next start' capability that displays the scheduled next start.
* 1.2.0 - Added support for Husqvarna Auth API changes. Added auth token caching. New improved multiple mower support. (Thanks to TheodorStorm for his contribution!)
* 1.2.1 - Minor bugfix to support Homey Pro Early 2023 model
* 1.3.5 - Action 'Pause' now send the correct command to the mower (bugfix). Trigger 'ErrorCode changed' now handled correctly which fixes side effects on other triggers also (bugfix). Fixed minor issue changing the polling settings (bugfix). Removed unnecessary API login which could cause errors during setup (bugfix). Added new error codes from Husqvarna. Added whitespace removal in App configuration credentials dialogue. Added capability 'Inactive reason' recently added by Husqvarna to the mower status. Added trigger 'Inactive Reason changed'. Added flow token for error-code description. Added action 'Poll' that will update status independent of the built-in interval-based polling, which allow control of polling from a flow. Added trigger 'Last position changed' including tokens with latitude and longitude of last known position. Added 4 new condition flow cards for comparing current position latitude and longitude with a value.
* 1.4.2 - Feature Added: Geopositioning Condition Flow Card: 'Last Position is Inside Any Polygon'. A new geopositioning condition flow card has been introduced, enabling conditional checks against an array of polygons. This feature allows flows to determine if the mower is located within specific areas of your garden. Polygons should be created as GeoJSON structures and passed as an argument to the condition. Changes: Errorcode capability now support unknown errorcodes needed when Husqvarna add new ones between releases. Bugfixes: Improved handling when adding missing capabilities.

### Capabilities
* Activity
* State
* Mode
* Errorcode
* Battery level
* Next start
* Inactive Reason

### Triggers
* Activity changed
* State changed
* Mode changed
* Errorcode changed
* Battery level changed
* Inactive Reason changed
* Last position changed

### Conditons
* Activity is
* State is
* Last postition latitude is greater than 
* Last postition latitude is less than 
* Last postition longitude is greater than 
* Last postition longitude is less than 
* Last Position is Inside Any Polygon

### Actions
* Pause
* Park
* Park for duration
* Park until scheduled start
* Resume
* Start for duration
* Poll

### Device settings
* Polling enabled
* Polling interval

### App settings
* Username (legacy)
* Password (legacy)
* Appkey
* Appsecret

## Install and configure
* Register for a (free) account on Husqvarna developer portal https://developer.husqvarnagroup.cloud/docs/getting-started#/docs/getting-started
* Create an 'application' in the developer portal to get an appkey
* Install app in Homey (SDK3)
* Configure credentials in Homey App settings. Only appkey and appsecret needed. Username/password only for backwards compatibitlity
* Add device in Homey
* Use triggers, conditions or actions in your Homey flows or check status in the device overview.

### Rate limitations
Note that the Husqvarna API currently has an rate limitation of 10,000 calls per month and account. By default this homey app poll the Husqvarna Automower Connect API every 10 minutes. You can change this in app settings. Note - if your main usage is flow actions to control the mower, you do not need polling and it can be disabled. Since 1.3.x you can also trigger a poll manually using the 'Poll' action.

### Screenshots

![husqvarna_homey_1 3 0_screenshot](https://i.imgur.com/SQFUIHc.jpeg)

Example of the capabilities/details screen