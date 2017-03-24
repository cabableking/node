var express = require('express');
var elasticsearch = require('elasticsearch');
var router = express.Router();
var esutil = require('../util/elasticutil');
var mqttutil = require('../util/mqttutil');
var mongo = require('../util/mongoutil');


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


var createbooking = function(req, res, next){
}



function searchandcreatebooking(req, res, next) {
  esutil.createSearchString(req.body, true, function(err, searchString){
      esutil.searchCabs(searchString, function(err, hits){
          if(err==""){
              for(var hit in hits){
                  var current_cabid = hit.id;
                  sendbooking(current_cabid, function(err, bookingstatus){
                  if(err==""){
                    if(bookingstatus.status == "accept"){
                      var result = [];
                      result.push(bookingstatus)
                      result.push(hit)
                      res.contentType('application/json');
                      res.send(JSON.stringify(result));
                    }else{
                      if(bookingstatus.status == "driverreject"){
                          console.log("booking rejected by cab " +  current_cabid + "... retrying with the new cab");
                      }else{
                          console.log("cab already booked:  " +  current_cabid + "... retrying with the new cab");
                      }
                    }
                  }else{
                      res.send(err);
                  }
              });
              }
       
            

          }
      })
  });

}

/* GET home page. */
router.post('/createbooking', function(req, res, next){
  

  //create booking id 
  // Generate a v1 UUID (time-based) 
  const uuidV4 = require('uuid/v4');
  var bookingid = uuidV4(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a' 

  var booking = new mongo.Booking({
    booking_id: bookingid
  });
  //get car id 
  var reqBody = req.body;
  var car_id = reqBody["car_id"];
  var customerid = reqBody["customerid"];
  var operator_id = reqBody["operator_id"];
  var driver_id = reqBody["driver_id"];
  var pickup = reqBody["pickup"];
  var destination = reqBody["destination"];
  var ratecardtype = reqBody["ratecardtype"];
  var ratecardid = reqBody["ratecardid"];
  var city = reqBody["city"];
  var country = reqBody["country"];
  var device_id = reqBody["device_id"];

  //update the car status to inbooking 
  esutil.getCab(car_id,"bangalore", function(resultCar, error){
    console.log(resultCar._source.id)
    console.log(resultCar._version)
    //free car 
    if(resultCar._source.status=='2'){
      //set car status to in-booking (1) 
      esutil.updateCabStatus(car_id, 1, "bangalore", resultCar._version, function(response, error){
        console.dir(response);
        if(error!=null || error!=undefined){
          console.log("Booking attempt failed, car already booked. " + error);
        }else{
            //send booking to driver 
            mqttutil.publishToDevice(device_id, JSON.stringify(booking), function(err){
              console.log("publishdone");
              if(err==null){
                console.log("Booking sent to device : " + device_id);
              }

               //save booking on acknowledgement 
              if(err==null){
                booking.crn = 'CRN'+ getRandomInt(100000, 999999);
                booking.customer_id = customerid;
                booking.driver_id = driver_id;
                booking.operator_id = operator_id;
                booking.pickup = pickup;
                booking.destination = destination;
                booking.ratecardtype = ratecardtype;
                booking.ratecardid = ratecardid;
                booking.city = city;
                booking.country = country;
                booking.device_id =  device_id;
                booking.status = 'sent';              
                booking.save(function(err, bookingsaved){
                  console.log("Saved :" + bookingsaved + "to db");
                });
              }           

            });
     
        }
      })

    }
  })

  res.send("done")
});

module.exports = router;

