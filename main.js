/* jshint -W061 */ // no "eval" warnings
/* jslint node: true */
"use strict";

var herm=false;

// always required: utils
var utils = require('@iobroker/adapter-core');
var ip = require("ip");
var dgram = require('dgram');
var os = require('os');
var http = require('http');
var fs = require('fs');

// create the adapter object
var adapter; // = utils.Adapter('hausbus_de');

var DEFAULT_UDP_PORT = 5855;
var BROADCAST_SEND_IP = "192.255.255.255";
var BROADCAST_RECEIVE_IP = "0.0.0.0";

var CLASS_ID_CONTROLLER = 0;
var CLASS_ID_TASTER = 16;
var CLASS_ID_DIMMER = 17;
var CLASS_ID_ROLLLADEN = 18;
var CLASS_ID_SCHALTER = 19;
var CLASS_ID_LOGICAL_BUTTON = 20;
var CLASS_ID_LED = 21;
var CLASS_ID_RGB_DIMMER = 22;
var CLASS_ID_TEMPERATURSENSOR = 32;
var CLASS_ID_IR_SENSOR = 33;
var CLASS_ID_FEUCHTESENSOR = 34;
var CLASS_ID_HELLIGKEITSSENSOR = 39;
var CLASS_ID_ETHERNET = 162;
var CLASS_ID_ANALOGEINGANG = 36;

var MODUL_ID_32_IO=11;
var MODUL_ID_16_RELAIS_V2=10;
var MODUL_ID_16_RELAIS_V1=1;
var MODUL_ID_24_UP_IO=4;
var MODUL_ID_4_DIMMER=12;
var MODUL_ID_6_TASTER=3;
var MODUL_ID_4_TASTER=7;
var MODUL_ID_2_TASTER=8;
var MODUL_ID_1_TASTER=9;
var MODUL_ID_8_DIMMER=6;
var MODUL_ID_8_ROLLO=2;
var MODUL_ID_8_RELAIS=5;
var MODUL_ID_LAN_BRIDGE=15;
var MODUL_ID_RGB_DIMMER=16;
var MODUL_ID_12_RELAIS=17;

var MODULES = {}; // Alle Haus-Bus Module
var CLASSES = {}; // Alle Haus-Bus Klassen
var FIRMWARE_IDS = {}; // Firmwaretypen
var INSTANCES = {}; // Alle Haus-Bus Instanzen
var CONFIG_BITS = {}; // Konfigurations Bitmasken

var MY_DEVICE_ID = 12223;
var DATA_START = 15;

var CONTROLLER_RESEACH_DEVICES = "research_devices";
var CONTROLLER_ADMIN_FUNCTION = "admin_function";
var CONTROLLER_CHECK_FIRMWARE_UPDATES = "check_firmware_updates";

var CONTROLLER_FKT_STATE_ONLINE = "online";
var CONTROLLER_FKT_VERSION = "version";
var CONTROLLER_FKT_RESET = "reset";
var CONTROLLER_CFG_NEWEST_FIRMWARE = "newest_available_firmware";
var CONTROLLER_CFG_UPDATE_FIRMWARE = "update_firmware";

var ETHERNET_FKT_IP = "ip";
var ETHERNET_CFG_FIXED_IP_DHCP = "fixed_ip_or_dhcp";

var SCHALTER_FKT_ON_OFF = "on_off";
var SCHALTER_FKT_ON_DURATION_DELAY = "on_duration_delay";
var SCHALTER_FKT_OFF_DELAY = "off_delay";

var LED_FKT_ON_OFF = "on_off";
var LED_FKT_OFF_DELAY = "off_delay";
var LED_FKT_ON_BRIGHTNESS_DURATION_ONDELAY = "on_brightness_duration_ondelay";
var LED_FKT_BLINK_BRIGHTNESS_OFFTIME_ONTIME_QUANTITY = "blink_brightness_offtime_ontime_quantity";
var LED_FKT_MIN_BRIGHTNESS = "min_brightness";
var LED_CFG_INVERTED = "inverted";
var LED_CFG_TIMEBASE = "timebase";

var TEMP_FKT_TEMPERATUR = "temperature";
var TEMP_FKT_TEMPERATURE_STATE = "temperature_state";
var TEMP_CFG_LOWER_THRESHOLD = "lower_threshold";
var TEMP_CFG_UPPER_THRESHOLD = "upper_threshold";
var TEMP_CFG_MIN_REPORT_TIME = "min_report_time";
var TEMP_CFG_MAX_REPORT_TIME = "max_report_time";
var TEMP_CFG_REPORT_TIME_MULTIPLIER = "report_time_multiplier";
var TEMP_CFG_HYSTERESIS = "hysteresis";
var TEMP_CFG_CALIBRATION = "calibration";

var BRIGHT_FKT_BRIGHTNESS = "brightness";
var BRIGHT_FKT_BRIGHTNESS_STATE = "brightness_state";
var BRIGHT_CFG_LOWER_THRESHOLD = "lower_threshold";
var BRIGHT_CFG_UPPER_THRESHOLD = "upper_threshold";
var BRIGHT_CFG_MIN_REPORT_TIME = "min_report_time";
var BRIGHT_CFG_MAX_REPORT_TIME = "max_report_time";
var BRIGHT_CFG_REPORT_TIME_MULTIPLIER = "report_time_multiplier";
var BRIGHT_CFG_HYSTERESIS = "hysteresis";
var BRIGHT_CFG_CALIBRATION = "calibration";

var HUMIDITY_FKT_HUMIDITY = "humidity";
var HUMIDITY_FKT_HUMIDITY_STATE = "humidity_state";
var HUMIDITY_CFG_LOWER_THRESHOLD = "lower_threshold";
var HUMIDITY_CFG_UPPER_THRESHOLD = "upper_threshold";
var HUMIDITY_CFG_MIN_REPORT_TIME = "min_report_time";
var HUMIDITY_CFG_MAX_REPORT_TIME = "max_report_time";
var HUMIDITY_CFG_REPORT_TIME_MULTIPLIER = "report_time_multiplier";
var HUMIDITY_CFG_HYSTERESIS = "hysteresis";
var HUMIDITY_CFG_CALIBRATION = "calibration";

var ANALOG_FKT_VALUE = "value";
var ANALOG_CFG_MIN_REPORT_TIME = "min_report_time";
var ANALOG_CFG_MAX_REPORT_TIME = "max_report_time";
var ANALOG_CFG_REPORT_TIME_MULTIPLIER = "report_time_multiplier";
var ANALOG_CFG_HYSTERESIS = "hysteresis";
var ANALOG_CFG_CALIBRATION = "calibration";


var TASTER_FKT_ENABLE_DISABLE_EVENTS = "enable_disable_events";
var TASTER_FKT_DISABLE_EVENTS_TIMEOUT = "disable_events_timeout";
var TASTER_FKT_PRESSED = "event_pressed";
var TASTER_FKT_RELEASED = "event_released";
var TASTER_FKT_CLICKED = "event_clicked";
var TASTER_FKT_DOUBLE_CLICKED = "event_double_clicked";
var TASTER_FKT_HOLD_START = "event_hold_start";
var TASTER_FKT_HOLD_END = "event_hold_end";
var TASTER_FKT_STATE_CLOSED_OPEN = "state_closed_open";
var TASTER_CFG_HOLD_TIMEOUT = "hold_timeout";
var TASTER_CFG_DOUBLE_CLICK_TIMEOUT = "double_click_timeout";
var TASTER_CFG_INVERTED = "inverted";
var TASTER_CFG_LED_FEEDBACK = "led_feedback";
var TASTER_CFG_EVENT_PRESSED_ENABLED = "event_pressed_enabled";
var TASTER_CFG_EVENT_RELEASED_ENABLED = "event_released_enabled";
var TASTER_CFG_EVENT_CLICKED_ENABLED = "event_clicked_enabled";
var TASTER_CFG_EVENT_DOUBLE_CLICKED_ENABLED = "event_double_clicked_enabled";
var TASTER_CFG_EVENT_HOLD_START_ENABLED = "event_hold_start_enabled";
var TASTER_CFG_EVENT_HOLD_END_ENABLED = "event_hold_end_enabled";

var LOGICAL_BUTTON_FKT_ON_OFF = "on_off";
var LOGICAL_BUTTON_ON_BRIGHTNESS_DURATION = "on_brightness";
var LOGICAL_BUTTON_FKT_BLINK_BRIGHTNESS_OFFTIME_ONTIME_QUANTITY = "blink_brightness_offtime_ontime_quantity";
var LOGICAL_BUTTON_FKT_MIN_BRIGHTNESS = "min_brightness";

var IR_SENSOR_FKT_COMMAND = "command_code";

var ROLLO_FKT_START = "start";
var ROLLO_FKT_STOP = "stop";
var ROLLO_FKT_TOGGLE = "toggle";
var ROLLO_FKT_UPDATE_POSITION = "update_position";
var ROLLO_FKT_MOVEMENT_STATUS = "movement_status";
var ROLLO_FKT_POSITION = "actual_position";

var ROLLO_CFG_OPEN_TIME = "open_time";
var ROLLO_CFG_CLOSE_TIME = "close_time";
var ROLLO_CFG_INVERT = "invert_channels";
var ROLLO_CFG_SET_POSITION = "set_position";

var ROLLO_MOVEMENT_STOPPED = "STOPPED";
var ROLLO_MOVEMENT_UP = "UP";
var ROLLO_MOVEMENT_DOWN = "DOWN";


var DIMMER_FKT_START = "start";
var DIMMER_FKT_STOP = "stop";
var DIMMER_FKT_TOGGLE = "toggle";
var DIMMER_FKT_BRIGHTNESS = "brightness";
var DIMMER_FKT_BRIGHTNESS_DURATION = "brightness_duration";
var DIMMER_FKT_DIMMING_STATUS = "dimming_status";

var DIMMER_CFG_MODE = "dimmer_mode";
var DIMMER_MODE_LEADING_EDGE = "LEADING_EDGE";
var DIMMER_MODE_TRAILING_EDGE = "TRAILING_EDGE";
var DIMMER_MODE_SWITCH_ONLY = "SWITCH_ONLY";
var DIMMER_CFG_FADING_TIME = "fading_time";
var DIMMER_CFG_DIMMING_TIME = "dimming_time";
var DIMMER_CFG_DIMMING_RANGE_START = "dimming_range_start";
var DIMMER_CFG_DIMMING_RANGE_END = "dimming_range_end";

var DIMMER_DIMMING_IDLE = "IDLE";
var DIMMER_DIMMING_UP = "DIMMING_UP";
var DIMMER_DIMMING_DOWN = "DIMMING_DOWN";

var RGB_DIMMER_FKT_COLOR = "color";
var RGB_DIMMER_FKT_COLOR_DURATION = "color_duration";
//var RGB_DIMMER_FKT_DIMMING_STATUS = "dimming_status";

var RGB_DIMMER_CFG_FADING_TIME = "fading_time";

var RGB_DIMMER_DIMMING_IDLE = "IDLE";
var RGB_DIMMER_DIMMING_UP = "DIMMING_UP";
var RGB_DIMMER_DIMMING_DOWN = "DIMMING_DOWN";


var FIRMWARE_ID_AR8 = "AR8";
var FIRMWARE_ID_MS6 = "MS6";
var FIRMWARE_ID_SD6 = "SD6";
var FIRMWARE_ID_SD485 = "SD485";
var FIRMWARE_ID_SONOFF = "SONOFF";
var FIRMWARE_ID_S0_Reader = "S0_Reader";
var FIRMWARE_ID_ESP = "ESP";
var FIRMWARE_ID_HBC = "HBC";
var FIRMWARE_ID_ESP32 = "ESP32";
	
var CHANNEL_CONFIG = "Konfiguration";

var udpSocket;
var sendDelayTimer;
var sendQueue = [];
var queueControl = [];
var messageCounter=0;
var checkAliveControllerDeviceId; // Controller der gerade im checkAlive ist
var checkAliveTimer; // Timer der regelmäßig alle Controller anpingt
var checkAliveTimeoutTimer; // Timer der einen Controller nach einem checkAlive Ping auf offline setzt

var myObjectId =  getObjectId(MY_DEVICE_ID, CLASS_ID_CONTROLLER, 1);

var ioBrokerStates = {}; // Alle an IO Broker veröffentlichte States
var firmwareTypes = {};
var moduleTypes = {};
var moduleVersions = {};
var onlineVersions = {};
var objectIds = {};
var stateTypes = {};
var configurations = {};
var pongCallback = {};

function startAdapter(options) 
{
    options = options || {};
    Object.assign(options, {name: 'hausbus_de'});
    adapter = new utils.Adapter(options);

    // unloading
    adapter.on('unload', function (callback) 
    {
       try 
       {
         if (checkAliveTimeoutTimer) clearTimeout(checkAliveTimeoutTimer);
         if (checkAliveTimer) clearTimeout(checkAliveTimer);
         if (sendDelayTimer) clearInterval(sendDelayTimer);
         if (udpSocket) udpSocket.close();
       } 
       catch (e) 
       {
         warn('Error during unload: ' + e);
       }

       callback();
    });


    // startup
    adapter.on('ready', function () 
    {
       main();
    });
	
    // is called if a subscribed state changes
    adapter.on('stateChange', function (id, state) 
    {
      // Warning: state can be null if it was deleted!
      if (!id || !state) return;
    
      //debug('stateChange ' + id + ' ' + state+" ack = "+state.ack);
    
      //stateChange hausbusde.0.1136.CONTROLLER.1.online
      if (id.startsWith(adapter.namespace + '.')) 
      {
	  var newValue = state.val;	
		
	  var stateName = getStateFromIoBrokerId(id);
	  if (stateName!="")
	  {
		  debug('stateChange ' + id + ' - ' + stateName+": "+ioBrokerStates[id]+" -> "+newValue);
		  ioBrokerStates[id]=newValue;
	  }
	  else warn("Unbekannter Name "+id);
	 
   	  if (state.ack) return;
	
	  // Hier Methodenaufrufe
	  aFunctionCall(id, newValue);
      }
    });
	
  return adapter;
}

function main() 
{
  initModulesClassesInstances();

  // Socket um Broadcast zu empfangen
  udpSocket = dgram.createSocket('udp4');
  udpSocket.on('listening', function () 
  {
	udpSocket.setBroadcast(true);
	udpSocket.setMulticastLoopback(true);
	var address = udpSocket.address();
	debug('UDP broadcast server listening on ' + address.address + ":" + address.port);
  });

  udpSocket.on('message', handleIncomingMessage);
  udpSocket.bind(DEFAULT_UDP_PORT, BROADCAST_RECEIVE_IP);

  var parts = ip.address().split(".");

  var mask="";
  const ifaces = require('os').networkInterfaces();

  Object.keys(ifaces).forEach(dev => 
  {
    ifaces[dev].filter(details => 
	{
      if (details.family === 'IPv4' && details.internal === false) 
	  {
        mask = details.netmask;
		return;
      }
    });
  });
  
  /*if (mask=="255.255.0.0") BROADCAST_SEND_IP = parts[0]+"."+parts[1]+".255.255";
  else if (mask=="255.0.0.0") BROADCAST_SEND_IP = parts[0]+".255.255.255";
  else */
  BROADCAST_SEND_IP = parts[0]+"."+parts[1]+"."+parts[2]+".255";
  debug( "BROADCAST_SEND_IP: "+BROADCAST_SEND_IP );

  adapter.getStates('*', function (err, obj) 
  {
    if (err) error('Error reading states: ' + err);
    else 
    {
  	  if (obj) 
	  {
  	    for (var key in obj) 
	    {
		  if (! obj.hasOwnProperty(key)) continue;
		  if (obj[key] !== null) 
		  {
		    // hausbusde.0.1000.online - object(7): { val: boolean: tru
		    ioBrokerStates[key] = obj[key].val;
		  }	
		  else debug ("property with no value: "+key);
	    }
	  }
	  
	  adapter.subscribeStates(adapter.namespace+".*");
	  adapter.setObjectNotExists(adapter.namespace+"."+CONTROLLER_RESEACH_DEVICES,{type: 'state',common: {name: CONTROLLER_RESEACH_DEVICES,type: "boolean",role: "button"},native: {}});
	  adapter.setObjectNotExists(adapter.namespace+"."+CONTROLLER_ADMIN_FUNCTION,{type: 'state',common: {name: CONTROLLER_ADMIN_FUNCTION,type: "string",role: "switch"},native: {}});

	  searchAllDevices();
	  //setTimeout(readFirmwareVersions, 10000);
	  checkAliveTimer = setTimeout(checkAlive, 20000); // alle 20 Sekunden pingen wir einen Controller an
    }
  });
}

function readFirmwareVersions()
{
  require('dns').resolve('www.haus-bus.de', function(err) {
    if (err) debug("no internet connection");
    else 
    {
	  debug("internet connection is available");
	  
      for (var firmwareId in FIRMWARE_IDS) 
      {
    	  var firmwareName = FIRMWARE_IDS[firmwareId];
	      if (typeof firmwareName!="string" || firmwareName.length<2)
    		  continue;
	      if (firmwareName == FIRMWARE_ID_S0_Reader)
    		  continue;

	      readFirmwareVersionFor(firmwareId, firmwareName);
	  }
    }
  });
}

function readFirmwareVersionFor(firmwareId, firmwareName)
{
    var options = 
    {
      host: 'www.haus-bus.de',
      path: '/'+firmwareName+'.chk'
    };
   
    http.request(options, function(response) 
    {
      var str = '';
      response.on('data', function (chunk) {str += chunk;});
      response.on('end', function () 
      {
		var parts = str.split("-");
		  
		if (typeof onlineVersions[firmwareId]=="undefined") onlineVersions[firmwareId]={};
		onlineVersions[firmwareId].version = (""+parts[0]).trim();
		onlineVersions[firmwareId].date = (""+parts[1]).trim();
		info("Online version "+firmwareName+": "+str);
		  
        for (var deviceId in firmwareTypes) 
        {
		   var myFirmwareId = FIRMWARE_IDS[firmwareTypes[deviceId]];
		   if (myFirmwareId == firmwareId)
		   {
		     var myId = getIoBrokerId(deviceId,CLASS_ID_CONTROLLER,1,CONTROLLER_CFG_NEWEST_FIRMWARE, CHANNEL_CONFIG);
		     setStateIoBroker(myId, firmwareName+" "+str, CHANNEL_CONFIG);
		   }
		}
	  });
	}).end();
}	  

function checkAlive()
{
  var stateSize = Object.keys(ioBrokerStates).length;
  if (stateSize!=0)
  {
	  var newCheckControllerDeviceId;
	  var newCheckControllerIoBrokerId;
 
      // Wenn wir bereits einen Controller geprüft haben, suchen wir den nächsten in der Liste
	  // Oder springen wieder an den Anfang, wenn wir dahinter keinen finden
      if (checkAliveControllerDeviceId) 
	  {
		debug("checkAliveControllerDeviceId is "+checkAliveControllerDeviceId);
		
	    var found=false;
		for (var id in ioBrokerStates) 
	    {
		  if (!id.includes("."+CONTROLLER_FKT_STATE_ONLINE)) continue;
		  
		  var actDeviceId = getDeviceIdFromIoBrokerId(id);
		  
		  // Wir haben einen Controller nach dem zuletzt geprüften gefunden
		  if (found) 
		  {
			 if (actDeviceId!=checkAliveControllerDeviceId)
			 {
			   newCheckControllerDeviceId = actDeviceId;
			   newCheckControllerIoBrokerId = id;
			   break;
			 }
		  }
		  else if (actDeviceId==checkAliveControllerDeviceId)
			 found=true;
        }
	  }
	 
	  // Sonst nehmen wir wieder den ersten in der Liste
	  if (!newCheckControllerDeviceId)
	  {
	    for (var id in ioBrokerStates)  
	    {
		  if (!id.includes("."+CONTROLLER_FKT_STATE_ONLINE)) continue;
		  
		  var actDeviceId = getDeviceIdFromIoBrokerId(id);
		  newCheckControllerDeviceId=actDeviceId;
		  newCheckControllerIoBrokerId = id;
		  break;
	    }
	  }
	 
	  if (newCheckControllerDeviceId)
	  {
	    hwControllerPing(getObjectId(newCheckControllerDeviceId, CLASS_ID_CONTROLLER,1));
	    checkAliveTimeoutTimer = setTimeout(function () {checkAliveTimeoutOccured(newCheckControllerIoBrokerId)}, 3000); // offline nach 3 Sekunden
	    checkAliveControllerDeviceId = newCheckControllerDeviceId;
	  }
  }
  checkAliveTimer = setTimeout(checkAlive, 30000); // alle 30 Sekunden pingen wir einen Controller an
}

function checkAliveTimeoutOccured(ioBrokerId)
{
   debug("checkAliveTimeoutOccured "+ioBrokerId);
   setStateIoBroker(ioBrokerId, false);
}

function checkAliveOk(deviceId)
{
   if (checkAliveTimeoutTimer && checkAliveControllerDeviceId ==deviceId)
   {
	 debug("checkAlive ok for "+deviceId);
	 clearInterval(checkAliveTimeoutTimer);
   }
}

function sendUdpDatagram(message) 
{
    sendQueue.push(message);
    
	// Wenn die Queue leer ist, senden wir sofort, ansonsten übernimmt das der Timer
    if (!sendDelayTimer) 
        sendNextQueueDatagram();
}

function sendNextQueueDatagram() 
{
	// Wenn die Queue leer ist, löschen wir den Timer
    if (sendQueue.length === 0) 
    {
        clearInterval(sendDelayTimer);
        sendDelayTimer = null;
        return;
    }
   
    var message = sendQueue.shift();
    
    if (udpSocket) 
    {
        udpSocket.send(message, 0, message.length, DEFAULT_UDP_PORT, BROADCAST_SEND_IP, function (err, bytes) 
        {
            if (err) 
            {
                error('UDP send error for ' + BROADCAST_SEND_IP + ':' + DEFAULT_UDP_PORT + ': ' + err);
                return;
            }
            
            debug('Sent "' + message + '" to ' + BROADCAST_SEND_IP + ':' + DEFAULT_UDP_PORT);
        });
    }


    // wir schauen wie viele Nachrichten, wir innerhalb der letzten 100ms versendet haben	
	var now = Date.now();
	var min = now-100;
	queueControl.forEach(function(item, index, object) 
	{
        if (item<min) object.shift();
    });

    // Altes Interval löschen, um es anschließend auf einen neuen Wert zu setzen
    clearInterval(sendDelayTimer);	
	
	// Bei mehr als 3 Nachrichten, machen wir eine 50ms Pause, sonst nur 10 ms
	if (queueControl.length>3)
	{
 	    debug("controling bus speed");
		sendDelayTimer = setInterval(sendNextQueueDatagram, 50);
	}
   	else sendDelayTimer = setInterval(sendNextQueueDatagram, 10);

    queueControl.push(Date.now());
}

function setStateIoBroker(id, value, forceUpdate=false) 
{
	if (typeof ioBrokerStates[id]!="undefined" && (""+ioBrokerStates[id]!=""+value || forceUpdate))
	{
	  var type = stateTypes[id];
	  debug("setState "+id+" "+ioBrokerStates[id]+" -> "+value+" - forceUpdate = "+forceUpdate+" - "+type);
      ioBrokerStates[id] = value;
	  if (type=="number") value=Number(value);
	  else if (type=="boolean") value=Boolean(value);
	  
      adapter.setState(id, {val: value, ack: true});
	}
	//else warn("übersprungen: setState "+id+" "+ioBrokerStates[id]+" -> "+value);
}

// handle incomming messages
function handleIncomingMessage(message, remote) 
{
    debug('UDP datagram from ' + remote.address + ':' + remote.port + ': length = '+message.length);
    
    try 
    {
		if (message.length<3) return;
		// Bytewurst loggen
		//debug(bytesToDebugString(message,0,message.length));
		
		// Falscher Header ?
		if (message[0]!=0xef || message[1]!=0xef)
		{
			debug('Non Haus-Bus header');
			return;
		}
		
		// message[2] = Kontroll Byte
		// message[3] = Messagecounter
	    
		var sender = bytesToDword(message,4);
        var receiver = bytesToDword(message,8);
		var dataLength = bytesToWord(message, 12)-1;
		var functionId = message[14];
		
		var deviceIdSender = getDeviceId(sender);
		if (herm && deviceIdSender!=21336 && deviceIdSender!=1136 && deviceIdSender!=1247 && deviceIdSender!=1271) return; // test

		var classIdSender = getClassId(sender);

        // sender: 74453970, receiver: 801046529, functionId: 129, dataLength: 3, classIdSender: 19
		debug('sender: '+sender+", receiver: "+receiver+", functionId: "+functionId+", dataLength: "+dataLength+", classIdSender: "+classIdSender);
		
		var senderDeviceId = getDeviceId(sender);
		checkAliveOk(senderDeviceId);
		
		setStateIoBroker(getIoBrokerId(senderDeviceId,CLASS_ID_CONTROLLER,1,CONTROLLER_FKT_STATE_ONLINE), true);
		
		if (classIdSender == CLASS_ID_CONTROLLER)
		{
			if (functionId==128) hwControllerReceivedModuleId(sender, receiver, message, dataLength);		
			else if (functionId==129) hwControllerReceivedRemoteObjects(sender, receiver, message, dataLength);		
			else if (functionId==202) hwControllerReceivedEvStarted(sender);
			else if (functionId==131) hwControllerReceivedConfiguration(sender, receiver, message, dataLength);
			else if (functionId==199) hwControllerReceivedPong(sender);
		}
        else if (classIdSender == CLASS_ID_FEUCHTESENSOR)
		{
			if (functionId==128) hwFeuchteSensorReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129 || functionId==203) hwFeuchteSensorReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwFeuchteSensorReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_ANALOGEINGANG)
		{
			if (functionId==128) hwAnalogInputReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129 || functionId==203) hwAnalogInputReceivedStatus(sender, receiver, message, dataLength);
			//else if (functionId>=200 && functionId<300) hwAnalogInputReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
        else if (classIdSender == CLASS_ID_HELLIGKEITSSENSOR)
		{
			if (functionId==128) hwHelligkeitssensorReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129 || functionId==203) hwHelligkeitssensorReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwHelligkeitssensorReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
        else if (classIdSender == CLASS_ID_LED)
		{
			if (functionId==128) hwLedReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129) hwLedReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwLedReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
        else if (classIdSender == CLASS_ID_LOGICAL_BUTTON)
		{
			if (functionId==129) hwLogicalButtonReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwLogicalButtonReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_SCHALTER)
		{
			if (functionId==128) hwSchalterReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129) hwSchalterReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwSchalterReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_TASTER)
		{
			if (functionId==128) hwTasterReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129) hwTasterReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwTasterReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_ROLLLADEN)
		{
			if (functionId==128) hwRolloReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129) hwRolloReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwRolloReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_DIMMER)
		{
			if (functionId==128) hwDimmerReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129) hwDimmerReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwDimmerReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_RGB_DIMMER)
		{
			if (functionId==128) hwRgbDimmerReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129) hwRgbDimmerReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwRgbDimmerReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_IR_SENSOR)
		{
			if (functionId>=200 && functionId<300) hwIrSensorReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_TEMPERATURSENSOR)
		{
			if (functionId==128) hwTemperatursensorReceivedConfiguration(sender, receiver, message, dataLength);		
			else if (functionId==129 || functionId==203) hwTemperatursensorReceivedStatus(sender, receiver, message, dataLength);
			else if (functionId>=200 && functionId<300) hwTemperatursensorReceivedEvents(sender, receiver, functionId, message, dataLength);
		}
		else if (classIdSender == CLASS_ID_ETHERNET)
		{
			if (functionId==129) hwEthernetReceivedIp(sender, receiver, message, dataLength);
			else if (functionId==128) hwEthernetReceivedConfiguration(sender, receiver, message, dataLength);
		}
    } 
	catch (e) 
    {
      error('error handling incoming udp message: ' + e+"\n"+e.stack);
    }
}

function searchAllDevices()
{
	info("Searching all Haus-Bus.de devices");
	hwControllerGetModuleId(getObjectId(0,CLASS_ID_CONTROLLER,1));
}

function adminFunction(param)
{
	var receiverObjectId = getObjectId(param, CLASS_ID_ETHERNET, 1)
	info("adminFunction: "+param+", ReceiverID: "+receiverObjectId);
	
	if (param>0)
	{
	  var data = [];
	  var pos=0;
	  data[pos++]=1; // Funktion ID
	  data[pos++]=192;
	  data[pos++]=168;
	  data[pos++]=178;
	  data[pos++]=254;
	  data[pos++]=4;
	
	  wordToByteArray(5855, data, pos); pos+=2;

	  data[pos++]=0;
	  data[pos++]=0;
	  data[pos++]=0;
	  data[pos++]=0;
	
	  sendHausbusUdpMessage(receiverObjectId, data, myObjectId,9);
	}
} 

function aFunctionCall(ioBrokerId, newValue)
{
  var state = getStateFromIoBrokerId(ioBrokerId);	
  
  if (state == CONTROLLER_RESEACH_DEVICES)
  {
    info("Call: "+CONTROLLER_RESEACH_DEVICES); 
    searchAllDevices();
	return;
  }
  
  if (state == CONTROLLER_ADMIN_FUNCTION)
  {
    info("Call: "+CONTROLLER_ADMIN_FUNCTION); 
	var params = getMyParams(newValue, 2);	
	var id = params[0];
	var value = params[1];
	if (id==42)	adminFunction(value);
	return;
  }
  
  if (state == CONTROLLER_CHECK_FIRMWARE_UPDATES)
  {
    info("Call: "+CONTROLLER_CHECK_FIRMWARE_UPDATES); 
    readFirmwareVersions();
	return;
  }
  
  var objectId = objectIds[ioBrokerId];
  if (typeof objectId=="undefined")
  {
	  warn("Call on unknown id "+ioBrokerId);
	  return;
  }
  
  var deviceId = getDeviceId(objectId);
  var classId = getClassId(objectId);
  
  // Call: object=1136.Controller.1, state=.reset, newValue = true 
  info("Call: state="+state+", newValue = "+newValue+" -> "+objectIdToString(objectId)); 

  if (classId == CLASS_ID_SCHALTER)
  {
    if (state == SCHALTER_FKT_ON_OFF)
	{
	  if (newValue == true) hwSchalterOn(0, 0, objectId);
	  else if (newValue == false) hwSchalterOff(0, objectId);
    }
	else if (state == SCHALTER_FKT_ON_DURATION_DELAY)
	{
	  var params = getMyParams(newValue, 2);	
	  var duration = params[0];
	  var delay = params[1];

	  hwSchalterOn(duration, delay, objectId);
    }
	else if (state == SCHALTER_FKT_OFF_DELAY) hwSchalterOff(newValue, objectId);
  }
  else if (classId == CLASS_ID_TASTER)
  {
     if (state == TASTER_FKT_ENABLE_DISABLE_EVENTS) hwTasterEnableEvents(newValue ? "TRUE":"FALSE", 0, objectId);
	 else if (state == TASTER_FKT_DISABLE_EVENTS_TIMEOUT) hwTasterEnableEvents("FALSE", newValue, objectId);
	 else if (state == TASTER_CFG_HOLD_TIMEOUT || 
	          state == TASTER_CFG_DOUBLE_CLICK_TIMEOUT || 
			  state == TASTER_CFG_INVERTED || 
			  state == TASTER_CFG_LED_FEEDBACK || 
			  state == TASTER_CFG_EVENT_PRESSED_ENABLED || 
			  state == TASTER_CFG_EVENT_RELEASED_ENABLED || 
			  state == TASTER_CFG_EVENT_CLICKED_ENABLED || 
			  state == TASTER_CFG_EVENT_DOUBLE_CLICKED_ENABLED ||
			  state == TASTER_CFG_EVENT_HOLD_START_ENABLED ||
			  state == TASTER_CFG_EVENT_HOLD_END_ENABLED)
		 hwTasterSetConfiguration(state, newValue, objectId);
  }
  else if (classId == CLASS_ID_ROLLLADEN)
  {
     if (state == ROLLO_FKT_POSITION) hwRolloMoveToPosition(newValue, objectId);
	 else if (state == ROLLO_FKT_START) hwRolloStart(newValue, objectId);
	 else if (state == ROLLO_FKT_TOGGLE) hwRolloToggle(objectId);
	 else if (state == ROLLO_FKT_STOP) hwRolloStop(objectId);
	 else if (state == ROLLO_CFG_SET_POSITION)
	 {
		 hwRolloSetPosition(newValue, objectId);
		 hwRolloGetStatus(objectId);
	 }
	 else if (state == ROLLO_FKT_UPDATE_POSITION) hwRolloGetStatus(objectId);
	 else if (state == ROLLO_CFG_CLOSE_TIME || 
	          state == ROLLO_CFG_OPEN_TIME || 
			  state == ROLLO_CFG_INVERT)
		 hwRolloSetConfiguration(state, newValue, objectId);
  }
  else if (classId == CLASS_ID_DIMMER)
  {
     if (state == DIMMER_FKT_BRIGHTNESS) hwDimmerSetBrightness(newValue,0, objectId);
     else if (state == DIMMER_FKT_BRIGHTNESS_DURATION)
	 {
		var params = getMyParams(newValue, 2);	
	    var brightness = params[0];
	    var duration = params[1];
		
		hwDimmerSetBrightness(brightness, duration, objectId);
	 }
	 else if (state == DIMMER_FKT_START) hwDimmerStart(newValue, objectId);
	 else if (state == DIMMER_FKT_STOP) hwDimmerStop(objectId);
	 else if (state == DIMMER_FKT_TOGGLE) hwDimmerToggle(objectId);
	 else if (state == DIMMER_CFG_DIMMING_RANGE_END || 
	          state == DIMMER_CFG_DIMMING_RANGE_START || 
			  state == DIMMER_CFG_DIMMING_TIME ||
			  state == DIMMER_CFG_FADING_TIME)
		 hwDimmerSetConfiguration(state, newValue, objectId);
  }
  else if (classId == CLASS_ID_RGB_DIMMER)
  {
     if (state == RGB_DIMMER_FKT_COLOR)
	 {
 		 var params = getMyParams(newValue, 3);	
	     var red = params[0];
	     var green = params[1];
	     var blue = params[2];

		 hwRgbDimmerSetColor(red, green, blue,0, objectId);
	 }
     else if (state == RGB_DIMMER_FKT_COLOR_DURATION)
	 {
 		 var params = getMyParams(newValue, 4);	
	     var red = params[0];
	     var green = params[1];
	     var blue = params[2];
	     var duration = params[3];

		 hwRgbDimmerSetColor(red, green, blue,duration, objectId);
	 }
	 else if (state == RGB_DIMMER_CFG_FADING_TIME) hwRgbDimmerSetConfiguration(state, newValue, objectId);
  }
  else if (classId == CLASS_ID_CONTROLLER)
  {
    if (state == CONTROLLER_FKT_RESET) hwControllerReset(objectId);
	else if (state == ETHERNET_CFG_FIXED_IP_DHCP) hwEthernetSetConfiguration(newValue, getObjectId(deviceId, CLASS_ID_ETHERNET,1));
	else if (state == CONTROLLER_CFG_UPDATE_FIRMWARE)
	{
		if (newValue=="UPDATE") hwControllerUpdateFirmware(objectId);
		else error("Invalid value. To update firmware please enter 'UPDATE'.");
	}
  }
  else if (classId == CLASS_ID_LED)
  {
    if (state == LED_FKT_ON_OFF)
	{
	  if (newValue == true) hwLedOn(100, 0, 0, objectId);
	  else if (newValue == false) hwLedOff(0, objectId);
    }
	else if (state == LED_CFG_INVERTED) hwLedSetConfiguration(state, newValue, objectId);
	else if (state == LED_CFG_TIMEBASE) hwLedSetConfiguration(state, newValue, objectId);
	else if (state == LED_FKT_ON_BRIGHTNESS_DURATION_ONDELAY)
	{
	  var params = getMyParams(newValue, 3);
	  var brightness = params[0];
	  var duration  = params[1];
	  var delay = params[2];
		  
	  hwLedOn(brightness, duration, delay, objectId);
    }
	else if (state == LED_FKT_OFF_DELAY) hwLedOff(newValue, objectId);
	else if (state == LED_FKT_MIN_BRIGHTNESS) hwLedMinBrightness(newValue, objectId);
	else if (state == LED_FKT_BLINK_BRIGHTNESS_OFFTIME_ONTIME_QUANTITY)
	{
      var params = getMyParams(newValue, 4);
	  var brightness = params[0];
	  var offTime = params[1];
	  var onTime = params[2];
	  var quantity = params[3];
	  
	  if (brightness==0) hwLedOff(0, objectId);
	  else hwLedBlink(brightness, offTime, onTime, quantity, objectId);
    }
  }
  else if (classId == CLASS_ID_LOGICAL_BUTTON)
  {
    if (state == LOGICAL_BUTTON_FKT_ON_OFF)
	{
	  if (newValue == true) hwLogicalButtonOn(100, 0, objectId);
	  else if (newValue == false) hwLogicalButtonOff(objectId);
    }
	else if (state == LOGICAL_BUTTON_ON_BRIGHTNESS_DURATION)
	{
		newValue = parseInt(newValue);
		if (newValue==0) hwLogicalButtonOff(objectId);
		else hwLogicalButtonOn(newValue, 0, objectId);
		hwLedGetStatus(objectId);
	}
	else if (state == LOGICAL_BUTTON_FKT_MIN_BRIGHTNESS) hwLogicalButtonSetMinBrightness(newValue, 0, objectId);
	else if (state == LOGICAL_BUTTON_FKT_BLINK_BRIGHTNESS_OFFTIME_ONTIME_QUANTITY)
	{
      var params = getMyParams(newValue, 4);
	  var brightness = params[0];
	  var offTime = params[1];
	  var onTime = params[2];
	  var quantity = params[3];
	  
	  if (brightness==0) hwLogicalButtonOff(0, objectId);
	  else hwLogicalButtonBlink(brightness, offTime, onTime, quantity, objectId);
    }
  }
  else if (classId == CLASS_ID_TEMPERATURSENSOR)
  {
    if (state == TEMP_CFG_CALIBRATION || 
	    state == TEMP_CFG_HYSTERESIS || 
		state == TEMP_CFG_LOWER_THRESHOLD || 
		state == TEMP_CFG_MAX_REPORT_TIME || 
		state == TEMP_CFG_MIN_REPORT_TIME || 
		state == TEMP_CFG_REPORT_TIME_MULTIPLIER || 
		state == TEMP_CFG_UPPER_THRESHOLD)
	 hwTemperatursensorSetConfiguration(state, newValue, objectId);
  }
  else if (classId == CLASS_ID_HELLIGKEITSSENSOR)
  {
    if (state == BRIGHT_CFG_CALIBRATION || 
	    state == BRIGHT_CFG_HYSTERESIS || 
		state == BRIGHT_CFG_LOWER_THRESHOLD || 
		state == BRIGHT_CFG_MAX_REPORT_TIME || 
		state == BRIGHT_CFG_MIN_REPORT_TIME || 
		state == BRIGHT_CFG_REPORT_TIME_MULTIPLIER || 
		state == BRIGHT_CFG_UPPER_THRESHOLD)
	 hwHelligkeitssensorSetConfiguration(state, newValue, objectId);
  }
  else if (classId == CLASS_ID_ANALOGEINGANG)
  {
    if (state == ANALOG_CFG_CALIBRATION || 
	    state == ANALOG_CFG_HYSTERESIS || 
		state == ANALOG_CFG_MAX_REPORT_TIME || 
		state == ANALOG_CFG_MIN_REPORT_TIME || 
		state == ANALOG_CFG_REPORT_TIME_MULTIPLIER)
	 hwAnalogInputSetConfiguration(state, newValue, objectId);
  }
  else if (classId == CLASS_ID_FEUCHTESENSOR)
  {
    if (state == HUMIDITY_CFG_CALIBRATION || 
	    state == HUMIDITY_CFG_HYSTERESIS || 
		state == HUMIDITY_CFG_LOWER_THRESHOLD || 
		state == HUMIDITY_CFG_MAX_REPORT_TIME || 
		state == HUMIDITY_CFG_MIN_REPORT_TIME || 
		state == HUMIDITY_CFG_REPORT_TIME_MULTIPLIER || 
		state == HUMIDITY_CFG_UPPER_THRESHOLD)
	 hwFeuchteSensorSetConfiguration(state, newValue, objectId);
  }
}

function getMyParams(value, nrParams)
{
  var result = {};
  for (var i=0;i<nrParams;i++)
  {
	result[i]=0;
  }

  if (typeof value == "string")
  {
     var params = value.split(",");
     for (var i=0;i<nrParams;i++)
     {
  	    if (typeof params[i]!="undefined") result[i] = parseInt(params[i]);
	 }
  }
  
  return result;
}

function getStateFromIoBrokerId(ioBrokerId)
{
	return ioBrokerId.substring(ioBrokerId.lastIndexOf(".")+1);
}

function getDeviceIdFromIoBrokerId(ioBrokerId)
{
	var parts = ioBrokerId.split(".");
	if (parts.length>2) return parts[2];
	return 1;
}

function hwControllerReceivedEvStarted(receiverObjectId)
{
  info("controller started <- "+objectIdToString(receiverObjectId));		
  hwControllerGetModuleId(receiverObjectId);
}


// TEMPERATURSENSOR
function hwTemperatursensorReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var state="";
	if (functionId==200) state="COLD";
	else if (functionId==201) state="NORMAL";
	else if (functionId==202) state="HOT";
	
	info("temperature sensor event "+state+" <- "+objectIdToString(sender));	
	
	if (state!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_FKT_TEMPERATURE_STATE);
	  setStateIoBroker(myId, state);
	}
}

function hwTemperatursensorGetStatus(receiverObjectId)
{
	debug("temperatursensorGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwTemperatursensorReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var celsius = message[pos++];
	if (celsius>127) celsius-=256;
	
	var centiCelsius = message[pos++];
	if (centiCelsius<10) centiCelsius="0"+centiCelsius;
	
	var temperature = celsius+"."+centiCelsius;

    var byteLastEvent = message[pos++];
	var state="";
	if (byteLastEvent==200) state="COLD";
	else if (byteLastEvent==201) state="NORMAL";
	if (byteLastEvent==202) state="HOT";
	
	info("temperature sensor status: temperature = "+temperature+", state = "+state+" <- "+objectIdToString(sender));
	
    var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_FKT_TEMPERATUR);
	setStateIoBroker(myId, temperature);

	if (state!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_FKT_TEMPERATURE_STATE);
	  setStateIoBroker(myId, state);
	}
}

function hwTemperatursensorGetConfiguration(receiverObjectId)
{
	debug("temperatursensorGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwTemperatursensorReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

    var lowerThreshold = byteToSByte(message[pos++]);
	var lowerThresholdFraction = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_CFG_LOWER_THRESHOLD, CHANNEL_CONFIG);
	setStateIoBroker(myId, lowerThreshold+"."+lowerThresholdFraction);

    var upperThreshold = byteToSByte(message[pos++]);
	var upperThresholdFraction = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_CFG_UPPER_THRESHOLD, CHANNEL_CONFIG);
	setStateIoBroker(myId, upperThreshold+"."+upperThresholdFraction);

	var reportTimeBase = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_CFG_REPORT_TIME_MULTIPLIER, CHANNEL_CONFIG);
	setStateIoBroker(myId, reportTimeBase);
	
	var minReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_CFG_MIN_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, minReportTime);

	var maxReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_CFG_MAX_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, maxReportTime);
	
	var hysteresis = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_CFG_HYSTERESIS, CHANNEL_CONFIG);
	setStateIoBroker(myId, hysteresis/10);

	var calibration = byteToSByte(message[pos++]);
	var myId = getIoBrokerId(deviceId, CLASS_ID_TEMPERATURSENSOR, instanceId, TEMP_CFG_CALIBRATION, CHANNEL_CONFIG);
	setStateIoBroker(myId, calibration/10);
	
    configurations[sender]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};
	
	debug("temp configuration: "+dump(configurations[sender])+" <- "+objectIdToString(sender));
}

function hwTemperatursensorSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
    var lowerThreshold = 0;
    var lowerThresholdFraction = 0;
	var upperThreshold = 0;
	var upperThresholdFraction = 0;
	var reportTimeBase = 0;
	var minReportTime = 0;
	var maxReportTime = 0;
	var hysteresis = 0;
	var calibration = 0;

	var configuration = configurations[receiverObjectId];
	if (typeof configuration != "undefined")
	{
      lowerThreshold = parseInt(configuration.lowerThreshold);
	  lowerThresholdFraction = parseInt(configuration.lowerThresholdFraction);
	  upperThreshold = parseInt(configuration.upperThreshold);
	  upperThresholdFraction = parseInt(configuration.upperThresholdFraction);
	  reportTimeBase = parseInt(configuration.reportTimeBase);
	  minReportTime = parseInt(configuration.minReportTime);
	  maxReportTime = parseInt(configuration.maxReportTime);
	  hysteresis = parseInt(configuration.hysteresis);
	  calibration = parseInt(configuration.calibration);
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwTemperatursensorGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwTemperatursensorSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
			  
	if (configKey == TEMP_CFG_CALIBRATION) calibration=parseInt(newValue*10);
	else if (configKey == TEMP_CFG_HYSTERESIS) hysteresis=parseInt(newValue*10);
	else if (configKey == TEMP_CFG_MAX_REPORT_TIME) maxReportTime=parseInt(newValue);
	else if (configKey == TEMP_CFG_MIN_REPORT_TIME) minReportTime=parseInt(newValue);
	else if (configKey == TEMP_CFG_REPORT_TIME_MULTIPLIER) reportTimeBase=parseInt(newValue);
	else if (configKey == TEMP_CFG_LOWER_THRESHOLD)
	{
		lowerThreshold = parseInt(newValue);
		lowerThresholdFraction = Math.round((parseFloat(newValue)-lowerThreshold)*100);
	}
	else if (configKey == TEMP_CFG_UPPER_THRESHOLD)
	{
		upperThreshold = parseInt(newValue);
		upperThresholdFraction = Math.round((parseFloat(newValue)-upperThreshold)*100);
	}


    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=sByteToByte(lowerThreshold);
	data[pos++]=lowerThresholdFraction;
	data[pos++]=sByteToByte(upperThreshold);
	data[pos++]=upperThresholdFraction;
	data[pos++]=reportTimeBase;
	data[pos++]=minReportTime;
	data[pos++]=maxReportTime;
	data[pos++]=hysteresis;
	data[pos++]=calibration;
	data[pos++]=0; // deltaSensorId
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
    configurations[receiverObjectId]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};	
	
	debug("temperaturSensorSetConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// Helligkeitssensor
function hwHelligkeitssensorReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var state="";
	if (functionId==200) state="DARK";
	else if (functionId==201) state="NORMAL";
	else if (functionId==202) state="BRIGHT";
	
	info("brightness sensor event "+state+" <- "+objectIdToString(sender));	
	
	if (state!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_FKT_BRIGHTNESS_STATE);
	  setStateIoBroker(myId, state);
	}
}

function hwHelligkeitssensorGetStatus(receiverObjectId)
{
	debug("helligkeitssensorGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwHelligkeitssensorReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var brightness = message[pos++];
	
	var centiBrightness = message[pos++];
	if (centiBrightness<10) centiBrightness="0"+centiBrightness;
	
	var brightness = brightness+"."+centiBrightness;

    var byteLastEvent = message[pos++];
	
	var state="";
	if (byteLastEvent==200) state="DARK";
	else if (byteLastEvent==201) state="NORMAL";
	if (byteLastEvent==202) state="BRIGHT";
	
	info("brightness sensor status: "+brightness+", state = "+state+" <- "+objectIdToString(sender));
	
    var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_FKT_BRIGHTNESS);
	setStateIoBroker(myId, brightness);

	if (state!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_FKT_BRIGHTNESS_STATE);
	  setStateIoBroker(myId, state);
	}
}

function hwHelligkeitssensorGetConfiguration(receiverObjectId)
{
	debug("helligkeitssensorGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwHelligkeitssensorReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

    var lowerThreshold = byteToSByte(message[pos++]);
	var lowerThresholdFraction = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_CFG_LOWER_THRESHOLD, CHANNEL_CONFIG);
	setStateIoBroker(myId, lowerThreshold+"."+lowerThresholdFraction);

    var upperThreshold = byteToSByte(message[pos++]);
	var upperThresholdFraction = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_CFG_UPPER_THRESHOLD, CHANNEL_CONFIG);
	setStateIoBroker(myId, upperThreshold+"."+upperThresholdFraction);

	var reportTimeBase = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_CFG_REPORT_TIME_MULTIPLIER, CHANNEL_CONFIG);
	setStateIoBroker(myId, reportTimeBase);
	
	var minReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_CFG_MIN_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, minReportTime);

	var maxReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_CFG_MAX_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, maxReportTime);
	
	var hysteresis = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_CFG_HYSTERESIS, CHANNEL_CONFIG);
	setStateIoBroker(myId, hysteresis/10);

	var calibration = byteToSByte(message[pos++]);
	var myId = getIoBrokerId(deviceId, CLASS_ID_HELLIGKEITSSENSOR, instanceId, BRIGHT_CFG_CALIBRATION, CHANNEL_CONFIG);
	setStateIoBroker(myId, calibration/10);
	
    configurations[sender]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};
	
	debug("helligkeitssensorReceivedConfiguration: "+dump(configurations[sender])+" <- "+objectIdToString(sender));
}

function hwHelligkeitssensorSetConfiguration(configKey, newValue, receiverObjectId,recovery="0")
{
    var lowerThreshold = 0;
    var lowerThresholdFraction = 0;
	var upperThreshold = 0;
	var upperThresholdFraction = 0;
	var reportTimeBase = 0;
	var minReportTime = 0;
	var maxReportTime = 0;
	var hysteresis = 0;
	var calibration = 0;
	
	var configuration = configurations[receiverObjectId];
	if (typeof configuration != "undefined")
	{
      lowerThreshold = parseInt(configuration.lowerThreshold);
	  lowerThresholdFraction = parseInt(configuration.lowerThresholdFraction);
	  upperThreshold = parseInt(configuration.upperThreshold);
	  upperThresholdFraction = parseInt(configuration.upperThresholdFraction);
	  reportTimeBase = parseInt(configuration.reportTimeBase);
	  minReportTime = parseInt(configuration.minReportTime);
	  maxReportTime = parseInt(configuration.maxReportTime);
	  hysteresis = parseInt(configuration.hysteresis);
	  calibration = parseInt(configuration.calibration);
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwHelligkeitssensorGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwHelligkeitssensorSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
			  
	if (configKey == BRIGHT_CFG_CALIBRATION) calibration=parseInt(newValue*10);
	else if (configKey == BRIGHT_CFG_HYSTERESIS) hysteresis=parseInt(newValue*10);
	else if (configKey == BRIGHT_CFG_MAX_REPORT_TIME) maxReportTime=parseInt(newValue);
	else if (configKey == BRIGHT_CFG_MIN_REPORT_TIME) minReportTime=parseInt(newValue);
	else if (configKey == BRIGHT_CFG_REPORT_TIME_MULTIPLIER) reportTimeBase=parseInt(newValue);
	else if (configKey == BRIGHT_CFG_LOWER_THRESHOLD)
	{
		lowerThreshold = parseInt(newValue);
		lowerThresholdFraction = Math.round((parseFloat(newValue)-lowerThreshold)*100);
	}
	else if (configKey == TEMP_CFG_UPPER_THRESHOLD)
	{
		upperThreshold = parseInt(newValue);
		upperThresholdFraction = Math.round((parseFloat(newValue)-upperThreshold)*100);
	}


    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=sByteToByte(lowerThreshold);
	data[pos++]=lowerThresholdFraction;
	data[pos++]=sByteToByte(upperThreshold);
	data[pos++]=upperThresholdFraction;
	data[pos++]=reportTimeBase;
	data[pos++]=minReportTime;
	data[pos++]=maxReportTime;
	data[pos++]=hysteresis;
	data[pos++]=calibration;
	data[pos++]=0; // deltaSensorId
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
    configurations[receiverObjectId]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};	
	
	info("brightness sensor setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// Luftfeuchtigkeitssensoren
function hwFeuchteSensorReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var state="";
	if (functionId==200) state="DRY";
	else if (functionId==201) state="NORMAL";
	else if (functionId==202) state="WET";
	
	info("humidity sensor event "+state+" <- "+objectIdToString(sender));	
	
	if (state!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_FKT_HUMIDITY_STATE);
	  setStateIoBroker(myId, state);
	}
}

function hwFeuchteSensorGetStatus(receiverObjectId)
{
	debug("feuchteSensorGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwFeuchteSensorReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var humidity = message[pos++];
	
    var byteLastEvent = message[pos++];
	
	var state="";
	if (byteLastEvent==200) state="DRY";
	else if (byteLastEvent==201) state="NORMAL";
	if (byteLastEvent==202) state="WET";
	
	info("humidity sensor status: "+humidity+", state = "+state+" <- "+objectIdToString(sender));
	
    var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_FKT_HUMIDITY);
	setStateIoBroker(myId, humidity);

	if (state!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_FKT_HUMIDITY_STATE);
	  setStateIoBroker(myId, state);
	}
}

function hwFeuchteSensorGetConfiguration(receiverObjectId)
{
	debug("feuchteSensorGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwFeuchteSensorReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

    var lowerThreshold = byteToSByte(message[pos++]);
	var lowerThresholdFraction = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_LOWER_THRESHOLD, CHANNEL_CONFIG);
	setStateIoBroker(myId, lowerThreshold+"."+lowerThresholdFraction);

    var upperThreshold = byteToSByte(message[pos++]);
	var upperThresholdFraction = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_UPPER_THRESHOLD, CHANNEL_CONFIG);
	setStateIoBroker(myId, upperThreshold+"."+upperThresholdFraction);

	var reportTimeBase = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_REPORT_TIME_MULTIPLIER, CHANNEL_CONFIG);
	setStateIoBroker(myId, reportTimeBase);
	
	var minReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_MIN_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, minReportTime);

	var maxReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_MAX_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, maxReportTime);
	
	var hysteresis = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_HYSTERESIS, CHANNEL_CONFIG);
	setStateIoBroker(myId, hysteresis/10);

	var calibration = byteToSByte(message[pos++]);
	var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_CALIBRATION, CHANNEL_CONFIG);
	setStateIoBroker(myId, calibration/10);
	
    configurations[sender]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};
	
	debug("feuchteSensorReceivedConfiguration: "+dump(configurations[sender])+" <- "+objectIdToString(sender));
}

function hwFeuchteSensorSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
    var lowerThreshold = 0;
    var lowerThresholdFraction = 0;
	var upperThreshold = 0;
	var upperThresholdFraction = 0;
	var reportTimeBase = 0;
	var minReportTime = 0;
	var maxReportTime = 0;
	var hysteresis = 0;
	var calibration = 0;
	
	var configuration = configurations[receiverObjectId];
	if (typeof configuration != "undefined")
	{
      lowerThreshold = parseInt(configuration.lowerThreshold);
	  lowerThresholdFraction = parseInt(configuration.lowerThresholdFraction);
	  upperThreshold = parseInt(configuration.upperThreshold);
	  upperThresholdFraction = parseInt(configuration.upperThresholdFraction);
	  reportTimeBase = parseInt(configuration.reportTimeBase);
	  minReportTime = parseInt(configuration.minReportTime);
	  maxReportTime = parseInt(configuration.maxReportTime);
	  hysteresis = parseInt(configuration.hysteresis);
	  calibration = parseInt(configuration.calibration);
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwFeuchteSensorGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwFeuchteSensorSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
			  
	if (configKey == HUMIDITY_CFG_CALIBRATION) calibration=parseInt(newValue*10);
	else if (configKey == HUMIDITY_CFG_HYSTERESIS) hysteresis=parseInt(newValue*10);
	else if (configKey == HUMIDITY_CFG_MAX_REPORT_TIME) maxReportTime=parseInt(newValue);
	else if (configKey == HUMIDITY_CFG_MIN_REPORT_TIME) minReportTime=parseInt(newValue);
	else if (configKey == HUMIDITY_CFG_REPORT_TIME_MULTIPLIER) reportTimeBase=parseInt(newValue);
	else if (configKey == HUMIDITY_CFG_LOWER_THRESHOLD)
	{
		lowerThreshold = parseInt(newValue);
		lowerThresholdFraction = Math.round((parseFloat(newValue)-lowerThreshold)*100);
	}
	else if (configKey == HUMIDITY_CFG_UPPER_THRESHOLD)
	{
		upperThreshold = parseInt(newValue);
		upperThresholdFraction = Math.round((parseFloat(newValue)-upperThreshold)*100);
	}


    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=sByteToByte(lowerThreshold);
	data[pos++]=lowerThresholdFraction;
	data[pos++]=sByteToByte(upperThreshold);
	data[pos++]=upperThresholdFraction;
	data[pos++]=reportTimeBase;
	data[pos++]=minReportTime;
	data[pos++]=maxReportTime;
	data[pos++]=hysteresis;
	data[pos++]=calibration;
	data[pos++]=0; // deltaSensorId
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
    configurations[receiverObjectId]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};	
	
	info("humidity sensor setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// Analogeingänge
function hwAnalogInputReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	// erstmal nicht implementiert
	/*
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var state="";
	if (functionId==203) state="value";
	else return;
	
	info("analog input event "+state+" <- "+objectIdToString(sender));	
	
	if (state!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_ANALOGEINGANG, instanceId, ANALOG_F_FKT_HUMIDITY_STATE);
	  setStateIoBroker(myId, state);
	}
	*/
}

function hwAnalogInputGetStatus(receiverObjectId)
{
	debug("analogInputGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwAnalogInputReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	var value = message[pos++];
	

	info("analogInput value: "+value+" <- "+objectIdToString(sender));
	
    var myId = getIoBrokerId(deviceId, CLASS_ID_ANALOGEINGANG, instanceId, ANALOG_FKT_VALUE);
	setStateIoBroker(myId, value);
}

function hwAnalogInputGetConfiguration(receiverObjectId)
{
	debug("analogInputGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwAnalogInputReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

    var lowerThreshold = byteToSByte(message[pos++]);
	var lowerThresholdFraction = message[pos++];
	
	//var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_LOWER_THRESHOLD, CHANNEL_CONFIG);
	//setStateIoBroker(myId, lowerThreshold+"."+lowerThresholdFraction);

    var upperThreshold = byteToSByte(message[pos++]);
	var upperThresholdFraction = message[pos++];
	//var myId = getIoBrokerId(deviceId, CLASS_ID_FEUCHTESENSOR, instanceId, HUMIDITY_CFG_UPPER_THRESHOLD, CHANNEL_CONFIG);
	//setStateIoBroker(myId, upperThreshold+"."+upperThresholdFraction);

	var reportTimeBase = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_ANALOGEINGANG, instanceId, ANALOG_CFG_REPORT_TIME_MULTIPLIER, CHANNEL_CONFIG);
	setStateIoBroker(myId, reportTimeBase);
	
	var minReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_ANALOGEINGANG, instanceId, ANALOG_CFG_MIN_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, minReportTime);

	var maxReportTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_ANALOGEINGANG, instanceId, ANALOG_CFG_MAX_REPORT_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, maxReportTime);
	
	var hysteresis = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_ANALOGEINGANG, instanceId, ANALOG_CFG_HYSTERESIS, CHANNEL_CONFIG);
	setStateIoBroker(myId, hysteresis);

	var calibration = byteToSByte(message[pos++]);
	var myId = getIoBrokerId(deviceId, CLASS_ID_ANALOGEINGANG, instanceId, ANALOG_CFG_CALIBRATION, CHANNEL_CONFIG);
	setStateIoBroker(myId, calibration);
	
    configurations[sender]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};
	
	debug("analogInputReceivedConfiguration: "+dump(configurations[sender])+" <- "+objectIdToString(sender));
}

function hwAnalogInputSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
    var lowerThreshold = 0;
    var lowerThresholdFraction = 0;
	var upperThreshold = 0;
	var upperThresholdFraction = 0;
	var reportTimeBase = 0;
	var minReportTime = 0;
	var maxReportTime = 0;
	var hysteresis = 0;
	var calibration = 0;
	
	var configuration = configurations[receiverObjectId];
	if (typeof configuration != "undefined")
	{
      lowerThreshold = parseInt(configuration.lowerThreshold);
	  lowerThresholdFraction = parseInt(configuration.lowerThresholdFraction);
	  upperThreshold = parseInt(configuration.upperThreshold);
	  upperThresholdFraction = parseInt(configuration.upperThresholdFraction);
	  reportTimeBase = parseInt(configuration.reportTimeBase);
	  minReportTime = parseInt(configuration.minReportTime);
	  maxReportTime = parseInt(configuration.maxReportTime);
	  hysteresis = parseInt(configuration.hysteresis);
	  calibration = parseInt(configuration.calibration);
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwAnalogInputGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwAnalogInputSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
			  
	if (configKey == ANALOG_CFG_CALIBRATION) calibration=parseInt(newValue);
	else if (configKey == ANALOG_CFG_HYSTERESIS) hysteresis=parseInt(newValue);
	else if (configKey == ANALOG_CFG_MAX_REPORT_TIME) maxReportTime=parseInt(newValue);
	else if (configKey == ANALOG_CFG_MIN_REPORT_TIME) minReportTime=parseInt(newValue);
	else if (configKey == ANALOG_CFG_REPORT_TIME_MULTIPLIER) reportTimeBase=parseInt(newValue);


    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=sByteToByte(lowerThreshold);
	data[pos++]=lowerThresholdFraction;
	data[pos++]=sByteToByte(upperThreshold);
	data[pos++]=upperThresholdFraction;
	data[pos++]=reportTimeBase;
	data[pos++]=minReportTime;
	data[pos++]=maxReportTime;
	data[pos++]=hysteresis;
	data[pos++]=calibration;
	data[pos++]=0; // deltaSensorId
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
    configurations[receiverObjectId]={
	lowerThreshold:lowerThreshold, 
	lowerThresholdFraction:lowerThresholdFraction, 
	upperThreshold:upperThreshold, 
	upperThresholdFraction:upperThresholdFraction, 
	reportTimeBase: reportTimeBase,
	minReportTime: minReportTime,
	maxReportTime: maxReportTime,
	hysteresis: hysteresis,
	calibration:calibration};	
	
	info("anlogInput setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// TASTER
function hwTasterGetConfiguration(receiverObjectId)
{
	debug("tasterGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwTasterEnableEvents(enable, disableDuration,  receiverObjectId)
{
	info("input enableEvents enable = "+enable+", disableDuration = "+disableDuration+" -> "+objectIdToString(receiverObjectId));	
	
	disableDuration = parseInt(disableDuration);
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	if (enable=="FALSE") data[pos++]=0;
	else if (enable=="TRUE") data[pos++]=1;
	else if (enable=="INVERT") data[pos++]=2;
	data[pos++]=disableDuration;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwTasterReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var stateByte = message[pos++];
	
	var event="";
	if (functionId==200) event=TASTER_FKT_PRESSED;
	else if (functionId==201) event=TASTER_FKT_CLICKED;
	else if (functionId==202) event=TASTER_FKT_DOUBLE_CLICKED;
	else if (functionId==203) event=TASTER_FKT_HOLD_START;
	else if (functionId==204) event=TASTER_FKT_HOLD_END;
	else if (functionId==205) event=TASTER_FKT_RELEASED;
	//else if (functionId==255) event="evError";

	var state=-1;
	if (stateByte==1) state=true;
	else if (stateByte==0) state=false;
	
    info("input event "+event+", state = "+state+" <- "+objectIdToString(sender));	
	
	if (event!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_TASTER, instanceId, event);
	  setStateIoBroker(myId, true, true);
	}
	
	if (state!=-1)
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_TASTER, instanceId, TASTER_FKT_STATE_CLOSED_OPEN);
	  setStateIoBroker(myId, state, false);
	}
}

function hwTasterGetStatus(receiverObjectId)
{
	debug("tasterGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwTasterReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var stateByte = message[pos++];
	var state=-1;
	if (stateByte==1) state=true;
	else if (stateByte==0) state=false;
	
    info("input status "+state+" -> "+objectIdToString(sender));
	
	if (state!=-1)
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_TASTER, instanceId, TASTER_FKT_STATE_CLOSED_OPEN);
	  setStateIoBroker(myId, state, false);
	}
}

function hwTasterReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var holdTimeout = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TASTER, instanceId, TASTER_CFG_HOLD_TIMEOUT,CHANNEL_CONFIG);
	setStateIoBroker(myId, holdTimeout);

	var waitForDoubleClickTimeout = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_TASTER, instanceId, TASTER_CFG_DOUBLE_CLICK_TIMEOUT,CHANNEL_CONFIG);
	setStateIoBroker(myId, waitForDoubleClickTimeout);

	// EVENTS
	var byteEvents = message[pos++];
	for (var i=0;i<8;i++)
	{
      var newState;
	  if (isBitSet(byteEvents, i)) newState=true;
	  else newState=false;
	  
	  var configId = CONFIG_BITS[CLASS_ID_TASTER]["events"][i];
	  if (typeof configId!="undefined")
	  {
	    var myId = getIoBrokerId(deviceId, CLASS_ID_TASTER, instanceId, configId, CHANNEL_CONFIG);
	    setStateIoBroker(myId, newState);
	  }
	}
	
	// OPTIONS
	var byteOptions = message[pos++];
	for (var i=0;i<8;i++)
	{
      var newState;
	  
	  if (isBitSet(byteOptions, i)) newState=true;
	  else newState=false;

	  var configId = CONFIG_BITS[CLASS_ID_TASTER]["options"][i];
	  
	  if (typeof configId!="undefined")
	  {
	    var myId = getIoBrokerId(deviceId, CLASS_ID_TASTER, instanceId, configId, CHANNEL_CONFIG);
	    setStateIoBroker(myId, newState);
	  }
	}

    configurations[sender]={holdTimeout:holdTimeout, doubleClickTimeout:waitForDoubleClickTimeout, events:byteEvents, options: byteOptions};
	
	debug("Taster Configuration "+sender+": "+dump(configurations[sender]));
}

function hwTasterSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
	var holdTimeout = 0;
	var doubleClickTimeout = 0;
	var events = 0;
	var options = 0;
	var myConfigEventBits = 0;
	var myConfigOptionsBits = 0;
	

	var configuration = configurations[receiverObjectId];
	if (typeof configuration != "undefined")
	{
      holdTimeout = parseInt(configuration.holdTimeout);
	  doubleClickTimeout = parseInt(configuration.doubleClickTimeout);
	  events = parseInt(configuration.events);
	  options = parseInt(configuration.options);
	
	  myConfigEventBits = CONFIG_BITS[CLASS_ID_TASTER]["events"];
	  myConfigOptionsBits = CONFIG_BITS[CLASS_ID_TASTER]["options"];
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwTasterGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwTasterSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
	
	if (configKey == TASTER_CFG_HOLD_TIMEOUT) holdTimeout=parseInt(newValue);
	else if (configKey == TASTER_CFG_DOUBLE_CLICK_TIMEOUT) doubleClickTimeout=parseInt(newValue);
	else if (configKey == TASTER_CFG_EVENT_PRESSED_ENABLED ||
	         configKey == TASTER_CFG_EVENT_RELEASED_ENABLED ||
	         configKey == TASTER_CFG_EVENT_CLICKED_ENABLED ||
	         configKey == TASTER_CFG_EVENT_DOUBLE_CLICKED_ENABLED ||
	         configKey == TASTER_CFG_EVENT_HOLD_START_ENABLED ||
	         configKey == TASTER_CFG_EVENT_HOLD_END_ENABLED ||
	         configKey == TASTER_CFG_LED_FEEDBACK)
	{
  	  if (newValue==true) events = setBit(events,myConfigEventBits[configKey]);
	  else if (newValue==false) events = clearBit(events,myConfigEventBits[configKey]);
    }
	else if (configKey == TASTER_CFG_INVERTED)
	{
 	  if (newValue==true) options = setBit(options,myConfigOptionsBits[configKey]);
	  else if (newValue==false) options = clearBit(options,myConfigOptionsBits[configKey]);
    }	

    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=holdTimeout;
	data[pos++]=doubleClickTimeout;
	data[pos++]=events;
	data[pos++]=options;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
	configurations[receiverObjectId]={holdTimeout:holdTimeout, doubleClickTimeout:doubleClickTimeout, events:events, options: options};
	
	info("input setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// IR-Sensor
function hwIrSensorReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	if (functionId==202 || functionId==203 || functionId==204)
	{
    	var address = bytesToWord(message, pos); pos+=2;
		var command = bytesToWord(message, pos); pos+=2;
		
		var commandCode = address+"."+command;
	
        info("IR sensor event "+functionId+", commandCode = "+commandCode+" <- "+objectIdToString(sender));	
	
	    var myId = getIoBrokerId(deviceId, CLASS_ID_IR_SENSOR, instanceId, IR_SENSOR_FKT_COMMAND);
	    setStateIoBroker(myId, commandCode, true);
	}
}

// SCHALTER
function hwSchalterOff(offDelay, receiverObjectId)
{
	info("relay off offDelay = "+offDelay+" -> "+objectIdToString(receiverObjectId));	

	offDelay = parseInt(offDelay);
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	wordToByteArray(offDelay, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwSchalterOn(duration, onDelay, receiverObjectId)
{
	info("relay on duration = "+duration+", onDelay = "+onDelay+" -> "+objectIdToString(receiverObjectId));	

	duration=parseInt(duration);
	onDelay=parseInt(onDelay);

	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	wordToByteArray(duration, data, pos); pos+=2;
	wordToByteArray(onDelay, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwSchalterToggle(offTime, onTime, quantity,  receiverObjectId)
{
	info("relay toggle offTime = "+offTime+", onTime = "+onTime+", quantity = "+quantity+" -> "+objectIdToString(receiverObjectId));	

	offTime = parseInt(offTime);
	onTime = parseInt(onTime);
	quantity = parseInt(quantity);

	var data = [];
	var pos=0;
	data[pos++]=4; // Funktion ID
	data[pos++]=offTime;
	data[pos++]=onTime;
	data[pos++]=quantity;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwSchalterGetStatus(receiverObjectId)
{
	debug("schalterGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=5; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwSchalterReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var event="";
	if (functionId==200) event="evOff";
	else if (functionId==201)
	{
		event="evOn";
		var duration = bytesToWord(message, pos); pos+=2;
	}
	else if (functionId==202) event="evToggle";
	else if (functionId==203)
	{
		event="evCmdDelay";
		var cmdDelay = bytesToWord(message, pos); pos+=2;
	}
	else if (functionId==255) event="evError";
	
    info("relay event "+event+" <- "+objectIdToString(sender));	
	
	var newState="";
	if (event=="evOff") newState=false;
	else if (event=="evToggle") newState=true;
	else if (event=="evOn") newState=true;
	else return;
	
	var myId = getIoBrokerId(deviceId, CLASS_ID_SCHALTER, instanceId, SCHALTER_FKT_ON_OFF);
	setStateIoBroker(myId, newState);
}

function hwSchalterReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var byteState = message[pos++];
	var state="";
	if (byteState==0) state="OFF";
	else if (byteState==1) state="ON";
	else if (byteState==2) state="TOGGLE";
	
	var duration = bytesToWord(message, pos); pos+=2;

	info("relay status: "+state+" <- "+objectIdToString(sender));
	
	var newState;
	if (byteState==0) newState=false;
	else if (byteState==1) newState=true;
	else return;
	
	var myId = getIoBrokerId(deviceId, CLASS_ID_SCHALTER, instanceId, SCHALTER_FKT_ON_OFF);
	setStateIoBroker(myId, newState);
}

function objectIdToString(objectId)
{
	var classId = getClassId(objectId);
	var className = getClassName(classId);
	var instanceId = getInstanceId(objectId);
	var deviceId = getDeviceId(objectId);
	var moduleType = moduleTypes[deviceId];
	var moduleName = MODULES[moduleType];
	if (typeof moduleName!="undefined") moduleName=moduleName.name;
	else moduleName="UNKNOWN_DEVICE";

	
	return moduleName+" ("+deviceId+")."+getInstanceName(deviceId, moduleType, classId, instanceId)+", moduleType="+moduleType;
}

function getClassName(classId)
{
  if (classId == CLASS_ID_ETHERNET) return "ETHERNET";
  if (typeof CLASSES[classId]=="undefined") return "UNKNOWN_CLASS_"+classId;
  return CLASSES[classId].name
}

function hwSchalterReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var maxOnTime = message[pos++];
	var offDelayTime = message[pos++];
	var timeBase = bytesToWord(message, pos); pos+=2;

	var byteOptions = message[pos++];
	var options="";
	if (isBitSet(byteEvents, 0)) options = addToStringList("invert", events);
	if (isBitSet(byteEvents, 1)) options = addToStringList("driveOnState", events);
	if (isBitSet(byteEvents, 2)) options = addToStringList("driveOffState", events);
	//if (isBitSet(byteEvents, 3)) options = addToStringList("reserved3", events);
	//if (isBitSet(byteEvents, 4)) options = addToStringList("reserved4", events);
	//if (isBitSet(byteEvents, 5)) options = addToStringList("reserved5", events);
	//if (isBitSet(byteEvents, 6)) options = addToStringList("reserved6", events);
	//if (isBitSet(byteEvents, 7)) options = addToStringList("reserved7", events);
}

// Rollladen
function hwRolloGetConfiguration(receiverObjectId)
{
	debug("rolloGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRolloReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	if (functionId==200 || functionId==202) // evClosed u. evOpen
	{
		var position=0;
		
		if (functionId==200) position = message[pos++];

	    info("blind event "+functionId+" <- "+objectIdToString(sender));	
	
	    var myId = getIoBrokerId(deviceId, CLASS_ID_ROLLLADEN, instanceId, ROLLO_FKT_POSITION);
	    setStateIoBroker(myId, position, true);
		
        var myId = getIoBrokerId(deviceId, CLASS_ID_ROLLLADEN, instanceId, ROLLO_FKT_MOVEMENT_STATUS);
	    setStateIoBroker(myId, ROLLO_MOVEMENT_STOPPED, true);
	}
	else if (functionId==201) // evStart
	{
		var directionByte = message[pos++];
		var direction="";
		if (directionByte==0) direction="TOGGLE";
		else if (directionByte==1) direction="DOWN";
		else if (directionByte==2) direction="UP";
		
	    info("blind start "+direction+" -> "+objectIdToString(sender));	
		
		if (direction!="")
		{	
	      var myId = getIoBrokerId(deviceId, CLASS_ID_ROLLLADEN, instanceId, ROLLO_FKT_MOVEMENT_STATUS);
	      setStateIoBroker(myId, direction, true);
		}
	}
}

function hwRolloGetStatus(receiverObjectId)
{
	debug("rolloGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=5; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRolloStart(direction, receiverObjectId)
{
	info("blind start direction = "+direction+" -> "+objectIdToString(receiverObjectId));	

    var directionByte;
	if (direction) directionByte=2;
	else directionByte=1;
	
	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	data[pos++]=directionByte;
		
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRolloToggle(receiverObjectId)
{
	info("blind toggle -> "+objectIdToString(receiverObjectId));	

	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	data[pos++]=0;
		
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}
function hwRolloStop(receiverObjectId)
{
	info("blind stop -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=4; // Funktion ID
		
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRolloSetPosition(position, receiverObjectId)
{
	info("blind setPosition position = "+position+" -> "+objectIdToString(receiverObjectId));	

	position = parseInt(position);

	var data = [];
	var pos=0;
	data[pos++]=6; // Funktion ID
	data[pos++]=position;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRolloMoveToPosition(position, receiverObjectId)
{
	info("blind moveToPosition position = "+position+" -> "+objectIdToString(receiverObjectId));	

	position = parseInt(position);

	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	data[pos++]=position;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRolloReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var position = message[pos++];
	
    info("blind position "+position+" <- "+objectIdToString(sender));
	
    var myId = getIoBrokerId(deviceId, CLASS_ID_ROLLLADEN, instanceId, ROLLO_FKT_POSITION);
	setStateIoBroker(myId, position, false);
}

function hwRolloReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var closeTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_ROLLLADEN, instanceId, ROLLO_CFG_CLOSE_TIME,CHANNEL_CONFIG);
	setStateIoBroker(myId, closeTime);

	var openTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_ROLLLADEN, instanceId, ROLLO_CFG_OPEN_TIME,CHANNEL_CONFIG);
	setStateIoBroker(myId, openTime);

	// options
	var byteOptions = message[pos++];
	for (var i=0;i<8;i++)
	{
      var newState;
	  if (isBitSet(byteOptions, i)) newState=true;
	  else newState=false;
	  
	  var configId = CONFIG_BITS[CLASS_ID_ROLLLADEN]["options"][i];
	  if (typeof configId!="undefined")
	  {
	    var myId = getIoBrokerId(deviceId, CLASS_ID_ROLLLADEN, instanceId, configId, CHANNEL_CONFIG);
	    setStateIoBroker(myId, newState);
	  }
	}

    configurations[sender]={closeTime:closeTime, openTime:openTime, options: byteOptions};
	
	debug("blind configuration: "+dump(configurations[sender])+" "+sender);
}

function hwRolloSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
	var closeTime = 0;
	var openTime = 0;
	var options = 0;
	var myConfigOptionsBits = 0;
	
	var configuration = configurations[receiverObjectId];
	if (typeof configuration != "undefined")
	{
      closeTime = parseInt(configuration.closeTime);
	  openTime = parseInt(configuration.openTime);
	  options = parseInt(configuration.options);
	  myConfigOptionsBits = CONFIG_BITS[CLASS_ID_ROLLLADEN]["options"];
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwRolloGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwRolloSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
	
	if (configKey == ROLLO_CFG_CLOSE_TIME) closeTime=parseInt(newValue);
	else if (configKey == ROLLO_CFG_OPEN_TIME) openTime=parseInt(newValue);
	else if (configKey == ROLLO_CFG_INVERT)
	{
	  if (newValue==true) options = setBit(options,myConfigOptionsBits[configKey]);
	  else if (newValue==false) options = clearBit(options,myConfigOptionsBits[configKey]);
	}

    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=closeTime;
	data[pos++]=openTime;
	data[pos++]=options;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
	configurations[receiverObjectId]={closeTime:closeTime, openTime:openTime, options: options};
	
	info("blind setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// LOGICAL BUTTON
function hwLogicalButtonOff(receiverObjectId)
{
	info("backlight off -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	wordToByteArray(0, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLogicalButtonOn(brightness, duration, receiverObjectId)
{
	info("backlight on brightness = "+brightness+", duration = "+duration+" -> "+objectIdToString(receiverObjectId));	
	
	brightness = parseInt(brightness);
	
	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	data[pos++]=brightness;
	wordToByteArray(duration, data, pos); pos+=2;
	wordToByteArray(0, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLogicalButtonBlink(brightness, offTime, onTime, quantity, receiverObjectId)
{
	info("backlight blink brightness = "+brightness+", offTime = "+offTime+", onTime = "+onTime+", quantity = "+quantity+" -> "+objectIdToString(receiverObjectId));		
	
	brightness = parseInt(brightness);
	offTime = parseInt(offTime);
	onTime = parseInt(onTime);
	quantity = parseInt(quantity);
	
	var data = [];
	var pos=0;
	data[pos++]=4; // Funktion ID
	data[pos++]=brightness;
	data[pos++]=offTime;
	data[pos++]=onTime;
	data[pos++]=quantity;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLogicalButtonSetMinBrightness(minBrightness, duration,  receiverObjectId)
{
	info("backlight setMinBrightness minBrightness = "+minBrightness+", duration = "+duration+" -> "+objectIdToString(receiverObjectId));	
	
    minBrightness = parseInt(minBrightness);

	var data = [];
	var pos=0;
	data[pos++]=6; // Funktion ID
	data[pos++]=minBrightness;
	wordToByteArray(duration, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLogicalButtonReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var state=-1;
	
	if (functionId == 200) state=false;
	else if (functionId == 201) state=true;
	else if (functionId == 202) state=true; // blink
	
    info("backlight event "+state+" ("+functionId+") <- "+objectIdToString(sender));
	
	if (state!=-1)
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_LOGICAL_BUTTON, instanceId, LOGICAL_BUTTON_FKT_ON_OFF);
	  setStateIoBroker(myId, state);
	}
}

function hwLogicalButtonGetStatus(receiverObjectId)
{
	debug("logicalButtonGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=5; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLogicalButtonReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var byteStatus = message[pos++];
	var state=-1;
	if (byteStatus == 0) state=false;
	else if (byteStatus == 1) state=true;
	else if (byteStatus == 2) state=true; // blink
	
    info("backlight status "+state+" <- "+objectIdToString(sender));
	
	if (state!=-1)
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_LOGICAL_BUTTON, instanceId, LOGICAL_BUTTON_FKT_ON_OFF);
	  setStateIoBroker(myId, state);
	}
}

function hwLogicalButtonReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var button1 = message[pos++];
	var button2 = message[pos++];
	var button3 = message[pos++];
	var button4 = message[pos++];
	var button5 = message[pos++];
	var button6 = message[pos++];
	var button7 = message[pos++];
	var button8 = message[pos++];
	var led1 = message[pos++];
	var led2 = message[pos++];
	var led3 = message[pos++];
	var led4 = message[pos++];
	var led5 = message[pos++];
	var led6 = message[pos++];
	var led7 = message[pos++];
	var led8 = message[pos++];
}


// LED
function hwLedOff(offDelay, receiverObjectId)
{
	offDelay = parseInt(offDelay);
	
	info("output off offDelay = "+offDelay+" -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	wordToByteArray(offDelay, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLedMinBrightness(minBrightness, receiverObjectId)
{
	minBrightness = parseInt(minBrightness);
	
	info("output minBrightness "+minBrightness+" -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=6; // Funktion ID
	data[pos++]=minBrightness;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLedOn(brightness, duration, onDelay, receiverObjectId)
{
	brightness = parseInt(brightness);
	duration = parseInt(duration);
	onDelay = parseInt(onDelay);
	
	info("output on brightness = "+brightness+", duration = "+duration+", onDelay = "+onDelay+" -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	data[pos++]=brightness;
	wordToByteArray(duration, data, pos); pos+=2;
	wordToByteArray(onDelay, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLedBlink(brightness, offTime, onTime, quantity, receiverObjectId)
{
	brightness = parseInt(brightness);
	offTime = parseInt(offTime);
	onTime = parseInt(onTime);
	quantity = parseInt(quantity);
	
	info("output blink brightness = "+brightness+", offTime = "+offTime+", onTime = "+onTime+", quantity = "+quantity+" -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=4; // Funktion ID
	data[pos++]=brightness;
	data[pos++]=offTime;
	data[pos++]=onTime;
	data[pos++]=quantity;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLedReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	var event="";
	if (functionId==200) event="evOff";
	else if (functionId==201)
	{
		event="evOn";
		var brightness = message[pos++];
		var duration = bytesToWord(message, pos); pos+=2;
	}
	else if (functionId==202) event="evBlink";
	else if (functionId==255) event="evError";
	
	info("output event: "+event+" <- "+objectIdToString(sender));
	
	var newState="";
	if (event=="evOff") newState=false;
	else if (event=="evOn" || event=="evBlink") newState=true;
		
	if (newState!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_LED, instanceId, LED_FKT_ON_OFF);
	  setStateIoBroker(myId, newState);
	}
}

function hwLedGetStatus(receiverObjectId)
{
	debug("ledGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=5; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLedReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var byteStatus = message[pos++];
	var newState="";
	if (byteStatus == 0) newState="OFF";
	else if (byteStatus == 1) newState="ON";
	else if (byteStatus == 2) newState="ON";
	
	var duration = bytesToWord(message, pos); pos+=2;
	
    info("output status: "+newState+", duration = "+duration+" <- "+objectIdToString(sender));
	
	if (newState!="")
	{
	  var myId = getIoBrokerId(deviceId, CLASS_ID_LED, instanceId, LED_FKT_ON_OFF);
	  setStateIoBroker(myId, newState);
	}
}

function hwLedGetConfiguration(receiverObjectId)
{
	debug("ledGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwLedSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
	var dimmOffset = 0;
	var minBrightness = 0;
	var timebase = 0;
	var options = 0;
	var myConfigOptionsBits = 0;
	
	var configuration = configurations[receiverObjectId];
    if (typeof configuration != "undefined")
	{
      dimmOffset = parseInt(configuration.dimmOffset);
	  minBrightness = parseInt(configuration.minBrightness);
	  timebase = parseInt(configuration.timebase);
	  options = parseInt(configuration.options);
	  myConfigOptionsBits = CONFIG_BITS[CLASS_ID_LED]["options"];
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwLedGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwLedSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
	
	if (configKey == LED_CFG_INVERTED)
	{
		if (newValue==true) options = setBit(options,myConfigOptionsBits[configKey]);
		else if (newValue==false) options = clearBit(options,myConfigOptionsBits[configKey]);
	}
	else if (configKey == LED_CFG_TIMEBASE) timebase = newValue;

    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=dimmOffset;
	data[pos++]=minBrightness;
	wordToByteArray(timebase, data, pos); pos+=2;
	data[pos++]=options;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
    configurations[receiverObjectId]={dimmOffset:dimmOffset, minBrightness:minBrightness, timebase:timebase, options: options};
	
	info("output setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

function hwLedReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var dimmOffset = message[pos++];
	var minBrightness = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_LED, instanceId, LED_FKT_MIN_BRIGHTNESS);
	setStateIoBroker(myId, minBrightness);

	var timebase = bytesToWord(message, pos); pos+=2;
	var myId = getIoBrokerId(deviceId, CLASS_ID_LED, instanceId, LED_CFG_TIMEBASE, CHANNEL_CONFIG);
	setStateIoBroker(myId, timebase);
	
	// OPTIONS
	var byteOptions = message[pos++];
	for (var i=0;i<8;i++)
	{
      var newState;
	  
	  if (isBitSet(byteOptions, i)) newState=true;
	  else newState=false;

	  var configId = CONFIG_BITS[CLASS_ID_LED]["options"][i];
	  
	  
	  if (typeof configId!="undefined")
	  {
	    var myId = getIoBrokerId(deviceId, CLASS_ID_LED, instanceId, configId, CHANNEL_CONFIG);
	    setStateIoBroker(myId, newState);
	  }
	}

    configurations[sender]={dimmOffset:dimmOffset, minBrightness:minBrightness, timebase:timebase, options: byteOptions};
	
	debug("output configuration: "+dump(configurations[sender])+" <- "+objectIdToString(sender));
}

// Dimmer
function hwDimmerGetConfiguration(receiverObjectId)
{
	debug("dimmerGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwDimmerReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	if (functionId==200 || functionId==201) // evOff u. evOn
	{
		var brightness=0;
		
		if (functionId==201)
		{
			brightness = message[pos++];
			info("dimmer event evOn brightness = "+brightness+" <- "+objectIdToString(sender));	
		}
		else info("dimmer event evOff <- "+objectIdToString(sender));	
	
	    var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_FKT_BRIGHTNESS);
	    setStateIoBroker(myId, brightness, true);
		
        var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_FKT_DIMMING_STATUS);
	    setStateIoBroker(myId, DIMMER_DIMMING_IDLE, true);
	}
	else if (functionId==202) // evStart
	{
		var directionByte = message[pos++];
		var direction="";
		if (directionByte==1) direction="UP";
		else if (directionByte==255) direction="DOWN";
		
	    info("dimmer event start direction = "+direction+" <- "+objectIdToString(sender));	
		
		if (direction!="")
		{	
	      var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_FKT_DIMMING_STATUS);
	      setStateIoBroker(myId, direction, true);
		}
	}
}

function hwDimmerGetStatus(receiverObjectId)
{
	debug("dimmerGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=5; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwDimmerStart(direction, receiverObjectId)
{
	info("dimmer start direction = "+direction+" -> "+objectIdToString(receiverObjectId));	

    var directionByte;
	if (direction) directionByte=1;
	else directionByte=255;
	
	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	data[pos++]=directionByte;
		
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwDimmerToggle(receiverObjectId)
{
	info("dimmer toggle -> "+objectIdToString(receiverObjectId));	

	var data = [];
	var pos=0;
	data[pos++]=3; // Funktion ID
	data[pos++]=0;
		
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}
function hwDimmerStop(receiverObjectId)
{
	info("dimmer stop -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=4; // Funktion ID
		
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwDimmerSetBrightness(brightness, duration, receiverObjectId)
{
	brightness = parseInt(brightness);
	duration = parseInt(duration);

	info("dimmer setBrightness brightness = "+brightness+", duration = "+duration+" -> "+objectIdToString(receiverObjectId));	

	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	data[pos++]=brightness;
	wordToByteArray(duration, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwDimmerReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var brightness = message[pos++];
	
    info("dimmer status brightness = "+brightness+" <- "+objectIdToString(sender));
	
    var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_FKT_BRIGHTNESS);
	setStateIoBroker(myId, brightness, false);
}

function hwDimmerReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var modeByte = message[pos++];
	var mode="";
	if (modeByte==0) mode=DIMMER_MODE_TRAILING_EDGE
	else if (modeByte==1) mode=DIMMER_MODE_LEADING_EDGE;
	else if (modeByte==2) mode=DIMMER_MODE_SWITCH_ONLY;
	
	var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_CFG_MODE, CHANNEL_CONFIG);
	setStateIoBroker(myId, mode);

	var fadingTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_CFG_FADING_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, fadingTime);

	var dimmingTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_CFG_DIMMING_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, dimmingTime);

	var dimmingRangeStart = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_CFG_DIMMING_RANGE_START, CHANNEL_CONFIG);
	setStateIoBroker(myId, dimmingRangeStart);

	var dimmingRangeEnd = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_DIMMER, instanceId, DIMMER_CFG_DIMMING_RANGE_END, CHANNEL_CONFIG);
	setStateIoBroker(myId, dimmingRangeEnd);

    configurations[sender]={mode:mode, fadingTime:fadingTime, dimmingTime: dimmingTime, dimmingRangeStart: dimmingRangeStart, dimmingRangeEnd: dimmingRangeEnd};
	
	debug("Dimmer Configuration "+sender+": "+dump(configurations[sender]));
}

function hwDimmerSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
	var mode = 0;
	var fadingTime = 0;
	var dimmingTime = 0;
	var dimmingRangeStart = 0;
	var dimmingRangeEnd = 0;
	
	var configuration = configurations[receiverObjectId];
    if (typeof configuration != "undefined")
	{
       mode = parseInt(configuration.mode);
  	   fadingTime = parseInt(configuration.fadingTime);
	   dimmingTime = parseInt(configuration.dimmingTime);
	   dimmingRangeStart = parseInt(configuration.dimmingRangeStart);
	   dimmingRangeEnd = parseInt(configuration.dimmingRangeEnd);
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwDimmerGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwDimmerSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
	
	if (configKey == DIMMER_CFG_MODE)
	{
		if (newValue==DIMMER_MODE_TRAILING_EDGE) mode = 0;
		else if (newValue==DIMMER_MODE_LEADING_EDGE) mode = 1;
		else if (newValue==DIMMER_MODE_SWITCH_ONLY) mode = 2;
	}
	else if (configKey == DIMMER_CFG_FADING_TIME) fadingTime=parseInt(newValue);
	else if (configKey == DIMMER_CFG_DIMMING_TIME) dimmingTime=parseInt(newValue);
	else if (configKey == DIMMER_CFG_DIMMING_RANGE_START) dimmingRangeStart=parseInt(newValue);
	else if (configKey == DIMMER_CFG_DIMMING_RANGE_END) dimmingRangeEnd=parseInt(newValue);

    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=mode;
	data[pos++]=fadingTime;
	data[pos++]=dimmingTime;
	data[pos++]=dimmingRangeStart;
	data[pos++]=dimmingRangeEnd;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
	configurations[receiverObjectId]={mode:mode, fadingTime:fadingTime, dimmingTime: dimmingTime, dimmingRangeStart: dimmingRangeStart, dimmingRangeEnd: dimmingRangeEnd};
	
	info("dimmer setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// RGB Dimmer
function hwRgbDimmerGetConfiguration(receiverObjectId)
{
	debug("rgbDimmerGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRgbDimmerReceivedEvents(sender, receiver, functionId, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);

	var pos = DATA_START;
	
	if (functionId==200 || functionId==201) // evOff u. evOn
	{
		var brightnessRed=0;
		var brightnessGreen=0;
		var brightnessBlue=0;
		
		if (functionId==201)
		{
			brightnessRed = message[pos++];
			brightnessGreen = message[pos++];
			brightnessBlue = message[pos++];
			info("rgb dimmer event evOn brightnessRed = "+brightnessRed+", brightnessGreen = "+brightnessGreen+", brightnessBlue = "+brightnessBlue+" <- "+objectIdToString(sender));	
		}
		else info("rgb dimmer event evOff <- "+objectIdToString(sender));	
	
	    var myId = getIoBrokerId(deviceId, CLASS_ID_RGB_DIMMER, instanceId, RGB_DIMMER_FKT_COLOR);
	    setStateIoBroker(myId, brightnessRed+","+brightnessGreen+","+brightnessBlue, true);
		
        //var myId = getIoBrokerId(deviceId, CLASS_ID_RGB_DIMMER, instanceId, RGB_DIMMER_FKT_DIMMING_STATUS);
	    //setStateIoBroker(myId, RGB_DIMMER_DIMMING_IDLE, true);
	}
	else if (functionId==202) // evStart
	{
		var directionByte = message[pos++];
		var direction="";
		if (directionByte==1) direction="UP";
		else if (directionByte==255) direction="DOWN";
		
	    info("rgb dimmer event start direction = "+direction+" <- "+objectIdToString(sender));	
		
		/*if (direction!="")
		{	
	      var myId = getIoBrokerId(deviceId, CLASS_ID_RGB_DIMMER, instanceId, RGB_DIMMER_FKT_DIMMING_STATUS);
	      setStateIoBroker(myId, direction, true);
		}*/
	}
}

function hwRgbDimmerGetStatus(receiverObjectId)
{
	debug("rgbDimmerGetStatus -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=5; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRgbDimmerSetColor(red, green, blue, duration, receiverObjectId)
{
	red = parseInt(red);
	green = parseInt(green);
	blue = parseInt(blue);
	duration = parseInt(duration);

	info("rgbDimmerSetColor red = "+red+", green = "+red+", green = "+red+", blue = "+blue+", duration = "+duration+" -> "+objectIdToString(receiverObjectId));	

	var data = [];
	var pos=0;
	data[pos++]=2; // Funktion ID
	data[pos++]=red;
	data[pos++]=green;
	data[pos++]=blue;
	wordToByteArray(duration, data, pos); pos+=2;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwRgbDimmerReceivedStatus(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var red = message[pos++];
	var green = message[pos++];
	var blue = message[pos++];
	
    info("rgbDimmerReceivedStatus red = "+red+", green = "+green+", blue = "+blue+" <- "+objectIdToString(sender));
	
    var myId = getIoBrokerId(deviceId, CLASS_ID_RGB_DIMMER, instanceId, RGB_DIMMER_FKT_COLOR);
	setStateIoBroker(myId, red+","+green+","+blue, false);
}

function hwRgbDimmerReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var modeByte = message[pos++];
	var mode=0;

	var fadingTime = message[pos++];
	var myId = getIoBrokerId(deviceId, CLASS_ID_RGB_DIMMER, instanceId, RGB_DIMMER_CFG_FADING_TIME, CHANNEL_CONFIG);
	setStateIoBroker(myId, fadingTime);

	var dimmingTime = message[pos++];
	var dimmingRangeStart = message[pos++];
	var dimmingRangeEnd = message[pos++];

    configurations[sender]={mode:mode, fadingTime:fadingTime, dimmingTime: dimmingTime, dimmingRangeStart: dimmingRangeStart, dimmingRangeEnd: dimmingRangeEnd};
	
	debug("rgbDimmerReceivedConfiguration "+sender+": "+dump(configurations[sender]));
}

function hwRgbDimmerSetConfiguration(configKey, newValue, receiverObjectId, recovery="0")
{
	var mode = 0;
	var fadingTime = 0;
	var dimmingTime = 0;
	var dimmingRangeStart = 0;
	var dimmingRangeEnd = 0;
	
	var configuration = configurations[receiverObjectId];
    if (typeof configuration != "undefined")
	{
       mode = parseInt(configuration.mode);
  	   fadingTime = parseInt(configuration.fadingTime);
	   dimmingTime = parseInt(configuration.dimmingTime);
	   dimmingRangeStart = parseInt(configuration.dimmingRangeStart);
	   dimmingRangeEnd = parseInt(configuration.dimmingRangeEnd);
	}
	else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwRgbDimmerGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwRgbDimmerSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
	
	if (configKey == RGB_DIMMER_CFG_FADING_TIME) fadingTime=parseInt(newValue);

    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=mode;
	data[pos++]=fadingTime;
	data[pos++]=dimmingTime;
	data[pos++]=dimmingRangeStart;
	data[pos++]=dimmingRangeEnd;
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
	configurations[receiverObjectId]={mode:mode, fadingTime:fadingTime, dimmingTime: dimmingTime, dimmingRangeStart: dimmingRangeStart, dimmingRangeEnd: dimmingRangeEnd};
	
	info("dimmer setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
}

// Ethernet
function hwEthernetGetCurrentIp(receiverObjectId)
{
	debug("getCurrentIp -> "+objectIdToString(receiverObjectId)+" / "+receiverObjectId);
	
	var data = [];
	data[0]=3; // Funktion ID
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwEthernetReceivedIp(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var byte0 = message[pos++];
	var byte1 = message[pos++];
	var byte2 = message[pos++];
	var byte3 = message[pos++];
	var ip = byte0+"."+byte1+"."+byte2+"."+byte3;
	
	info("ethernet ip "+ip+" <- "+objectIdToString(sender));	
	
	var myId = getIoBrokerId(deviceId,CLASS_ID_CONTROLLER,instanceId,ETHERNET_FKT_IP,CHANNEL_CONFIG);
	setStateIoBroker(myId, ip);
}

function hwEthernetSetConfiguration(newValue, receiverObjectId, recovery="0")
{
    newValue = String(newValue);
	var myConfigBits = 0;
	var ip = 0;
	var options = 0;
	var port = 0;
	var loxoneIp = 0;
	
	var configuration = configurations[receiverObjectId];
	if (typeof configuration != "undefined")
	{
	   myConfigBits = CONFIG_BITS[CLASS_ID_ETHERNET]["options"];
       ip = configuration.ip;
	   options = configuration.options;
	   port = parseInt(configuration.port);
	   loxoneIp = configuration.loxoneIp;
	}
    else
	{
		if (recovery=="1")
		{
		  error("configuration missing and recovery failed");
		  return;
		}
		else
		{
		  warn("configuration missing -> recovery");
		  hwEthernetGetConfiguration(receiverObjectId);
		  setTimeout(function() { hwEthernetSetConfiguration(configKey, newValue, receiverObjectId, "1");}, 1000);
		  return;
		}
	}
	
    var changes=false;
	
    if (newValue.toUpperCase()=="DHCP")
	{
		var newOptions = setBit(options,myConfigBits["dhcp"]);
		if (newOptions!=options)
		{
			options = newOptions;
			changes=true;
		}
	}
	else
	{
		var newOptions = clearBit(options,myConfigBits[ETHERNET_CFG_FIXED_IP_DHCP]);

		if (newOptions!=options || ip!=newValue)
		{
			options = newOptions;
		    ip = newValue;
			changes=true;
		}
	}
	
	var parts = ip.split(".");
	
    var data = [];
	var pos=0;
	data[pos++]=1; // Funktion ID
	data[pos++]=parts[0];
	data[pos++]=parts[1];
	data[pos++]=parts[2];
	data[pos++]=parts[3];
	data[pos++]=options;
	
	wordToByteArray(port, data, pos); pos+=2;

	var parts = loxoneIp.split(".");
	data[pos++]=parts[0];
	data[pos++]=parts[1];
	data[pos++]=parts[2];
	data[pos++]=parts[3];
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
	configurations[receiverObjectId]={ip:ip, options:options, port:port, loxoneIp: loxoneIp};
	
	info("ethernet setConfiguration: "+dump(configurations[receiverObjectId])+" -> "+objectIdToString(receiverObjectId));
	
	if (changes) hwControllerReset(getObjectId(getDeviceId(receiverObjectId), CLASS_ID_CONTROLLER, 1));
}

function hwEthernetGetConfiguration(receiverObjectId)
{
	debug("ethernetGetConfiguration -> "+objectIdToString(receiverObjectId));	
	
	var data = [];
	var pos=0;
	data[pos++]=0; // Funktion ID
	
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwEthernetReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;
	
	var ip = message[pos++]+"."+message[pos++]+"."+message[pos++]+"."+message[pos++];
	var options = message[pos++];
	var port = message[pos++];
	var loxoneIp = message[pos++]+"."+message[pos++]+"."+message[pos++]+"."+message[pos++];
	
	configurations[sender]={ip:ip, options:options, port:port, loxoneIp: loxoneIp};

	debug("Ethernet: "+dump(configurations[sender])+" <- "+objectIdToString(sender));	
	
	var myId = getIoBrokerId(deviceId,CLASS_ID_CONTROLLER,instanceId,ETHERNET_CFG_FIXED_IP_DHCP,CHANNEL_CONFIG);
	if (isBitSet(options, CONFIG_BITS[CLASS_ID_ETHERNET]["options"][ETHERNET_CFG_FIXED_IP_DHCP])) ip="DHCP";
    setStateIoBroker(myId, ip);

}

// Controller
function hwControllerReceivedModuleId(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var name = "Controller "+deviceId;
	
	var pos = DATA_START;
	var stringLength = bytesGetStringLength(message, pos, dataLength);
	var name = bytesToString(message, pos, stringLength); 
	pos+=stringLength+1;
	var size = bytesToDword(message, pos);
	pos+=4;
	
	var majorRelease = message[pos++];
	var minorRelease = message[pos++];
	if (minorRelease.length<2) minorRelease="0"+minorRelease;
	var version = majorRelease+"."+minorRelease;
	moduleVersions[deviceId]=version;

	var byteFirmwareId = message[pos++];
	var firmwareId=FIRMWARE_IDS[byteFirmwareId];
	
	firmwareTypes[deviceId]=firmwareId;
	
	info("controller moduleId: name = "+name+", size = "+size+", version =  "+version+", type = "+firmwareId+" <- "+objectIdToString(sender));	
	
    hwControllerGetConfiguration(getObjectId(deviceId, CLASS_ID_CONTROLLER, 1));
}


function hwControllerReceivedRemoteObjects(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var objectList = bytesToWordList(message, DATA_START, dataLength);
	
	debug("Controller RemoteObjects: "+objectList+" <- "+objectIdToString(sender));	
	
	var nrRelais=0;
    var nrTaster=0;
    var nrLeds=0;
    var nrRollos=0;
    var nrDimmer=0;
    var nrRgbDimmer=0;
	var nrAnalogInput=0;
	
	var parts = objectList.split(";");
	parts.forEach(function(item)
	{
	   var innerParts = item.split(",");
	   var instanceId = innerParts[0];
	   var classId = innerParts[1];
	   
	   if (classId==CLASS_ID_DIMMER) nrDimmer++;
	   else if (classId==CLASS_ID_ROLLLADEN) nrRollos++;
	   else if (classId==CLASS_ID_LED) nrLeds++;
	   else if (classId==CLASS_ID_TASTER) nrTaster++;
	   else if (classId==CLASS_ID_SCHALTER) nrRelais++;
	   else if (classId==CLASS_ID_RGB_DIMMER) nrRgbDimmer++;
	   else if (classId==CLASS_ID_ANALOGEINGANG) nrAnalogInput++;
	});

    info("functions for deviceId "+deviceId+": nrRelais = "+nrRelais+", nrTaster = "+nrTaster+", nrLeds = "+nrLeds+", nrDimmer = "+nrDimmer+", analogInput = "+nrAnalogInput);


    var moduleType="";
	
	if (typeof moduleTypes[deviceId]=="undefined")
	{
	  if (nrRelais==17 && nrTaster==16) moduleType=MODUL_ID_32_IO;
      else if (nrRelais==17 && nrTaster==8) moduleType=MODUL_ID_16_RELAIS_V2;
      else if (nrRelais==17) moduleType=MODUL_ID_16_RELAIS_V1;
      else if (nrTaster==12 && nrLeds==12 && nrRelais==1) moduleType=MODUL_ID_24_UP_IO;
      else if (nrTaster==4 && nrLeds==4 && nrRelais==1) moduleType= MODUL_ID_4_DIMMER;
      else if ((nrTaster==6 && nrLeds==6) || (nrTaster==12 && (nrLeds==12 || nrLeds==13))) moduleType=MODUL_ID_6_TASTER;
      else if ((nrTaster==4 && nrLeds==4) || (nrTaster==10 && nrLeds==10)) moduleType=MODUL_ID_4_TASTER;
      else if ((nrTaster==2 && nrLeds==2) || (nrTaster==8 && nrLeds==8)) moduleType=MODUL_ID_2_TASTER;
      else if ((nrTaster==1 && nrLeds==1) || (nrTaster==7 && nrLeds==7)) moduleType=MODUL_ID_1_TASTER;
      else if (nrRelais==9) moduleType = MODUL_ID_8_RELAIS;
      else if (nrRelais==12) moduleType = MODUL_ID_12_RELAIS;
      else if (nrRollos==8) moduleType = MODUL_ID_8_ROLLO;
      else if (nrDimmer==8 && nrRelais==1) moduleType=MODUL_ID_8_DIMMER;
      else if (nrRgbDimmer==2) moduleType=MODUL_ID_RGB_DIMMER;
	
	  if (moduleType=="" || typeof MODULES[moduleType]=="undefined")
	  {
	      warn("unrecognized module type for deviceId "+deviceId+" aborting: nrRelais = "+nrRelais+", nrTaster = "+nrTaster+", nrLeds = "+nrLeds+", nrDimmer = "+nrDimmer+", analogInput = "+nrAnalogInput);
		  return;
	  }

      warn("unrecognized module type for deviceId "+deviceId+" using autodetected type: "+MODULES[moduleType].name+" ("+moduleType+")");
	  
	  moduleTypes[deviceId]=moduleType;
	}
	else
	{
		moduleType = moduleTypes[deviceId];
		if (moduleType == MODUL_ID_16_RELAIS_V2 && nrRollos==8) moduleType=MODUL_ID_8_ROLLO;
	}
	
	var moduleType=MODULES[moduleType].name;
	
	// ID.CLASS.INSTANZ.property=value

    // ID	
	adapter.setObjectNotExists(adapter.namespace+"."+deviceId, {type: 'device', common: {name: moduleType},native: {}});
	
	var foundClasses={};
    var parts = objectList.split(";");
	parts.forEach(function(item)
	{
	   var innerParts = item.split(",");
	   var instanceId = innerParts[0];
	   var classId = innerParts[1];
	   
	   if (classId == CLASS_ID_ETHERNET)
	   {
		   var ethernetObjectId = getObjectId(deviceId, classId, instanceId);
		   addStateIoBroker(ETHERNET_FKT_IP, 'string', 'info.ip', deviceId, CLASS_ID_CONTROLLER, instanceId, false, true, hwEthernetGetCurrentIp(ethernetObjectId), CHANNEL_CONFIG);
		   addStateIoBroker(ETHERNET_CFG_FIXED_IP_DHCP, 'string', 'text', deviceId, CLASS_ID_CONTROLLER, instanceId, true, true, hwEthernetGetConfiguration(ethernetObjectId), CHANNEL_CONFIG);
	   }

	   if (!CLASSES[classId]) return;
	   foundClasses[classId]=1;
	   var className = CLASSES[classId].name;

       // CLASS	
	   adapter.setObjectNotExists(adapter.namespace+"."+deviceId+"."+className, {type: 'channel', common: {name: className},native: {}});
	   
	   // Instance
	   var instanceName = getInstanceName(deviceId, moduleType, classId, instanceId);
	   adapter.setObjectNotExists(adapter.namespace+"."+deviceId+"."+className+"."+instanceName, {type: 'channel', common: {name: instanceName},native: {}});
	   
	   // Funktionen
	   addIoBrokerStatesForInstance(deviceId, classId, instanceId); 
	});
	
	readStatusForClasses(deviceId, foundClasses);
}

function hwControllerReceivedConfiguration(sender, receiver, message, dataLength)
{
	var instanceId = getInstanceId(sender);
	var deviceId = getDeviceId(sender);
	
	var pos = DATA_START;

	var startupDelay = message[pos++];
	var logicalButtonMask = message[pos++];
	var deviceId = bytesToWord(message, pos); pos+=2;
	var reportMemoryStatusTime = message[pos++];
	var slotTypeA = message[pos++];
	var slotTypeB = message[pos++];
	var slotTypeC = message[pos++];
	var slotTypeD = message[pos++];
	var slotTypeE = message[pos++];
	var slotTypeF = message[pos++];
	var slotTypeG = message[pos++];
	var slotTypeH = message[pos++];
	var timeCorrection = message[pos++];
	var reserve = bytesToWord(message, pos); pos+=2;
	var dataBlockSize = bytesToWord(message, pos); pos+=2;
	var fcke = message[pos++];

    var moduleId=-1;
	
    var firmwareType = firmwareTypes[deviceId];
	if (firmwareType == FIRMWARE_ID_HBC)
	{
		if (fcke==0) moduleId = MODUL_ID_4_DIMMER;
		else if (fcke==0x8) moduleId = MODUL_ID_8_RELAIS;
		else if (fcke==0xC) moduleId = MODUL_ID_16_RELAIS_V2;
		else if (fcke==0x10) moduleId = MODUL_ID_24_UP_IO;
		else if (fcke==0x12) moduleId = MODUL_ID_8_ROLLO;
		else if (fcke==0x18) moduleId = MODUL_ID_6_TASTER;
		else if (fcke==0x19) moduleId = MODUL_ID_4_TASTER;
		else if (fcke==0x1A) moduleId = MODUL_ID_2_TASTER;
		else if (fcke==0x1B) moduleId = MODUL_ID_1_TASTER;
		else if (fcke==0x20) moduleId = MODUL_ID_32_IO;
		else if (fcke==0x27 || fcke==0x28 || fcke==0x29) moduleId = MODUL_ID_8_DIMMER;
		else if (fcke==0x30) moduleId = MODUL_ID_RGB_DIMMER;
	}
	else if (firmwareType == FIRMWARE_ID_ESP32)
	{
		if (fcke==0) moduleId = MODUL_ID_4_DIMMER;
		else if (fcke==0x8) moduleId = MODUL_ID_8_RELAIS;
		else if (fcke==0xC) moduleId = MODUL_ID_16_RELAIS_V2;
		else if (fcke==0x10) moduleId = MODUL_ID_24_UP_IO;
		else if (fcke==0x12) moduleId = MODUL_ID_8_ROLLO;
		else if (fcke==0x18) moduleId = MODUL_ID_6_TASTER;
		else if (fcke==0x19) moduleId = MODUL_ID_4_TASTER;
		else if (fcke==0x1A) moduleId = MODUL_ID_2_TASTER;
		else if (fcke==0x1B) moduleId = MODUL_ID_1_TASTER;
		else if (fcke==0x20) moduleId = MODUL_ID_32_IO;
		else if (fcke==0x27 || fcke==0x28 || fcke==0x29) moduleId = MODUL_ID_8_DIMMER;
		else if (fcke==0x30) moduleId = MODUL_ID_RGB_DIMMER;
		else if (fcke==0x0A) moduleId = MODUL_ID_12_RELAIS;
	}
	else if (firmwareType == FIRMWARE_ID_SD485)
	{
		if (fcke==30) moduleId = MODUL_ID_6_TASTER;
		else if (fcke==40) moduleId = MODUL_ID_24_UP_IO;
		else if (fcke==41) moduleId = MODUL_ID_1_TASTER;
		else if (fcke==42) moduleId = MODUL_ID_2_TASTER;
		else if (fcke==44) moduleId = MODUL_ID_4_TASTER;
		else if (fcke==47) moduleId = MODUL_ID_6_TASTER;
		else if (fcke==43) moduleId = MODUL_ID_4_DIMMER;
		else if (fcke==45) moduleId = MODUL_ID_4_DIMMER;
	}
	else if (firmwareType == FIRMWARE_ID_AR8)
	{
		if (fcke==48) moduleId = MODUL_ID_8_RELAIS;
		else if (fcke==40) moduleId = MODUL_ID_LAN_BRIDGE;
	}
	
	var moduleTypeName="";
	if (typeof MODULES[moduleId]!="undefined") moduleTypeName = MODULES[moduleId].name;
	
	debug("controller configuration: "+moduleTypeName+" ("+moduleId+"), startupDelay = "+startupDelay+", logicalButtonMask = "+logicalButtonMask+", deviceId = "+deviceId+", reportMemoryStatusTime = "+reportMemoryStatusTime+", slotTypeA = "+slotTypeA+", slotTypeB = "+slotTypeB+", slotTypeC = "+slotTypeC+", slotTypeD = "+slotTypeD+", slotTypeE = "+slotTypeE+", slotTypeF = "+slotTypeF+", slotTypeG = "+slotTypeG+", slotTypeH = "+slotTypeH+", timeCorrection = "+timeCorrection+", dataBlockSize = "+dataBlockSize+", fcke = "+fcke);
	
	if (moduleId!=-1) moduleTypes[deviceId]=moduleId;
	
	hwControllerGetRemoteObjects(sender);
}

function readStatusForClasses(deviceId, foundClasses)
{
	for (var classId in foundClasses) 
	{
	   if (classId == CLASS_ID_SCHALTER)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
	     hwSchalterGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_TASTER)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
	     hwTasterGetConfiguration(getObjectId(deviceId, classId, 0));
		 hwTasterGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_ROLLLADEN)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
	     hwRolloGetConfiguration(getObjectId(deviceId, classId, 0));
		 hwRolloGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_DIMMER)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
	     hwDimmerGetConfiguration(getObjectId(deviceId, classId, 0));
		 hwDimmerGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_RGB_DIMMER)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
	     hwRgbDimmerGetConfiguration(getObjectId(deviceId, classId, 0));
		 hwRgbDimmerGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_ETHERNET)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
	     hwEthernetGetConfiguration(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_LED)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
		 hwLedGetConfiguration(getObjectId(deviceId, classId, 0));
	     hwLedGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_LOGICAL_BUTTON)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
	     hwLogicalButtonGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_TEMPERATURSENSOR)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
		 hwTemperatursensorGetConfiguration(getObjectId(deviceId, classId, 0));
	     hwTemperatursensorGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_HELLIGKEITSSENSOR)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
		 hwHelligkeitssensorGetConfiguration(getObjectId(deviceId, classId, 0));
	     hwHelligkeitssensorGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_ANALOGEINGANG)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
		 hwAnalogInputGetConfiguration(getObjectId(deviceId, classId, 0));
	     hwAnalogInputGetStatus(getObjectId(deviceId, classId, 0));
	   }
	   else if (classId == CLASS_ID_FEUCHTESENSOR)
	   {
	     debug("Status broadcast for class "+CLASSES[classId].name);
		 hwFeuchteSensorGetConfiguration(getObjectId(deviceId, classId, 0));
	     hwFeuchteSensorGetStatus(getObjectId(deviceId, classId, 0));
	   }
	}
}

function addStateIoBroker(name, type, role, deviceId, classId, instanceId, writeable=true, readable=true, defaultValue=null, subChannel="", unit="")
{
   var ioBrokerId = getIoBrokerId(deviceId,classId,instanceId,name, subChannel);

   if (subChannel!="")
   {
	   var channelIoBrokerId = ioBrokerId.replace("."+name,"");
	   adapter.setObjectNotExists(channelIoBrokerId, {type: 'channel', common: {name: subChannel},native: {}});	
   }
   
   objectIds[ioBrokerId]=getObjectId(deviceId, classId, instanceId);
   stateTypes[ioBrokerId]=type;
   if (unit!="") adapter.setObjectNotExists(ioBrokerId,{type: 'state',common: {name: name,type: type,role: role, write:writeable, read:readable,  unit: unit}, native : {}});
   else adapter.setObjectNotExists(ioBrokerId,{type: 'state',common: {name: name,type: type,role: role, write:writeable, read:readable}, native : {}});
   if (typeof ioBrokerStates[ioBrokerId]=="undefined") ioBrokerStates[ioBrokerId]="-";
   
   if (defaultValue!=null) setStateIoBroker(ioBrokerId, defaultValue);
}

function addIoBrokerStatesForInstance(deviceId, classId, instanceId)
{
   if (classId == CLASS_ID_CONTROLLER)
   {
	  addStateIoBroker(CONTROLLER_FKT_STATE_ONLINE, 'boolean', 'indicator.reachable', deviceId, classId, instanceId, false, true, true);
	  addStateIoBroker(CONTROLLER_FKT_VERSION, 'string', 'text', deviceId, classId, instanceId, false, true, firmwareTypes[deviceId]+" "+moduleVersions[deviceId]);
	  addStateIoBroker(CONTROLLER_FKT_RESET, 'boolean', 'button', deviceId, classId, instanceId, true, false);

	  //addStateIoBroker(CONTROLLER_CFG_NEWEST_FIRMWARE, 'string', 'text', deviceId, classId, instanceId, false, true,"",CHANNEL_CONFIG);
	  //addStateIoBroker(CONTROLLER_CFG_UPDATE_FIRMWARE, 'string', 'text', deviceId, classId, instanceId, true, false,"to_update_enter_the_word:UPDATE",CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_SCHALTER)
   {
	  addStateIoBroker(SCHALTER_FKT_ON_OFF, 'boolean', 'switch', deviceId, classId, instanceId, true, true);
	  addStateIoBroker(SCHALTER_FKT_ON_DURATION_DELAY, 'string', 'switch', deviceId, classId, instanceId, true, false, "duration,onDelay");
	  addStateIoBroker(SCHALTER_FKT_OFF_DELAY, 'string', 'switch', deviceId, classId, instanceId, true, false, "offDelay");
   }
   else if (classId == CLASS_ID_TASTER)
   {
	  addStateIoBroker(TASTER_FKT_DISABLE_EVENTS_TIMEOUT, 'number', 'switch', deviceId, classId, instanceId, true, false, "timeout",CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_FKT_ENABLE_DISABLE_EVENTS, 'boolean', 'switch', deviceId, classId, instanceId, true, true,null, CHANNEL_CONFIG);

	  addStateIoBroker(TASTER_FKT_PRESSED, 'boolean', 'indicator', deviceId, classId, instanceId, false, true, true);
	  addStateIoBroker(TASTER_FKT_RELEASED, 'boolean', 'indicator', deviceId, classId, instanceId, false, true, true);
	  addStateIoBroker(TASTER_FKT_CLICKED, 'boolean', 'indicator', deviceId, classId, instanceId, false, true, true);
	  addStateIoBroker(TASTER_FKT_DOUBLE_CLICKED, 'boolean', 'indicator', deviceId, classId, instanceId, false, true, true);
	  addStateIoBroker(TASTER_FKT_HOLD_START, 'boolean', 'indicator', deviceId, classId, instanceId, false, true, true);
	  addStateIoBroker(TASTER_FKT_HOLD_END, 'boolean', 'indicator', deviceId, classId, instanceId, false, true, true);
	  addStateIoBroker(TASTER_FKT_STATE_CLOSED_OPEN, 'boolean', 'state', deviceId, classId, instanceId, false, true);

	  addStateIoBroker(TASTER_CFG_DOUBLE_CLICK_TIMEOUT, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_EVENT_CLICKED_ENABLED, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_EVENT_PRESSED_ENABLED, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_EVENT_DOUBLE_CLICKED_ENABLED, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_EVENT_HOLD_END_ENABLED, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_EVENT_HOLD_START_ENABLED, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_EVENT_RELEASED_ENABLED, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_LED_FEEDBACK, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_HOLD_TIMEOUT, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(TASTER_CFG_INVERTED, 'boolean', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_ROLLLADEN)
   {
	  addStateIoBroker(ROLLO_FKT_POSITION, 'number', 'state', deviceId, classId, instanceId, true, true);
	  addStateIoBroker(ROLLO_FKT_MOVEMENT_STATUS, 'string', 'state', deviceId, classId, instanceId, false, true, ROLLO_MOVEMENT_STOPPED);
	  addStateIoBroker(ROLLO_FKT_START, 'boolean', 'state', deviceId, classId, instanceId, true, false);
	  addStateIoBroker(ROLLO_FKT_STOP, 'boolean', 'button', deviceId, classId, instanceId, true, false);
	  addStateIoBroker(ROLLO_FKT_TOGGLE, 'boolean', 'button', deviceId, classId, instanceId, true, false);
	  addStateIoBroker(ROLLO_FKT_UPDATE_POSITION, 'boolean', 'button', deviceId, classId, instanceId, true, false);

	  addStateIoBroker(ROLLO_CFG_CLOSE_TIME, 'number', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(ROLLO_CFG_OPEN_TIME, 'number', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(ROLLO_CFG_INVERT, 'boolean', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(ROLLO_CFG_SET_POSITION, 'number', 'state', deviceId, classId, instanceId, true, false, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_DIMMER)
   {
	  addStateIoBroker(DIMMER_FKT_BRIGHTNESS, 'number', 'state', deviceId, classId, instanceId, true, true);
	  addStateIoBroker(DIMMER_FKT_BRIGHTNESS_DURATION, 'string', 'state', deviceId, classId, instanceId, true, false, "brightness,duration");
	  addStateIoBroker(DIMMER_FKT_DIMMING_STATUS, 'string', 'state', deviceId, classId, instanceId, false, true, DIMMER_DIMMING_IDLE);
	  addStateIoBroker(DIMMER_FKT_START, 'boolean', 'state', deviceId, classId, instanceId, true, true);
	  addStateIoBroker(DIMMER_FKT_STOP, 'boolean', 'button', deviceId, classId, instanceId, true, false);
	  addStateIoBroker(DIMMER_FKT_TOGGLE, 'boolean', 'button', deviceId, classId, instanceId, true, false);

	  addStateIoBroker(DIMMER_CFG_MODE, 'string', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(DIMMER_CFG_DIMMING_TIME, 'number', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(DIMMER_CFG_FADING_TIME, 'number', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(DIMMER_CFG_DIMMING_RANGE_START, 'number', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(DIMMER_CFG_DIMMING_RANGE_END, 'number', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_RGB_DIMMER)
   {
	  addStateIoBroker(RGB_DIMMER_FKT_COLOR, 'string', 'state', deviceId, classId, instanceId, true, true, "red,green,blue");
	  addStateIoBroker(RGB_DIMMER_FKT_COLOR_DURATION, 'string', 'state', deviceId, classId, instanceId, true, false, "red,green,blue,duration");
	   //addStateIoBroker(RGB_DIMMER_FKT_DIMMING_STATUS, 'string', 'state', deviceId, classId, instanceId, false, true, RGB_DIMMER_DIMMING_IDLE);

	  addStateIoBroker(RGB_DIMMER_CFG_FADING_TIME, 'number', 'state', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_LED)
   {
	  addStateIoBroker(LED_FKT_ON_OFF, 'boolean', 'switch', deviceId, classId, instanceId, true, true);
	  addStateIoBroker(LED_FKT_ON_BRIGHTNESS_DURATION_ONDELAY, 'string', 'switch', deviceId, classId, instanceId, true, false, "brightness,duration,onDelay");
	  addStateIoBroker(LED_FKT_OFF_DELAY, 'number', 'switch', deviceId, classId, instanceId, true, false, "offDelay");
	  addStateIoBroker(LED_FKT_BLINK_BRIGHTNESS_OFFTIME_ONTIME_QUANTITY, 'string', 'switch', deviceId, classId, instanceId, true, false, "brightness_offtime_ontime_quantity");
	  addStateIoBroker(LED_FKT_MIN_BRIGHTNESS, 'number', 'state', deviceId, classId, instanceId, true, false, "brightness_offtime_ontime_quantity");
	  addStateIoBroker(LED_CFG_INVERTED, 'boolean', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
	  addStateIoBroker(LED_CFG_TIMEBASE, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_LOGICAL_BUTTON)
   {
	  addStateIoBroker(LOGICAL_BUTTON_FKT_ON_OFF, 'boolean', 'switch', deviceId, classId, instanceId, true, true, false);
	  addStateIoBroker(LOGICAL_BUTTON_ON_BRIGHTNESS_DURATION, 'number', 'switch', deviceId, classId, instanceId, true, false, "brightness");
	  addStateIoBroker(LOGICAL_BUTTON_FKT_BLINK_BRIGHTNESS_OFFTIME_ONTIME_QUANTITY, 'string', 'switch', deviceId, classId, instanceId, true, false, "brightness_offtime_ontime_quantity");
	  addStateIoBroker(LOGICAL_BUTTON_FKT_MIN_BRIGHTNESS, 'number', 'state', deviceId, classId, instanceId, true, false);
   }
   else if (classId == CLASS_ID_IR_SENSOR)
   {
	  addStateIoBroker(IR_SENSOR_FKT_COMMAND, 'number', 'indicator', deviceId, classId, instanceId, false, true);
   }
   else if (classId == CLASS_ID_TEMPERATURSENSOR)
   {
	  addStateIoBroker(TEMP_FKT_TEMPERATUR, 'number', 'value.temperature', deviceId, classId, instanceId, false, true, null, "", "°C");
  	  addStateIoBroker(TEMP_FKT_TEMPERATURE_STATE, 'string', 'state ', deviceId, classId, instanceId, false, true);
	  
  	  addStateIoBroker(TEMP_CFG_LOWER_THRESHOLD, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(TEMP_CFG_UPPER_THRESHOLD, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(TEMP_CFG_MIN_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(TEMP_CFG_MAX_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(TEMP_CFG_REPORT_TIME_MULTIPLIER, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(TEMP_CFG_HYSTERESIS, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(TEMP_CFG_CALIBRATION, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_HELLIGKEITSSENSOR)
   {
	  addStateIoBroker(BRIGHT_FKT_BRIGHTNESS, 'number', 'value.brightness', deviceId, classId, instanceId, false, true);
  	  addStateIoBroker(BRIGHT_FKT_BRIGHTNESS_STATE, 'string', 'state ', deviceId, classId, instanceId, false, true);
	  
  	  addStateIoBroker(BRIGHT_CFG_LOWER_THRESHOLD, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(BRIGHT_CFG_UPPER_THRESHOLD, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(BRIGHT_CFG_MIN_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(BRIGHT_CFG_MAX_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(BRIGHT_CFG_REPORT_TIME_MULTIPLIER, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(BRIGHT_CFG_HYSTERESIS, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(BRIGHT_CFG_CALIBRATION, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_ANALOGEINGANG)
   {
	  addStateIoBroker(ANALOG_FKT_VALUE, 'number', 'value', deviceId, classId, instanceId, false, true);
	  
  	  addStateIoBroker(ANALOG_CFG_MIN_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(ANALOG_CFG_MAX_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(ANALOG_CFG_REPORT_TIME_MULTIPLIER, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(ANALOG_CFG_HYSTERESIS, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(ANALOG_CFG_CALIBRATION, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
   else if (classId == CLASS_ID_FEUCHTESENSOR)
   {
	  addStateIoBroker(HUMIDITY_FKT_HUMIDITY, 'number', 'value.humidity', deviceId, classId, instanceId, false, true);
  	  addStateIoBroker(HUMIDITY_FKT_HUMIDITY_STATE, 'string', 'state ', deviceId, classId, instanceId, false, true);
	  
  	  addStateIoBroker(HUMIDITY_CFG_LOWER_THRESHOLD, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(HUMIDITY_CFG_UPPER_THRESHOLD, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(HUMIDITY_CFG_MIN_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(HUMIDITY_CFG_MAX_REPORT_TIME, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(HUMIDITY_CFG_REPORT_TIME_MULTIPLIER, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(HUMIDITY_CFG_HYSTERESIS, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
  	  addStateIoBroker(HUMIDITY_CFG_CALIBRATION, 'number', 'state ', deviceId, classId, instanceId, true, true, null,CHANNEL_CONFIG);
   }
}

function hwControllerReset(receiverObjectId)
{
	info("reset -> "+objectIdToString(receiverObjectId));
	
	var data = [];
	data[0]=1; // Funktion ID
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
	
    setStateIoBroker(getIoBrokerId(getDeviceId(receiverObjectId),CLASS_ID_CONTROLLER,1,CONTROLLER_FKT_STATE_ONLINE), false);
}

function hwControllerReceivedPong(sender)
{
	debug("controller pong "+sender);
	
	var deviceId = getDeviceId(sender);
	
	var myCallback = pongCallback[deviceId];
	if (myCallback!=null)
	{
		pongCallback[deviceId]=null;
		myCallback;
	}
}

function hwControllerUpdateFirmware(receiverObjectId)
{
	info("Update Firmware -> "+objectIdToString(receiverObjectId));

    var deviceId = getDeviceId(receiverObjectId);
	var myFirmwareVersion = moduleVersions[deviceId];
    var myFirmwareId = FIRMWARE_IDS[firmwareTypes[deviceId]];
    var myStatusID = getIoBrokerId(deviceId, CLASS_ID_CONTROLLER, 1, CONTROLLER_CFG_UPDATE_FIRMWARE, CHANNEL_CONFIG);
	
	if (typeof onlineVersions[myFirmwareId]=="undefined")
	{
	  if (myFirmwareVersion!=onlineFirmwareVersion)
	  {
		setStateIoBroker(myStatusID, "ONLINE VERSION UNKNOWN");
		return;
	  }
	}
		
	var onlineFirmwareVersion = onlineVersions[myFirmwareId].version;
	info("Actual firmware version: "+myFirmwareVersion+", online version: "+onlineFirmwareVersion);
	
	if (myFirmwareVersion==onlineFirmwareVersion)
	{
	    setStateIoBroker(myStatusID,"ALREADY UP TO DATE");
		return;
	}
	
	var filename = firmwareTypes[deviceId]+"_"+onlineFirmwareVersion+".bin";

    if (!fs.existsSync(filename))
	{
		info("Downloading firmware...");
	    const file = fs.createWriteStream(filename);
        const request = http.get("http://www.haus-bus.de/"+firmwareTypes[deviceId]+".bin", function(response) 
	    {
          response.pipe(file);
		  updateDownloadedFirmware(receiverObjectId, filename);
        });
	}
	else
	{
		info("Firmware file already downloaded to "+process.cwd());
		updateDownloadedFirmware(receiverObjectId, filename);
	}
}

function updateDownloadedFirmware(receiverObjectId, filename)
{
	var deviceId = getDeviceId(receiverObjectId);
	var objectIdFirmware = receiverObjectId;
	var objectIdBooter = getObjectId(deviceId, CLASS_ID_CONTROLLER,2);
	
	info("Enabling bootloader of device "+deviceId+" -> "+objectIdToString(objectIdFirmware));

	hwControllerReset(objectIdFirmware);
	setTimeout(function(){hwControllerPing(objectIdBooter)},500);
	setTimeout(function(){hwControllerPing(objectIdBooter)},600);
	setTimeout(function(){hwControllerPing(objectIdBooter)},700);
	setTimeout(function(){hwControllerPing(objectIdBooter)},800);
	setTimeout(function(){hwControllerPing(objectIdBooter)},900);
	
	// jetzt sollte der Booter laufen oder er lief schon vorher
	setTimeout(function(){
	  pongCallback[deviceId]=function(){updateDownloadedFirmwareB(receiverObjectId, filename);};
	  hwControllerPing(objectIdBooter);	
	},1200);
}

function updateDownloadedFirmwareB(receiverObjectId, filename)
{
	var deviceId = getDeviceId(receiverObjectId);
	var objectIdFirmware = receiverObjectId;
	var objectIdBooter = getObjectId(deviceId, CLASS_ID_CONTROLLER,2);

	error(receiverObjectId+" -> "+filename);
}

function sleep(time) 
{
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) 
	{
        ;
    }
}


function hwControllerGetModuleId(receiverObjectId)
{
	debug("getModuleId -> "+objectIdToString(receiverObjectId));
	
	var data = [];
	data[0]=2; // Funktion ID
	data[1]=0; // index 0 = installed
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwControllerGetConfiguration(receiverObjectId)
{
	debug("controllerGetConfiguration -> "+objectIdToString(receiverObjectId));
	
	var data = [];
	data[0]=5; // Funktion ID
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}


function hwControllerGetRemoteObjects(receiverObjectId)
{
	debug("getRemoteObjects -> "+objectIdToString(receiverObjectId));
	
	var data = [];
	data[0]=3; // Funktion ID
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId);
}

function hwControllerPing(receiverObjectId, forcePort="")
{
	debug("controllerPing -> "+objectIdToString(receiverObjectId));
	
	var data = [];
	data[0]=127; // Funktion ID
	sendHausbusUdpMessage(receiverObjectId, data, myObjectId, forcePort);
}

function sendHausbusUdpMessage(receiverObjectId, data, senderObjectId, forcePort="")
{
	if (receiverObjectId==0)
	{
		error("Invalid receiver object id 0")
		return;
	}
	
	var totalLength = 14 + data.length;
		
	var datagramm = new Uint8Array(totalLength);
	var datagrammPos = 0;

    // UDP-Header
    datagramm[datagrammPos++] = 0xef;
    datagramm[datagrammPos++] = 0xef;

    // Kontroll-Byte
    datagramm[datagrammPos++] = 0x00;

    // Nachrichtenzaehler
    datagramm[datagrammPos++] = messageCounter++;

    // Sender-ID
    var senderObjectIdBytes = dWordToBytes(senderObjectId);
    senderObjectIdBytes.forEach(element => datagramm[datagrammPos++] = element);

    // Empfänger-ID
    var receiverIdBytes = dWordToBytes(receiverObjectId);

    receiverIdBytes.forEach(element => datagramm[datagrammPos++] = element);

    // Datenlaenge
    var dataLength = data.length;
    var dataLengthBytes = wordToBytes(dataLength);
    dataLengthBytes.forEach(element => datagramm[datagrammPos++] = element);

    // Daten
    data.forEach(element => datagramm[datagrammPos++] = element);

    if (forcePort==9)
	{
	    info("Sende: "+bytesToDebugString(datagramm, 0, totalLength));

		udpSocket.send(datagramm, 0, datagramm.length, forcePort, BROADCAST_SEND_IP, function (err, bytes) 
        {
            if (err) 
            {
                error('UDP send error for ' + BROADCAST_SEND_IP + ':' + forcePort + ': ' + err);
                return;
            }
            
            info('Sent "' + datagramm + '" to ' + BROADCAST_SEND_IP + ':' + forcePort);
        });
	}
	else sendUdpDatagram(datagramm, forcePort);
 }

function dWordToBytes(inValue)
{
	var result = [];
    result[0] = inValue & 0xff;
    result[1] = (inValue >>> 8) & 0xff;
    result[2] = (inValue >>> 16) & 0xff;
	result[3] = (inValue >>> 24) & 0xff;
    return result;
}

function wordToBytes(inValue)
{
	var result = [];
    result[0] = inValue & 0xff;
    result[1] = (inValue >>> 8) & 0xff;
    return result;
}

function bytesToWord(message, startPos)
{
    var result = 0;
    result += message[startPos];
    result += message[startPos +1] * 256;
    return result;
}

function bytesToDword(message, startPos)
{
    var result = 0;
    result += message[startPos];
    result += message[startPos +1] * 256;
    result += message[startPos +2] * 65536;
    result += message[startPos +3] * 16777216;
    return result;
}

function byteToSByte(value)
{
	if (value>127) return value-256;
    return value;
}

function getObjectId(deviceId, classId, instanceId)
{
   deviceId = parseInt(deviceId);
   classId = parseInt(classId);
   instanceId = parseInt(instanceId);
   return (deviceId << 16) + (classId << 8) + instanceId;
}

function getClassId(objectId)
{
    return (objectId >>> 8) & 0xff;
}

function getInstanceId(objectId)
{
    return objectId & 0xff;
}

function getDeviceId(objectId)
{
    return ((objectId >>> 24) & 0xff) * 256 + ((objectId >>> 16) & 0xff);
}

function bytesGetStringLength(message, startPos, dataLength)
{
    var end = startPos + dataLength;
    for (var i = startPos; i < end; i++)
    {
        if (message[i] == 0) return i-startPos;
    }
	return dataLength-startPos;
}

function bytesToString(message, startPos, dataLength)
{
	var result="";
	for (var i=startPos;i<startPos+dataLength;i++)
	{
		result+=String.fromCharCode(message[i]);
	}
	return result;
}



function bytesToWordList(message, startPos, dataLength)
{
    var result = "";
    for (var i = startPos; i < startPos + dataLength; i += 2)
    {
        if (result != "") result += ";";
        result += message[i] + "," + message[i +1];
    }
    return result;
}

function debug(message)
{
	adapter.log.debug(message);
}

function error(message)
{
	adapter.log.error(message);
}

function warn(message)
{
	adapter.log.warn(message);
}

function info(message)
{
	adapter.log.info(message);
}

function bytesToDebugString(message, startPos, dataLength)
{
	var result="";
	for (var i=startPos;i<startPos+dataLength;i++)
	{
		if (i>startPos) result+=", ";
		result+=message[i].toString(16);
	}
	return result;
}

function wordToByteArray(value, message, pos)
{
    message[pos] = value & 0xff;
    message[pos+1] = (value >>> 8) & 0xff;
}

function sByteToByte(value)
{
	if (value<0) return 256+value;
	return value;
}

function dWordToByteArray(value, message, pos)
{
    message[pos] = value & 0xff;
    message[pos+1] = (value >>> 8) & 0xff;
    message[pos+2] = (value >>> 16) & 0xff;
    message[pos+3] = (value >>> 24) & 0xff;
}

function stringToByteArray(value, message, pos)
{
	var i=0
    for (; i < value.length; i++)
    {
        message[pos+i] = value.charAt(i);
    }
    message[i] = 0;
}

function wordListToByteArray(value, message, pos)
{
    if (value == "") return;

	var parts = value.split(";");
	parts.forEach(function(item)
	{
	   var innerParts = item.split(",");
       message[pos++] = innerParts[0];
       message[pos++] = innerParts[1];
    });
}

function addToStringList(add, list)
{
	if (list=="") return add;
	return list+","+add;
}

function isBitSet(value, bit)
{
	var bitValue = Math.pow(2, bit);
	if ((value&bitValue)==bitValue)  return true;
	return false;
}

function setBit(value, bit)
{
	var bitValue = Math.pow(2, bit);
	return value|=bitValue;
}

function clearBit(value, bit)
{
	var bitValue = Math.pow(2, bit);
	return value&=~bitValue;
}

function dump(v) 
{
	var recursionLevel=1;
    var vType = typeof v;
    var out = vType;

    switch (vType) 
	{
        case "number":
		out += ": " + v;
        break;
    case "boolean":
        out += ": " + v;
        break;
    case "string":
        out += "(" + v.length + '): "' + v + '"';
        break;
    case "object":
        //check if null
        if (v === null) out = "null";
        else if (Object.prototype.toString.call(v) === '[object Array]') 
		{
            out = 'array(' + v.length + '): {\n';
            for (var i = 0; i < v.length; i++) 
			{
                out += repeatString('   ', recursionLevel) + "   [" + i + "]:  " +
                    dump(v[i], "none", recursionLevel + 1) + "\n";
            }
            out += repeatString('   ', recursionLevel) + "}";
        }
        else 
		{
            let sContents = "{\n";
            let cnt = 0;
            for (var member in v) 
			{
                //No way to know the original data type of member, since JS
                //always converts it to a string and no other way to parse objects.
                sContents += repeatString('   ', recursionLevel) + "   " + member +
                    ":  " + dump(v[member], "none", recursionLevel + 1) + "\n";
                cnt++;
            }
            sContents += repeatString('   ', recursionLevel) + "}";
            out += "(" + cnt + "): " + sContents;
        }
        break;
    default:
        out = v;
        break;
    }

    return out;
}

/* repeatString() returns a string which has been repeated a set number of times */
function repeatString(str, num) 
{
    var out = '';
    for (var i = 0; i < num; i++) 
	{
        out += str;
    }
    return out;
}

function getInstanceName(deviceId, moduleType, classId, instanceId)
{
  var firmwareType = firmwareTypes[deviceId];
  var moduleType = moduleTypes[deviceId];
  var instanceName;
  
  if (typeof INSTANCES[moduleType]!="undefined" && typeof INSTANCES[moduleType][firmwareType] !="undefined" && typeof INSTANCES[moduleType][firmwareType][classId] !="undefined" && typeof INSTANCES[moduleType][firmwareType][classId][instanceId] !="undefined" ) return INSTANCES[moduleType][firmwareType][classId][instanceId];
  else if (typeof INSTANCES[moduleType]!="undefined" &&  typeof INSTANCES[moduleType]["*"] !="undefined" && typeof INSTANCES[moduleType]["*"][classId] !="undefined" && typeof INSTANCES[moduleType]["*"][classId][instanceId] !="undefined") return INSTANCES[moduleType]["*"][classId][instanceId];
  
  return getClassName(classId)+"_ID"+instanceId;
}

function getIoBrokerId(deviceId,classId,instanceId,propertyName, subChannel="")
{
	var moduleType = moduleTypes[deviceId];
	if (subChannel!="") subChannel+=".";
	return adapter.namespace+"."+deviceId+"."+CLASSES[classId].name+"."+getInstanceName(deviceId, moduleType, classId, instanceId)+"."+subChannel+propertyName;
}

function delay(time) 
{
  return new Promise(resolve => setTimeout(resolve, time));
} 

function initModulesClassesInstances()
{
	CLASSES[CLASS_ID_CONTROLLER]={id:CLASS_ID_CONTROLLER, name:"Modul"};
	CLASSES[CLASS_ID_DIMMER]={id:CLASS_ID_DIMMER, name:"Dimmer"};
	CLASSES[CLASS_ID_RGB_DIMMER]={id:CLASS_ID_DIMMER, name:"RGB_Dimmer"};
	CLASSES[CLASS_ID_FEUCHTESENSOR]={id:CLASS_ID_FEUCHTESENSOR, name:"Feuchtesensoren"};
	CLASSES[CLASS_ID_HELLIGKEITSSENSOR]={id:CLASS_ID_HELLIGKEITSSENSOR, name:"Helligkeitssensoren"};
	CLASSES[CLASS_ID_LED]={id:CLASS_ID_LED, name:"Ausgänge"};
	CLASSES[CLASS_ID_LOGICAL_BUTTON]={id:CLASS_ID_LOGICAL_BUTTON, name:"Hintergrundbeleuchtung"};
	CLASSES[CLASS_ID_ROLLLADEN]={id:CLASS_ID_ROLLLADEN, name:"Rollladen"};
	CLASSES[CLASS_ID_SCHALTER]={id:CLASS_ID_SCHALTER, name:"Relais"};
	CLASSES[CLASS_ID_TASTER]={id:CLASS_ID_TASTER, name:"Eingänge"};
	CLASSES[CLASS_ID_TEMPERATURSENSOR]={id:CLASS_ID_TEMPERATURSENSOR, name:"Temperatursensoren"};
	CLASSES[CLASS_ID_IR_SENSOR]={id:CLASS_ID_IR_SENSOR, name:"IR-Sensoren"};
	CLASSES[CLASS_ID_ANALOGEINGANG]={id:CLASS_ID_ANALOGEINGANG, name:"Analogeingänge"};
	
	for (var key in CLASSES) 
	{
		var obj = CLASSES[key];
		CLASSES[obj.name]=obj;
	}
	
	MODULES[MODUL_ID_32_IO]={id:MODUL_ID_32_IO, name:"32 Kanal IO Modul"};
	MODULES[MODUL_ID_16_RELAIS_V2]={id:MODUL_ID_16_RELAIS_V2, name:"16 Kanal 7A Relaismodul V2"};
	MODULES[MODUL_ID_16_RELAIS_V1]={id:MODUL_ID_16_RELAIS_V1, name:"16 Kanal 7A Relaismodul"};
	MODULES[MODUL_ID_LAN_BRIDGE]={id:MODUL_ID_LAN_BRIDGE, name:"Haus-Bus LAN Brücke"};
	MODULES[MODUL_ID_24_UP_IO]={id:MODUL_ID_24_UP_IO, name:"24 Kanal UP IO-Modul"};
	MODULES[MODUL_ID_4_DIMMER]={id:MODUL_ID_4_DIMMER, name:"4 Kanal Dimmermodul"};
	MODULES[MODUL_ID_6_TASTER]={id:MODUL_ID_6_TASTER, name:"6-fach Taster"};
	MODULES[MODUL_ID_4_TASTER]={id:MODUL_ID_4_TASTER, name:"4-fach Taster"};
	MODULES[MODUL_ID_2_TASTER]={id:MODUL_ID_2_TASTER, name:"2-fach Taster"};
	MODULES[MODUL_ID_1_TASTER]={id:MODUL_ID_1_TASTER, name:"1-fach Taster"};
	MODULES[MODUL_ID_8_DIMMER]={id:MODUL_ID_8_DIMMER, name:"8 Kanal Dimmermodul"};
	MODULES[MODUL_ID_RGB_DIMMER]={id:MODUL_ID_RGB_DIMMER, name:"RGB Dimmermodul"};
	MODULES[MODUL_ID_8_ROLLO]={id:MODUL_ID_8_ROLLO, name:"8 Kanal Rollomodul"};
	MODULES[MODUL_ID_8_RELAIS]={id:MODUL_ID_8_RELAIS, name:"8 Kanal 16A Relaismodul"};
	MODULES[MODUL_ID_12_RELAIS]={id:MODUL_ID_12_RELAIS, name:"12 Kanal 16A Relaismodul"};
	
	for (var key in MODULES) 
	{
	   var obj = MODULES[key];
	   MODULES[obj.name]=obj;
	}
	
	// MODUL_ID_16_RELAIS_V1
        INSTANCES[MODUL_ID_16_RELAIS_V1]={};
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"]={};
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_CONTROLLER][1]="Controller";

	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][1]="Relais_02";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][2]="Relais_04";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][3]="Relais_06";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][4]="Relais_08";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][5]="Relais_09";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][6]="Relais_11";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][7]="Relais_13";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][8]="Relais_15";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][9]="Relais_01";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][10]="Relais_03";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][11]="Relais_05";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][12]="Relais_07";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][13]="Relais_10";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][14]="Relais_12";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][15]="Relais_14";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][16]="Relais_16";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";
	
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][104]="Eingang_01";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][103]="Eingang_02";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][102]="Eingang_03";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][101]="Eingang_04";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][100]="Eingang_05";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][99]="Eingang_06";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][98]="Eingang_07";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][97]="Eingang_08";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][88]="Eingang_09";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][87]="Eingang_10";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][86]="Eingang_11";
	INSTANCES[MODUL_ID_16_RELAIS_V1]["*"][CLASS_ID_TASTER][85]="Eingang_12";
	
	// MODUL_ID_16_RELAIS_V2
        INSTANCES[MODUL_ID_16_RELAIS_V2]={};
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"]={};

	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][17]="Relais_01";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][18]="Relais_02";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][19]="Relais_03";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][20]="Relais_04";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][21]="Relais_05";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][22]="Relais_06";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][23]="Relais_07";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][24]="Relais_08";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][33]="Relais_09";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][34]="Relais_10";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][35]="Relais_11";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][36]="Relais_12";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][37]="Relais_13";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][38]="Relais_14";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][39]="Relais_15";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][40]="Relais_16";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN]={};
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][1]="Rollo_01";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][2]="Rollo_02";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][3]="Rollo_03";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][4]="Rollo_04";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][5]="Rollo_05";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][6]="Rollo_06";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][7]="Rollo_07";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_ROLLLADEN][8]="Rollo_08";


        INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][97]="Eingang_01";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][98]="Eingang_02";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][99]="Eingang_03";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][100]="Eingang_04";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][101]="Eingang_05";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][102]="Eingang_06";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][103]="Eingang_07";
	INSTANCES[MODUL_ID_16_RELAIS_V2]["*"][CLASS_ID_TASTER][104]="Eingang_08";


        // MODUL_ID_8_RELAIS
        INSTANCES[MODUL_ID_8_RELAIS]={};
	INSTANCES[MODUL_ID_8_RELAIS]["*"]={};
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][1]="Relais_01";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][2]="Relais_02";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][3]="Relais_03";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][4]="Relais_04";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][5]="Relais_05";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][6]="Relais_06";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][7]="Relais_07";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][8]="Relais_08";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

        INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][98]="Eingang_01";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][97]="Eingang_02";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][100]="Eingang_03";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][99]="Eingang_04";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][102]="Eingang_05";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][101]="Eingang_06";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][104]="Eingang_07";
	INSTANCES[MODUL_ID_8_RELAIS]["*"][CLASS_ID_TASTER][103]="Eingang_08";
	
	// Nur HBC
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC]={};
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][17]="Relais_01";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][18]="Relais_02";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][19]="Relais_03";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][20]="Relais_04";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][21]="Relais_05";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][22]="Relais_06";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][23]="Relais_07";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][24]="Relais_08";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

    INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][97]="Eingang_01";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][98]="Eingang_02";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][99]="Eingang_03";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][100]="Eingang_04";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][101]="Eingang_05";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][102]="Eingang_06";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][103]="Eingang_07";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_HBC][CLASS_ID_TASTER][104]="Eingang_08";

	// Nur ESP32
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32]={};
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][17]="Relais_01";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][18]="Relais_02";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][19]="Relais_03";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][20]="Relais_04";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][21]="Relais_05";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][22]="Relais_06";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][23]="Relais_07";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][24]="Relais_08";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

    INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][97]="Eingang_01";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][98]="Eingang_02";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][99]="Eingang_03";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][100]="Eingang_04";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][101]="Eingang_05";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][102]="Eingang_06";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][103]="Eingang_07";
	INSTANCES[MODUL_ID_8_RELAIS][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][104]="Eingang_08";
	
	// MODUL_ID_12_RELAIS
    INSTANCES[MODUL_ID_12_RELAIS]={};
	INSTANCES[MODUL_ID_12_RELAIS]["*"]={};
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][17]="Relais_01";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][18]="Relais_02";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][19]="Relais_03";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][20]="Relais_04";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][21]="Relais_05";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][22]="Relais_06";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][23]="Relais_07";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][24]="Relais_08";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][33]="Relais_09";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][34]="Relais_10";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][35]="Relais_11";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_SCHALTER][36]="Relais_12";

    INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][97]="Eingang_01";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][98]="Eingang_02";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][99]="Eingang_03";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][100]="Eingang_04";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][101]="Eingang_05";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][102]="Eingang_06";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][103]="Eingang_07";
	INSTANCES[MODUL_ID_12_RELAIS]["*"][CLASS_ID_TASTER][104]="Eingang_08";
	
	// MODUL_ID_8_ROLLO
        INSTANCES[MODUL_ID_8_ROLLO]={};
	INSTANCES[MODUL_ID_8_ROLLO]["*"]={};
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN]={};
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][1]="Relais_01";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][2]="Relais_02";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][3]="Relais_03";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][4]="Relais_04";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][5]="Relais_05";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][6]="Relais_06";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][7]="Relais_07";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_ROLLLADEN][8]="Relais_08";
	
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

    INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][98]="Eingang_01";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][97]="Eingang_02";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][100]="Eingang_03";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][99]="Eingang_04";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][102]="Eingang_05";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][101]="Eingang_06";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][104]="Eingang_07";
	INSTANCES[MODUL_ID_8_ROLLO]["*"][CLASS_ID_TASTER][103]="Eingang_08";

	
	// MODUL_ID_6_TASTER
    INSTANCES[MODUL_ID_6_TASTER]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][17]="Taster_1";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][18]="Taster_2";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][19]="Taster_3";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][20]="Taster_4";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][21]="Taster_5";
    INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][22]="Taster_6";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][55]="Extern_Taster_5";
    INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TASTER][56]="Extern_Taster_6";

    // Nur HBC
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC]={};
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][38]="Extern_Taster_6";

    // Nur ESP32
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32]={};
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_6_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][38]="Extern_Taster_6";

	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][49]="Led_1";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][50]="Led_2";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][51]="Led_3";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][52]="Led_4";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][53]="Led_5";
    INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][54]="Led_6";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][65]="Extern_Led_1";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][66]="Extern_Led_2";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][67]="Extern_Led_3";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][68]="Extern_Led_4";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][69]="Extern_Led_5";
    INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LED][70]="Extern_Led_6";

	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][1]="Hintergrundbeleuchtung";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][16]="Hintergrundbeleuchtung";

	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][1]="Temperatursensor_1";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][2]="Temperatursensor_2";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][3]="Temperatursensor_3";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][4]="Temperatursensor_4";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][5]="Temperatursensor_5";

	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][1]="Helligkeitssensor";
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][23]="Helligkeitssensor";

	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_FEUCHTESENSOR]={};
	INSTANCES[MODUL_ID_6_TASTER]["*"][CLASS_ID_FEUCHTESENSOR][1]="Feuchtesensor";


    // MODUL_ID_4_TASTER
    INSTANCES[MODUL_ID_4_TASTER]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][17]="Taster_1";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][18]="Taster_2";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][21]="Taster_3";
    INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][22]="Taster_4";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][55]="Extern_Taster_5";
    INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TASTER][56]="Extern_Taster_6";

    // Nur HBC
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC]={};
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][38]="Extern_Taster_6";

    // Nur ESP32
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32]={};
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_4_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][38]="Extern_Taster_6";
	
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][49]="Led_1";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][50]="Led_2";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][53]="Led_3";
    INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][54]="Led_4";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][65]="Extern_Led_1";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][66]="Extern_Led_2";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][67]="Extern_Led_3";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][68]="Extern_Led_4";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][69]="Extern_Led_5";
    INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LED][70]="Extern_Led_6";

	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][1]="Hintergrundbeleuchtung";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][16]="Hintergrundbeleuchtung";

	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][1]="Temperatursensor_1";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][2]="Temperatursensor_2";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][3]="Temperatursensor_3";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][4]="Temperatursensor_4";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][5]="Temperatursensor_5";

	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][1]="Helligkeitssensor";
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][23]="Helligkeitssensor";

	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_FEUCHTESENSOR]={};
	INSTANCES[MODUL_ID_4_TASTER]["*"][CLASS_ID_FEUCHTESENSOR][1]="Feuchtesensor"; 

	
	// MODUL_ID_2_TASTER
    INSTANCES[MODUL_ID_2_TASTER]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][19]="Taster_1";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][20]="Taster_2";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][55]="Extern_Taster_5";
    INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TASTER][56]="Extern_Taster_6";

    // Nur HBC
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC]={};
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][38]="Extern_Taster_6";

    // Nur ESP32
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32]={};
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_2_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][38]="Extern_Taster_6";

	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][51]="Led_1";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][52]="Led_2";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][65]="Extern_Led_1";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][66]="Extern_Led_2";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][67]="Extern_Led_3";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][68]="Extern_Led_4";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][69]="Extern_Led_5";
    INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LED][70]="Extern_Led_6";

	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][1]="Hintergrundbeleuchtung";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][16]="Hintergrundbeleuchtung";

	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][1]="Temperatursensor_1";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][2]="Temperatursensor_2";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][3]="Temperatursensor_3";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][4]="Temperatursensor_4";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][5]="Temperatursensor_5";

	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][1]="Helligkeitssensor";
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][23]="Helligkeitssensor";

	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_FEUCHTESENSOR]={};
	INSTANCES[MODUL_ID_2_TASTER]["*"][CLASS_ID_FEUCHTESENSOR][1]="Feuchtesensor"; 
	
	
	// MODUL_ID_1_TASTER
    INSTANCES[MODUL_ID_1_TASTER]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER][19]="Taster_1";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER][55]="Extern_Taster_5";
    INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TASTER][56]="Extern_Taster_6";

    // Nur HBC
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC]={};
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][38]="Extern_Taster_6";

    // Nur ESP32
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32]={};
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][33]="Extern_Taster_1";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][34]="Extern_Taster_2";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][35]="Extern_Taster_3";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][36]="Extern_Taster_4";
	INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][37]="Extern_Taster_5";
    INSTANCES[MODUL_ID_1_TASTER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][38]="Extern_Taster_6";

	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED][51]="Led_1";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED][65]="Extern_Led_1";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED][66]="Extern_Led_2";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED][67]="Extern_Led_3";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED][68]="Extern_Led_4";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED][69]="Extern_Led_5";
    INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LED][70]="Extern_Led_6";

	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][1]="Hintergrundbeleuchtung";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_LOGICAL_BUTTON][16]="Hintergrundbeleuchtung";

	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][1]="Temperatursensor_1";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][2]="Temperatursensor_2";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][3]="Temperatursensor_3";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][4]="Temperatursensor_4";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_TEMPERATURSENSOR][5]="Temperatursensor_5";

	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][1]="Helligkeitssensor";
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_HELLIGKEITSSENSOR][23]="Helligkeitssensor";

	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_FEUCHTESENSOR]={};
	INSTANCES[MODUL_ID_1_TASTER]["*"][CLASS_ID_FEUCHTESENSOR][1]="Feuchtesensor";
	
    
	// MODUL_ID_24_UP_IO
    INSTANCES[MODUL_ID_24_UP_IO]={};
	INSTANCES[MODUL_ID_24_UP_IO]["*"]={};
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][17]="Eingang_01";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][18]="Eingang_02";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][19]="Eingang_03";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][20]="Eingang_04";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][21]="Eingang_05";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][22]="Eingang_06";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][23]="Eingang_07";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][24]="Eingang_08";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][25]="Eingang_09";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][26]="Eingang_10";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][27]="Eingang_11";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_TASTER][28]="Eingang_12";

	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED]={};
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][49]="Ausgang_01";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][50]="Ausgang_02";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][51]="Ausgang_03";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][52]="Ausgang_04";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][53]="Ausgang_05";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][54]="Ausgang_06";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][65]="Ausgang_07";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][66]="Ausgang_08";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][67]="Ausgang_09";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][68]="Ausgang_10";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][69]="Ausgang_11";
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_LED][70]="Ausgang_12";
	
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_24_UP_IO]["*"][CLASS_ID_SCHALTER][23]="Rote_Modul_LED";

	
	// MODUL_ID_8_DIMMER
    INSTANCES[MODUL_ID_8_DIMMER]={};
	INSTANCES[MODUL_ID_8_DIMMER]["*"]={};
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER]={};
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][1]="Dimmer_01";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][2]="Dimmer_02";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][3]="Dimmer_03";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][4]="Dimmer_04";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][5]="Dimmer_05";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][6]="Dimmer_06";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][7]="Dimmer_07";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_DIMMER][8]="Dimmer_08";

	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

    INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][98]="Eingang_01";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][97]="Eingang_02";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][100]="Eingang_03";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][99]="Eingang_04";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][102]="Eingang_05";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][101]="Eingang_06";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][104]="Eingang_07";
	INSTANCES[MODUL_ID_8_DIMMER]["*"][CLASS_ID_TASTER][103]="Eingang_08";

    // HBC
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][1]="Dimmer_01";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][2]="Dimmer_02";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][3]="Dimmer_03";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][4]="Dimmer_04";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][5]="Dimmer_05";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][6]="Dimmer_06";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][7]="Dimmer_07";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][8]="Dimmer_08";

	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

    INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][71]="Eingang_01";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][72]="Eingang_02";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][99]="Eingang_03";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][100]="Eingang_04";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][101]="Eingang_05";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][102]="Eingang_06";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][103]="Eingang_07";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][104]="Eingang_08";

    // HBC
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][1]="Dimmer_01";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][2]="Dimmer_02";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][3]="Dimmer_03";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][4]="Dimmer_04";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][5]="Dimmer_05";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][6]="Dimmer_06";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][7]="Dimmer_07";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][8]="Dimmer_08";

	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

    INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][71]="Eingang_01";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][72]="Eingang_02";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][99]="Eingang_03";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][100]="Eingang_04";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][101]="Eingang_05";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][102]="Eingang_06";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][103]="Eingang_07";
	INSTANCES[MODUL_ID_8_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][104]="Eingang_08";
	
    // RGB DIMMER
	INSTANCES[MODUL_ID_RGB_DIMMER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][1]="Dimmer_01";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][2]="Dimmer_02";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][3]="Dimmer_03";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][4]="Dimmer_04";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][5]="Dimmer_05";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_DIMMER][6]="Dimmer_06";

	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_RGB_DIMMER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_RGB_DIMMER][1]="RGB_DIMMER_01";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_RGB_DIMMER][2]="RGB_DIMMER_02";

    INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][17]="Eingang_01";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][18]="Eingang_02";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][19]="Eingang_03";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][20]="Eingang_04";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][21]="Eingang_05";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_TASTER][22]="Eingang_06";

	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_HBC][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][1]="Dimmer_01";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][2]="Dimmer_02";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][3]="Dimmer_03";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][4]="Dimmer_04";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][5]="Dimmer_05";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_DIMMER][6]="Dimmer_06";

	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_RGB_DIMMER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_RGB_DIMMER][1]="RGB_DIMMER_01";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_RGB_DIMMER][2]="RGB_DIMMER_02";

    INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][17]="Eingang_01";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][18]="Eingang_02";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][19]="Eingang_03";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][20]="Eingang_04";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][21]="Eingang_05";
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_TASTER][22]="Eingang_06";

	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_RGB_DIMMER][FIRMWARE_ID_ESP32][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";
	
	// MODUL_ID_32_IO
    INSTANCES[MODUL_ID_32_IO]={};
	INSTANCES[MODUL_ID_32_IO]["*"]={};
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][210]="Rote Modul LED";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][49]="Ausgang_01";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][50]="Ausgang_02";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][51]="Ausgang_03";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][52]="Ausgang_04";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][53]="Ausgang_05";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][54]="Ausgang_06";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][55]="Ausgang_07";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][56]="Ausgang_08";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][97]="Ausgang_09";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][98]="Ausgang_10";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][99]="Ausgang_11";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][100]="Ausgang_12";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][101]="Ausgang_13";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][102]="Ausgang_14";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][103]="Ausgang_15";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_SCHALTER][104]="Ausgang_16";

	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][17]="Eingang_01";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][18]="Eingang_02";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][19]="Eingang_03";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][20]="Eingang_04";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][21]="Eingang_05";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][22]="Eingang_06";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][23]="Eingang_07";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][24]="Eingang_08";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][33]="Eingang_09";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][34]="Eingang_10";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][35]="Eingang_11";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][36]="Eingang_12";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][37]="Eingang_13";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][38]="Eingang_14";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][39]="Eingang_15";
	INSTANCES[MODUL_ID_32_IO]["*"][CLASS_ID_TASTER][40]="Eingang_16";

	// MODUL_ID_4_DIMMER
    INSTANCES[MODUL_ID_4_DIMMER]={};
	INSTANCES[MODUL_ID_4_DIMMER]["*"]={};
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_CONTROLLER][1]="Maincontroller";

	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_TASTER][17]="Eingang_1";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_TASTER][18]="Eingang_2";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_TASTER][19]="Eingang_3";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_TASTER][20]="Eingang_4";

	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_ANALOGEINGANG]={};
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_ANALOGEINGANG][17]="Analogeingang_1";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_ANALOGEINGANG][18]="Analogeingang_2";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_ANALOGEINGANG][19]="Analogeingang_3";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_ANALOGEINGANG][20]="Analogeingang_4";

	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_LED]={};
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_LED][49]="Dimmer_1";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_LED][50]="Dimmer_2";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_LED][51]="Dimmer_3";
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_LED][52]="Dimmer_4";

	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_4_DIMMER]["*"][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";

    // MODUL_ID_LAN_BRIDGE
    INSTANCES[MODUL_ID_LAN_BRIDGE]={};
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"]={};
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_CONTROLLER]={};
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_CONTROLLER][1]="Controller";

	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_SCHALTER]={};
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_SCHALTER][210]="Rote_Modul_LED";
	
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER]={};
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][104]="Eingang_01";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][103]="Eingang_02";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][102]="Eingang_03";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][101]="Eingang_04";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][100]="Eingang_05";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][99]="Eingang_06";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][98]="Eingang_07";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][97]="Eingang_08";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][88]="Eingang_09";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][87]="Eingang_10";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][86]="Eingang_11";
	INSTANCES[MODUL_ID_LAN_BRIDGE]["*"][CLASS_ID_TASTER][85]="Eingang_12";
	
	/*
	for (var actModuleType in INSTANCES) 
	{
		var moduleObj = INSTANCES[actModuleType];

	    for (var actFirmwareType in moduleObj) 
	    {
    		var firmwarTypeObj = moduleObj[actFirmwareType];
			for (var actClassId in firmwarTypeObj) 
	        {
        		var classIdObj = firmwarTypeObj[actClassId];
				
				for (var actInstanceId in classIdObj) 
	            {
            		var actInstanceName = classIdObj[actInstanceId];
					classIdObj[actInstanceName]=parseInt(actInstanceId);
    	        }
    	    }
		}
    }
	*/
	
	CONFIG_BITS[CLASS_ID_TASTER]={};
	CONFIG_BITS[CLASS_ID_TASTER]["events"]={};
	CONFIG_BITS[CLASS_ID_TASTER]["events"][TASTER_CFG_EVENT_PRESSED_ENABLED]=0;
	CONFIG_BITS[CLASS_ID_TASTER]["events"][TASTER_CFG_EVENT_CLICKED_ENABLED]=1;
	CONFIG_BITS[CLASS_ID_TASTER]["events"][TASTER_CFG_EVENT_DOUBLE_CLICKED_ENABLED]=2;
	CONFIG_BITS[CLASS_ID_TASTER]["events"][TASTER_CFG_EVENT_HOLD_START_ENABLED]=3;
	CONFIG_BITS[CLASS_ID_TASTER]["events"][TASTER_CFG_EVENT_HOLD_END_ENABLED]=4;
	CONFIG_BITS[CLASS_ID_TASTER]["events"][TASTER_CFG_EVENT_RELEASED_ENABLED]=5;
	CONFIG_BITS[CLASS_ID_TASTER]["events"][TASTER_CFG_LED_FEEDBACK]=7;
	CONFIG_BITS[CLASS_ID_TASTER]["options"]={};
	CONFIG_BITS[CLASS_ID_TASTER]["options"][TASTER_CFG_INVERTED]=0;
	
	CONFIG_BITS[CLASS_ID_ETHERNET]={};
	CONFIG_BITS[CLASS_ID_ETHERNET]["options"]={};
	CONFIG_BITS[CLASS_ID_ETHERNET]["options"][ETHERNET_CFG_FIXED_IP_DHCP]=2;

	CONFIG_BITS[CLASS_ID_LED]={};
	CONFIG_BITS[CLASS_ID_LED]["options"]={};
	CONFIG_BITS[CLASS_ID_LED]["options"][LED_CFG_INVERTED]=0;

	CONFIG_BITS[CLASS_ID_ROLLLADEN]={};
	CONFIG_BITS[CLASS_ID_ROLLLADEN]["options"]={};
	CONFIG_BITS[CLASS_ID_ROLLLADEN]["options"][ROLLO_CFG_INVERT]=0;


	for (var classId in CONFIG_BITS) 
	{
		var typeObject = CONFIG_BITS[classId];

	    for (var configTypeKey in typeObject) 
	    {
			var configObject = typeObject[configTypeKey];

	        for (var configKey in configObject) 
	        {
    		   var bit = parseInt(configObject[configKey]);
     		   configObject[bit]=configKey;
			}
		}
    }
	
	FIRMWARE_IDS[1]=FIRMWARE_ID_AR8;
	FIRMWARE_IDS[2]=FIRMWARE_ID_MS6;
	FIRMWARE_IDS[3]=FIRMWARE_ID_SD6;
	FIRMWARE_IDS[4]=FIRMWARE_ID_SD485;
	FIRMWARE_IDS[5]=FIRMWARE_ID_SONOFF;
	FIRMWARE_IDS[6]=FIRMWARE_ID_S0_Reader;
	FIRMWARE_IDS[7]=FIRMWARE_ID_ESP;
	FIRMWARE_IDS[8]=FIRMWARE_ID_HBC;
	FIRMWARE_IDS[9]=FIRMWARE_ID_HBC;
	FIRMWARE_IDS[10]=FIRMWARE_ID_ESP32;

    for (var firmwareId in FIRMWARE_IDS) 
	{
		var firmwareName = FIRMWARE_IDS[firmwareId];
 	    FIRMWARE_IDS[firmwareName]=firmwareId;
    }
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) module.exports = startAdapter;
// or start the instance directly
else startAdapter();
