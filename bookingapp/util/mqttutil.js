var express = require('express');
var mqtt = require('mqtt')


var TOPIC_DRIVER_DEVICE = "device/driver/"
var TOPIC_LOCATION_UPDATE = "device/location"

var mqttClient = mqtt.connect('tcp://104.155.209.21:1883')
mqttClient.on('connect', function () {
  console.log("connected")
  mqttClient.on("packetsend", function(packet){console.dir(packet)})
  mqttClient.on("packetreceive", function(packet){console.dir(packet)})
});

var publishToDevice = function(device_id, message, callback){
	var topic = TOPIC_DRIVER_DEVICE + device_id;
	console.log("publishing to topic: " + topic);
	mqttClient.publish(topic, message, {qos:2, retain:true}, callback);
}

var publishToChannel = function(topicname, message, callback){
	mqttClient.publish(topicname,message, [], callback);
}


module.exports.publishToChannel = publishToChannel;
module.exports.publishToDevice = publishToDevice;