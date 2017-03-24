var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://shubham:eros%40123@104.155.227.45:27017/admin';

mongoose.connect(url, {uri_decode_auth: true}, function(err, db) {});

var bookingSchema, Booking;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  	
  	bookingSchema =  mongoose.Schema({
    booking_id:String,
	crn:String,
	customer_id:String,
	driver_id:String,
	car_id:String,
	operator_id:String,
	pickup:[],
	destination:[],
	ratecardtype:String,
	ratecardid:String,
	triptime:Number,
	distance:Number,
	start_time:Date,
	end_time:Date,
	bill:Number,
	currency:String,
	city:String,
	country:String,
	driver_rating:Number,
	customer_rating:Number,
	discount:Number,
	coupon:String,
	status:String,
	final_payment:Number
});

  Booking = mongoose.model('Booking', bookingSchema);

  module.exports.Booking = Booking;


});

  
// Use connect method to connect to the server
// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");

//   db.close();
// });


// var saveBooking = function(bookingobject, callback){
// 	bookingobject.save(callback);
// }

// var updateBooking = function(bookingobject, callback){

// }

// var getbooking = function(booking_id, callback){

// }

// var getbookingByCustomerId = function(customer_id, starttimestamp, endtimestamp, callback){

// }

// var getbookingByOperatorId = function(operator_id, starttimestamp, endtimestamp, callback){

// }

// var getbookingByDriverId = function(driver_id,  starttimestamp, endtimestamp, callback){

// }
