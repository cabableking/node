var express = require('express');
var elasticsearch = require('elasticsearch');

var esClient = new elasticsearch.Client({
  host: '35.187.196.150:9200',
  log: 'error'
});


var getCab = function(cab_id, city, callback){
	esClient.get({
	  index: city,
	  type: 'cab',
	  id: cab_id
	}, function (error, response) {	
		console.log(response)
		callback(response, error);
	});
}

var updateCabStatus= function(cab_id, newstatus, city, oldversion, callback){
	esClient.update({
	  index: city,
	  type: 'cab',
	  id: cab_id,
	  version : oldversion,
	  body: {
	    // put the partial document under the `doc` key
	    doc: {
	      status: newstatus
	    }
	  }
	}, function (error, response) {
	  console.log(response);
	  callback(response, error);
	})
}


var searchCabs = function(searchString, mycallback){
    esClient.search({
    index: 'bangalore',
    type: 'cab',
    body: JSON.parse(searchString) }).then(function (resp) {
    var hits = resp.hits.hits;
    mycallback("", hits)
  }, function (err) {
    mycallback(err, "")
  }); 
}
  
  
var createSearchString = function(reqBody, issort, mycallback, fromcity, tocity){

  var basicString = "{    \"query\" : {     \"bool\" : {      \"must\" : [ _terms_  _nested_], _filter_          }    }  } _sort_ }";
  var nestedString = "{   \"nested\" :{          \"path\" : \"ratecards\",          \"score_mode\" : \"avg\",          \"query\" : {            \"bool\" : {              \"must\" : [                _ratecard_                ]              }            }          }        }";
  var sortString = ",  \"sort\": [    {      \"_geo_distance\": {        \"location\": _location_ ,        \"order\":         \"asc\",        \"unit\":          \"km\",         \"distance_type\": \"plane\"       }    }  ]"

  var termQueries = "";
  var filterQueries = [];
  var nestedQueries = [];
  for(var attributeName in reqBody){
    console.log(attributeName)
    switch(attributeName){
      case "status": 
        var statusValue = reqBody[attributeName];
        termQueries = termQueries.concat("{\"term\":{\"status\": " + statusValue + "}},");
        break;
      case "category":
        var categoryValue = reqBody[attributeName];
        termQueries = termQueries.concat("{\"terms\":{\"category\": " + categoryValue.toString() + "}},");
        break;
      case "parentcat":
        var categoryValue = reqBody[attributeName];
        termQueries = termQueries.concat("{\"terms\":{\"parentcat\": " + categoryValue.toString() + "}},");
        break;
      case "ratecards":
        var rateCardBody = reqBody[attributeName];
  
        for (var rateCardType in rateCardBody) {
          console.log(rateCardBody)
           //each type of rate card 
           var i=0;
           for(var rateCardAttr in rateCardBody[rateCardType]){
             switch(rateCardAttr){
              case "gte":
                for(var ratecardkeyobject in rateCardBody[rateCardType][rateCardAttr]){
                   for(var ratecardkey in rateCardBody[rateCardType][rateCardAttr][ratecardkeyobject]){
                         var query =  "{\"range\" : {                  \"_ratecardkey_\" : {\"gte\" : _ratecardvalue_}           }}";
                         console.log(rateCardBody[rateCardType][rateCardAttr])
                         query = query.replace("_ratecardkey_", "ratecards." + rateCardType + "." + ratecardkey);
                         query = query.replace("_ratecardvalue_", rateCardBody[rateCardType][rateCardAttr][ratecardkeyobject][ratecardkey]);
                         nestedQueries.push(query);
                   }
                  
                }
               
                break;
              case "lte":
                  for(var ratecardkeyobject in rateCardBody[rateCardType][rateCardAttr]){
                   for(var ratecardkey in rateCardBody[rateCardType][rateCardAttr][ratecardkeyobject]){
                         var query =  "{\"range\" : {                  \"_ratecardkey_\" : {\"lte\" : _ratecardvalue_}           }}";
                         console.log(rateCardBody[rateCardType][rateCardAttr])
                         query = query.replace("_ratecardkey_", "ratecards." + rateCardType + "." + ratecardkey);
                         query = query.replace("_ratecardvalue_", rateCardBody[rateCardType][rateCardAttr][ratecardkeyobject][ratecardkey]);
                         nestedQueries.push(query);
                   }
                  
                }
                break;
              case "eq":
                for(var ratecardkeyobject in rateCardBody[rateCardType][rateCardAttr]){
                   for(var ratecardkey in rateCardBody[rateCardType][rateCardAttr][ratecardkeyobject]){
                         var query =  "{\"term\" : {                  \"_ratecardkey_\" : _ratecardvalue_          }}";
                         console.log(rateCardBody[rateCardType][rateCardAttr])
                         query = query.replace("_ratecardkey_", "ratecards." + rateCardType + "." + ratecardkey);
                         query = query.replace("_ratecardvalue_", rateCardBody[rateCardType][rateCardAttr][ratecardkeyobject][ratecardkey]);
                         nestedQueries.push(query);
                   }
                  
                }
                break;

              
              default : 
                console.log("This should not happen ");
             }
             i++;
           }

        }
        break;
      case "location":
        var locationValue = reqBody[attributeName];
        filterQueries.push(" \"filter\" :  {                \"geo_distance\" : {                    \"distance\" : \"5km\",                    \"location\" :[" +  locationValue.toString()  + "]}");
         if(issort){
           sortString = sortString.replace("_location_", locationValue)
         }
        break;
      case "city":
        var cityArray = reqBody[attributeName];
        if(cityArray[0]==cityArray[1]){
          //check only intranorm 
        } 
      default:
        console.log("Dont know what this is ");
    }   
  }

  // basicString.replace("_terms_",termQueries)
  nestedString = nestedString.replace("_ratecard_", nestedQueries.toString())
  basicString = basicString.replace("_terms_", termQueries);
  basicString = basicString.replace("_nested_", nestedString);
  basicString = basicString.replace("_filter_", filterQueries[0]);

  if(issort){
    basicString = basicString.replace("_sort_", sortString);
  }else{
    basicString = basicString.replace("_sort_", "");
  }

  process.nextTick(function(){
    mycallback("", basicString)
  });
}



module.exports.searchCabs = searchCabs;
module.exports.createSearchString = createSearchString;
module.exports.getCab = getCab;
module.exports.updateCabStatus = updateCabStatus;



