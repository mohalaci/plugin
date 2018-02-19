#!/usr/bin/env nodejs
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var async = require('async');
var path    = require("path");

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(bodyParser.json())

// database variables
var mongo = require('mongodb');
var db = mongo.MongoClient
var dbUrl = "mongodb://localhost:27017/plugindb"

var barion = new (require('barion-nodejs'))(BarionTest);

// Import BarionError
var BarionError = barion.BarionError;

// Import the built-in requestbuilders
var BarionRequestBuilderFactory = barion.BarionRequestBuilderFactory;

/*
Save plugin into the database
*/
function saveMarketPlacePlugin(plugin, callback){
   db.connect(dbUrl, function (err, database) {
      if (err) throw err
      var dBase = database.db("plugindb")
      dBase.collection("marketplaceplugin").insertOne(plugin, function(err, res){
         if (err) return callback(err)
            //console.log("3. ")
         //console.log("User successfully saved")
         database.close()
         var result = { "status" : "OK"}
         callback(null, result)
      })
   })
}

/*
Get every plugin from database
*/
function getPlugins(callback){
   db.connect(dbUrl, function (err, database) {
      var plugins = [];
      if (err) throw err
      var dBase = database.db("plugindb")
      var cursor = dBase.collection("marketplaceplugin").find()
      cursor.each(function(err, item){
         if (err || item == null) {
            database.close()
            if (plugins.length > 0) {
               callback(null, plugins)
            } else {
               callback(err)
            }
         } else  {
            var plugin = {
               pluginId : item.pluginId,
               pluginUrl : item.pluginUrl,
               lastUpdatedAt : item.lastUpdatedAt,
               resources : {
                  imageUrl : item.resources.imageUrl,
                  title : item.resources.title
               }
            }
            plugins.push(plugin)
            
         }
      })
   })
}

/**
Delete every plugin from database
*/
function clearPluginCollection(callback){
   db.connect(dbUrl, function (err, database) {
      var users = [];
      if (err) throw err
      var dBase = database.db("plugindb")
      var cursor = dBase.collection("marketplaceplugin").deleteMany({}, function(err, res){
         if (err) {
            callback(err)
         } else {
            callback(null, res)
         }
         database.close()
      })
   })
}

app.use(express.static('public'));

/*
Method - GET
Generate a payment in Barion Test environment and return the paymentId parameter
*/
app.get('/genpayment', function(req, res){
   var paymentStartRequestBuilder  = new BarionRequestBuilderFactory.BarionPaymentStartRequestBuilder();

var paymentStartOptionsWithObject = {
    POSKey: "ec5abfa2-5eea-42db-9568-b9a4cf825b88",
    PaymentType: "Immediate",
    GuestCheckOut: true,
    FundingSources: ["All"],
    PaymentRequestId: "request_id_generated_by_the_shop",
    Locale: "hu-HU",
    Currency: "HUF",
    Transactions: [
        {
            POSTransactionId: "test_payment_id_from_shop",
            Payee: "testshop@barion.com",
            Total: "1000",
            Items: [
                {
                    Name: "Test product",
                    Description: "My favorite test product",
                    Quantity: 1,
                    Unit: "db",
                    UnitPrice: 1000,
                    ItemTotal: 1000
                }
            ]
        }
    ]
};

var paymentData;
async.series([
   function(callback){
      barion.startPayment(paymentStartOptionsWithObject, function (err, data) {
    if (err) {
      paymentData = "errror";
      callback()
    } else {
      console.log("paymentstart result, data: ")
      console.log(data)
      callback(data)
    }
})
   }], function(data){
      res.setHeader('Content-Type','application/json')
      //res.setHeader('Access-Control-Allow-Origin', '*')
    if (data) {
            res.status(200)
            console.log(JSON.stringify({paymentId:data.PaymentId}))
         res.json({paymentId:data.PaymentId})
    } else {
        res.status(500)
        res.json({ERROR:"ERROR"})
    }
   })

});

/*
Method - POST
Add new plugin to the database
*/
app.post('/addplugin', urlencodedParser, function(req, res) {
   var dbResult;
   async.series([
      function(callback){
         var plugin = {
            pluginId : req.body.pluginId,
            lastUpdatedAt : req.body.lastUpdatedAt,
            pluginUrl : req.body.pluginUrl,
            resources : {
               imageUrl : req.body.resources.imageUrl,
               title : req.body.resources.title
               /*headerText : {
                  i18n : {
                     huHU : req.body.resources.headerText.i18n.huHU,
                     enUS : req.body.resources.headerText.i18n.enUS
                  }
               }*/
            }
         }
         saveMarketPlacePlugin(plugin, function(err, result){
            if (err) {
               dbResult = {status : "ERROR"}
               return callback(dbResult)
            } else {
               dbResult = {status : "OK"}
               callback()
            }
         })
      }], function(err){
         res.setHeader('Content-Type','application/json')

         if (err) {
            res.status(500)
            res.json(err)
         } else {
            res.status(200)
            res.json(dbResult)   
         }
      })
})

/*
Method - GET
Return every plugin from database
*/
app.get('/getplugins', function(req, res){
   var dbResult;
   async.series([
      function(callback){
         getPlugins(function(err, result){
         if (err) {
               dbResult = {status : "FAILED"}
               return callback(dbResult)
            }
            dbResult = result
            callback()
         })
      }], function(err){
         res.setHeader('Content-Type','application/json')
         if (err) {
            res.status(500)
         } else {
            res.status(200)
         }
            console.log(JSON.stringify({plugins:dbResult}))
         res.json({plugins:dbResult})
         //res.end(JSON.stringify(dbResult))
      })
})

/*
Method - POST
Delete every plugin from database
*/
app.post('/clearplugins', function(req, res){
   var dbResult;
   async.series([
      function(callback){
         clearPluginCollection(function(err, result){
            if (err) {
               return callback(err)
            } else {
               dbResult = result
               return callback(null, result)
            }
         })
      }
      ], function(err){
         res.setHeader('Content-Type','application/json')
         if (err) {
               res.status(500)
            } else {
               res.status(200)
            }
         res.json(dbResult)
      })
})

/*
Method - GET
Return plugin app
*/
app.get('/plugin',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});


var server = app.listen(8083, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Plugin server listening at http://%s:%s", host, port)

})
