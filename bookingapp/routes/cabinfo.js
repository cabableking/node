var express = require('express');
var elasticsearch = require('elasticsearch');
var esutil = require('../util/elasticutil')
var router = express.Router();



/* GET home page. */
router.post('/getcabs', function(req, res, next) {

  console.log(req.body.location)
  esutil.createSearchString(req.body, false, function(err, searchString){
      if(err==""){
        esutil.searchCabs(searchString, function(err, hits){
          if(err==""){
            res.send(hits);
          }else{
            res.send(err);
          }
        }) 
      }else{
        res.send(err);
      }
  });
});


/* SEARCH cabs . */
router.post('/searchCabs', function(req, res, next) {

  console.log(req.body.location)
  esutil.createSearchString(req.body, false, function(err, searchString){
      if(err==""){
        esutil.searchCabs(searchString, function(err, hits){
          if(err==""){
            res.send(hits);
          }else{
            res.send(err);
          }
        }) 
      }else{
        res.send(err);
      }
  });
});




module.exports = router;




