module.exports = {

    getErrorDescriptionById: function(id) {
        id = Number(id);

        const entry = errorCodes.values.find(item => item.id === id);
        if (entry) {
            return entry.title.en;
        }

        return "Unknown errorcode";
    }
}

/* Currently this is repeated in 'mower_errorcode_capability' as changnig that from enum to string gives an error. And recreating the capability breaks flows */
let errorCodes = {
    "values": [
        {
            "id": 0,
            "title": {
                "en": "---"
            }
        },
        {
            "id": 1,
            "title": {
                "en": "Outside working area"
            }
        },
        {
            "id": 2,
            "title": {
                "en": "No loop signal"
            }
        },
        {
            "id": 3,
            "title": {
                "en": "Wrong loop signal"
            }
        },
        {
            "id": 4,
            "title": {
                "en": "Loop sensor problem, front"
            }
        },
        {
            "id": 5,
            "title": {
                "en": "Loop sensor problem, rear"
            }
        },
        {
            "id": 6,
            "title": {
                "en": "Loop sensor problem, left"
            }
        },
        {
            "id": 7,
            "title": {
                "en": "Loop sensor problem, right"
            }
        },
        {
            "id": 8,
            "title": {
                "en": "Wrong PIN code"
            }
        },
        {
            "id": 9,
            "title": {
                "en": "Trapped"
            }
        },
        {
            "id": 10,
            "title": {
                "en": "Upside down"
            }
        },
        {
            "id": 11,
            "title": {
                "en": "Low battery"
            }
        },
        {
            "id": 12,
            "title": {
                "en": "Empty battery"
            }
        },
        {
            "id": 13,
            "title": {
                "en": "No drive"
            }
        },
        {
            "id": 14,
            "title": {
                "en": "Mower lifted"
            }
        },
        {
            "id": 15,
            "title": {
                "en": "Lifted"
            }
        },
        {
            "id": 16,
            "title": {
                "en": "Stuck in charging station"
            }
        },
        {
            "id": 17,
            "title": {
                "en": "Charging station blocked"
            }
        },
        {
            "id": 18,
            "title": {
                "en": "Collision sensor problem, rear"
            }
        },
        {
            "id": 19,
            "title": {
                "en": "Collision sensor problem, front"
            }
        },
        {
            "id": 20,
            "title": {
                "en": "Wheel motor blocked, right"
            }
        },
        {
            "id": 21,
            "title": {
                "en": "Wheel motor blocked, left"
            }
        },
        {
            "id": 22,
            "title": {
                "en": "Wheel drive problem, right"
            }
        },
        {
            "id": 23,
            "title": {
                "en": "Wheel drive problem, left"
            }
        },
        {
            "id": 24,
            "title": {
                "en": "Cutting system blocked"
            }
        },
        {
            "id": 25,
            "title": {
                "en": "Cutting system blocked"
            }
        },
        {
            "id": 26,
            "title": {
                "en": "Invalid sub-device combination"
            }
        },
        {
            "id": 27,
            "title": {
                "en": "Settings restored"
            }
        },
        {
            "id": 28,
            "title": {
                "en": "Memory circuit problem"
            }
        },
        {
            "id": 29,
            "title": {
                "en": "Slope too steep"
            }
        },
        {
            "id": 30,
            "title": {
                "en": "Charging system problem"
            }
        },
        {
            "id": 31,
            "title": {
                "en": "STOP button problem"
            }
        },
        {
            "id": 32,
            "title": {
                "en": "Tilt sensor problem"
            }
        },
        {
            "id": 33,
            "title": {
                "en": "Mower tilted"
            }
        },
        {
            "id": 34,
            "title": {
                "en": "Cutting stopped - slope too steep"
            }
        },
        {
            "id": 35,
            "title": {
                "en": "Wheel motor overloaded, right"
            }
        },
        {
            "id": 36,
            "title": {
                "en": "Wheel motor overloaded, left"
            }
        },
        {
            "id": 37,
            "title": {
                "en": "Charging current too high"
            }
        },
        {
            "id": 38,
            "title": {
                "en": "Electronic problem"
            }
        },
        {
            "id": 39,
            "title": {
                "en": "Cutting motor problem"
            }
        },
        {
            "id": 40,
            "title": {
                "en": "Limited cutting height range"
            }
        },
        {
            "id": 41,
            "title": {
                "en": "Unexpected cutting height adj"
            }
        },
        {
            "id": 42,
            "title": {
                "en": "Limited cutting height range"
            }
        },
        {
            "id": 43,
            "title": {
                "en": "Cutting height problem, drive"
            }
        },
        {
            "id": 44,
            "title": {
                "en": "Cutting height problem, curr"
            }
        },
        {
            "id": 45,
            "title": {
                "en": "Cutting height problem, dir"
            }
        },
        {
            "id": 46,
            "title": {
                "en": "Cutting height blocked"
            }
        },
        {
            "id": 47,
            "title": {
                "en": "Cutting height problem"
            }
        },
        {
            "id": 48,
            "title": {
                "en": "No response from charger"
            }
        },
        {
            "id": 49,
            "title": {
                "en": "Ultrasonic problem"
            }
        },
        {
            "id": 50,
            "title": {
                "en": "Guide 1 not found"
            }
        },
        {
            "id": 51,
            "title": {
                "en": "Guide 2 not found"
            }
        },
        {
            "id": 52,
            "title": {
                "en": "Guide 3 not found"
            }
        },
        {
            "id": 53,
            "title": {
                "en": "GPS navigation problem"
            }
        },
        {
            "id": 54,
            "title": {
                "en": "Weak GPS signal"
            }
        },
        {
            "id": 55,
            "title": {
                "en": "Difficult finding home"
            }
        },
        {
            "id": 56,
            "title": {
                "en": "Guide calibration accomplished"
            }
        },
        {
            "id": 57,
            "title": {
                "en": "Guide calibration failed"
            }
        },
        {
            "id": 58,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 59,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 60,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 61,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 62,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 63,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 64,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 65,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 66,
            "title": {
                "en": "Battery problem"
            }
        },
        {
            "id": 67,
            "title": {
                "en": "Battery problem"
            }
        },
        {
            "id": 68,
            "title": {
                "en": "Temporary battery problem"
            }
        },
        {
            "id": 69,
            "title": {
                "en": "Alarm! Mower switched off"
            }
        },
        {
            "id": 70,
            "title": {
                "en": "Alarm! Mower stopped"
            }
        },
        {
            "id": 71,
            "title": {
                "en": "Alarm! Mower lifted"
            }
        },
        {
            "id": 72,
            "title": {
                "en": "Alarm! Mower tilted"
            }
        },
        {
            "id": 73,
            "title": {
                "en": "Alarm! Mower in motion"
            }
        },
        {
            "id": 74,
            "title": {
                "en": "Alarm! Outside geofence"
            }
        },
        {
            "id": 75,
            "title": {
                "en": "Connection changed"
            }
        },
        {
            "id": 76,
            "title": {
                "en": "Connection NOT changed"
            }
        },
        {
            "id": 77,
            "title": {
                "en": "Com board not available"
            }
        },
        {
            "id": 78,
            "title": {
                "en": "Slipped - Mower has Slipped.Situation not solved with moving pattern"
            }
        },
        {
            "id": 79,
            "title": {
                "en": "Invalid battery combination - Invalid combination of different battery types."
            }
        },
        {
            "id": 80,
            "title": {
                "en": "Cutting system imbalance    Warning"
            }
        },
        {
            "id": 81,
            "title": {
                "en": "Safety function faulty"
            }
        },
        {
            "id": 82,
            "title": {
                "en": "Wheel motor blocked, rear right"
            }
        },
        {
            "id": 83,
            "title": {
                "en": "Wheel motor blocked, rear left"
            }
        },
        {
            "id": 84,
            "title": {
                "en": "Wheel drive problem, rear right"
            }
        },
        {
            "id": 85,
            "title": {
                "en": "Wheel drive problem, rear left"
            }
        },
        {
            "id": 86,
            "title": {
                "en": "Wheel motor overloaded, rear right"
            }
        },
        {
            "id": 87,
            "title": {
                "en": "Wheel motor overloaded, rear left"
            }
        },
        {
            "id": 88,
            "title": {
                "en": "Angular sensor problem"
            }
        },
        {
            "id": 89,
            "title": {
                "en": "Invalid system configuration"
            }
        },
        {
            "id": 90,
            "title": {
                "en": "No power in charging station"
            }
        },
        {
            "id": 91,
            "title": {
                "en": "Switch cord problem"
            }
        },
        {
            "id": 92,
            "title": {
                "en": "Work area not valid"
            }
        },
        {
            "id": 93,
            "title": {
                "en": "No accurate position from satellites"
            }
        },
        {
            "id": 94,
            "title": {
                "en": "Reference station communication problem"
            }
        },
        {
            "id": 95,
            "title": {
                "en": "Folding sensor activated"
            }
        },
        {
            "id": 96,
            "title": {
                "en": "Right brush motor overloaded"
            }
        },
        {
            "id": 97,
            "title": {
                "en": "Left brush motor overloaded"
            }
        },
        {
            "id": 98,
            "title": {
                "en": "Ultrasonic Sensor 1 defect"
            }
        },
        {
            "id": 99,
            "title": {
                "en": "Ultrasonic Sensor 2 defect"
            }
        },
        {
            "id": 100,
            "title": {
                "en": "Ultrasonic Sensor 3 defect"
            }
        },
        {
            "id": 101,
            "title": {
                "en": "Ultrasonic Sensor 4 defect"
            }
        },
        {
            "id": 102,
            "title": {
                "en": "Cutting drive motor 1 defect"
            }
        },
        {
            "id": 103,
            "title": {
                "en": "Cutting drive motor 2 defect"
            }
        },
        {
            "id": 104,
            "title": {
                "en": "Cutting drive motor 3 defect"
            }
        },
        {
            "id": 105,
            "title": {
                "en": "Lift Sensor defect"
            }
        },
        {
            "id": 106,
            "title": {
                "en": "Collision sensor defect"
            }
        },
        {
            "id": 107,
            "title": {
                "en": "Docking sensor defect"
            }
        },
        {
            "id": 108,
            "title": {
                "en": "Folding cutting deck sensor defect"
            }
        },
        {
            "id": 109,
            "title": {
                "en": "Loop sensor defect"
            }
        },
        {
            "id": 110,
            "title": {
                "en": "Collision sensor error"
            }
        },
        {
            "id": 111,
            "title": {
                "en": "No confirmed position"
            }
        },
        {
            "id": 112,
            "title": {
                "en": "Cutting system major imbalance"
            }
        },
        {
            "id": 113,
            "title": {
                "en": "Complex working area"
            }
        },
        {
            "id": 114,
            "title": {
                "en": "Too high discharge current"
            }
        },
        {
            "id": 115,
            "title": {
                "en": "Too high internal current"
            }
        },
        {
            "id": 116,
            "title": {
                "en": "High charging power loss"
            }
        },
        {
            "id": 117,
            "title": {
                "en": "High internal power loss"
            }
        },
        {
            "id": 118,
            "title": {
                "en": "Charging system problem"
            }
        },
        {
            "id": 119,
            "title": {
                "en": "Zone generator problem"
            }
        },
        {
            "id": 120,
            "title": {
                "en": "Internal voltage error"
            }
        },
        {
            "id": 121,
            "title": {
                "en": "High internal temerature"
            }
        },
        {
            "id": 122,
            "title": {
                "en": "CAN error"
            }
        },
        {
            "id": 123,
            "title": {
                "en": "Destination not reachable"
            }
        },
        {
            "id": 124,
            "title": {
                "en": "Destination blocked"
            }
        },
        {
            "id": 125,
            "title": {
                "en": "Battery needs replacement"
            }
        },
        {
            "id": 126,
            "title": {
                "en": "Battery near end of life"
            }
        },
        {
            "id": 127,
            "title": {
                "en": "Battery problem"
            }
        },
        {
            "id": 128,
            "title": {
                "en": "Multiple reference stations detected"
            }
        },
        {
            "id": 129,
            "title": {
                "en": "Auxiliary cutting means blocked"
            }
        },
        {
            "id": 130,
            "title": {
                "en": "Imbalanced auxiliary cutting disc detected"
            }
        },
        {
            "id": 131,
            "title": {
                "en": "Lifted in link arm"
            }
        },
        {
            "id": 132,
            "title": {
                "en": "EPOS accessory missing"
            }
        },
        {
            "id": 133,
            "title": {
                "en": "Bluetooth com with CS failed"
            }
        },
        {
            "id": 134,
            "title": {
                "en": "Invalid SW configuration"
            }
        },
        {
            "id": 135,
            "title": {
                "en": "Radar problem"
            }
        },
        {
            "id": 136,
            "title": {
                "en": "Work area tampered"
            }
        },
        {
            "id": 137,
            "title": {
                "en": "High temperature in cutting motor, right"
            }
        },
        {
            "id": 138,
            "title": {
                "en": "High temperature in cutting motor, center"
            }
        },
        {
            "id": 139,
            "title": {
                "en": "High temperature in cutting motor, left"
            }
        },
        {
            "id": 141,
            "title": {
                "en": "Wheel brush motor problem"
            }
        },
        {
            "id": 143,
            "title": {
                "en": "Accessory power problem"
            }
        },
        {
            "id": 144,
            "title": {
                "en": "Boundary wire problem"
            }
        },
        {
            "id": 701,
            "title": {
                "en": "Connectivity problem"
            }
        },
        {
            "id": 702,
            "title": {
                "en": "Connectivity settings restored"
            }
        },
        {
            "id": 703,
            "title": {
                "en": "Connectivity problem"
            }
        },
        {
            "id": 704,
            "title": {
                "en": "Connectivity problem"
            }
        },
        {
            "id": 705,
            "title": {
                "en": "Connectivity problem"
            }
        },
        {
            "id": 706,
            "title": {
                "en": "Poor signal quality"
            }
        },
        {
            "id": 707,
            "title": {
                "en": "SIM card requires PIN"
            }
        },
        {
            "id": 708,
            "title": {
                "en": "SIM card locked"
            }
        },
        {
            "id": 709,
            "title": {
                "en": "SIM card not found"
            }
        },
        {
            "id": 710,
            "title": {
                "en": "SIM card locked"
            }
        },
        {
            "id": 711,
            "title": {
                "en": "SIM card locked"
            }
        },
        {
            "id": 712,
            "title": {
                "en": "SIM card locked"
            }
        },
        {
            "id": 713,
            "title": {
                "en": "Geofence problem"
            }
        },
        {
            "id": 714,
            "title": {
                "en": "Geofence problem"
            }
        },
        {
            "id": 715,
            "title": {
                "en": "Connectivity problem"
            }
        },
        {
            "id": 716,
            "title": {
                "en": "Connectivity problem"
            }
        },
        {
            "id": 717,
            "title": {
                "en": "SMS could not be sent"
            }
        },
        {
            "id": 724,
            "title": {
                "en": "Communication circuit board SW must be updated"
            }
        }
    ]
};