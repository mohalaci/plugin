#!/usr/bin/env nodejs
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var async = require('async');
var path = require("path");

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

var getPaymentStateRequestBuilder = new BarionRequestBuilderFactory.BarionGetPaymentStateRequestBuilder();


/*
Save plugin into the database
*/
function saveMarketPlacePlugin(plugin, callback) {
    db.connect(dbUrl, function (err, database) {
        if (err) throw err
        var dBase = database.db("plugindb")
        dBase.collection("marketplaceplugin").insertOne(plugin, function (err, res) {
            if (err) return callback(err)
            database.close()
            var result = { "status": "OK" }
            callback(null, result)
        })
    })
}

/*
Get every plugin from database
*/
function getPlugins(callback) {
    db.connect(dbUrl, function (err, database) {
        var plugins = [];
        if (err) throw err
        var dBase = database.db("plugindb")
        var cursor = dBase.collection("marketplaceplugin").find()
        cursor.each(function (err, item) {
            if (err || item == null) {
                database.close()
                if (plugins.length > 0) {
                    callback(null, plugins)
                } else {
                    callback(err)
                }
            } else {
                var plugin = {
                    pluginId: item.pluginId,
                    pluginUrl: item.pluginUrl,
                    lastUpdatedAt: item.lastUpdatedAt,
                    resources: {
                        imageUrl: item.resources.imageUrl,
                        title: item.resources.title
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
function clearPluginCollection(callback) {
    db.connect(dbUrl, function (err, database) {
        var users = [];
        if (err) throw err
        var dBase = database.db("plugindb")
        var cursor = dBase.collection("marketplaceplugin").deleteMany({}, function (err, res) {
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

app.post('/callback', urlencodedParser, function(req, res){
    if (req != null){
        console.log(req);
    }
    res.status(200);
    res.json({status:"ok"});
});

app.get('/getpaymentstate', function(req, res){
    var paymentId = req.query.paymentId
    if (paymentId != null) {

        var getPaymentStateOptionsWithBuilder = getPaymentStateRequestBuilder
            .setPOSKey('ec5abfa2-5eea-42db-9568-b9a4cf825b88')
            .setPaymentId(paymentId)
            .build();

        var paymentState;
        async.series([
        function (callback) {
            barion.getPaymentState(getPaymentStateOptionsWithBuilder, function (err, data) {
                if (err) {
                    paymentData = "errror";
                    callback()
                } else {
                    console.log("getPaymentState result, data: ")
                    console.log(data)
                    callback(data)
                }
            })
        }], function (data) {
            res.setHeader('Content-Type', 'application/json')
            if (data) {
                res.status(200)
                console.log(JSON.stringify({ status: data.Status }))
                res.json({ status: data.Status })
            } else {
                res.status(500)
                res.json({ ERROR: "ERROR" })
            }
        })
    }
});



/*
Method - GET
Generate a payment in Barion Test environment and return the paymentId parameter
*/
app.post('/genpayment', urlencodedParser, function (req, res) {
    var paymentStartRequestBuilder = new BarionRequestBuilderFactory.BarionPaymentStartRequestBuilder();
    console.log(req);
    var paymentStartOptionsWithObject = {
        POSKey: "ec5abfa2-5eea-42db-9568-b9a4cf825b88",
        PaymentType: "Immediate",
        GuestCheckOut: true,
        FundingSources: ["All"],
        PaymentRequestId: "request_id_generated_by_the_shop",
        Locale: "hu-HU",
        Currency: "HUF",
        RedirectUrl: "https://plugin.mobileappdev.org/redirect.html",
        CallbackUrl: "https://plugin.mobileappdev.org/callback?do=ok",
        Transactions: [
            {
                POSTransactionId: "test_payment_id_from_shop",
                Payee: "testshop@barion.com",
                Total: req.body.bookPrice,
                Items: [
                    {
                        Name: req.body.bookAuthor + ": " + req.body.bookTitle,
                        Description: req.body.bookPublisher + ", ISBN " + req.body.bookISBN,
                        Quantity: 1,
                        Unit: "db",
                        UnitPrice: req.body.bookPrice,
                        ItemTotal: req.body.bookPrice
                    }
                ]
            }
        ]
    };

    console.log(paymentStartOptionsWithObject);

    var paymentData;
    async.series([
        function (callback) {
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
        }], function (data) {
            res.setHeader('Content-Type', 'application/json')
            if (data) {
                res.status(200)
                console.log(JSON.stringify({ paymentId: data.PaymentId }))
                res.json({ paymentId: data.PaymentId })
            } else {
                res.status(500)
                res.json({ ERROR: "ERROR" })
            }
        })

});

/*
Method - POST
Add new plugin to the database
*/
app.post('/addplugin', urlencodedParser, function (req, res) {
    var dbResult;
    async.series([
        function (callback) {
            var plugin = {
                pluginId: req.body.pluginId,
                lastUpdatedAt: req.body.lastUpdatedAt,
                pluginUrl: req.body.pluginUrl,
                resources: {
                    imageUrl: req.body.resources.imageUrl,
                    title: req.body.resources.title
                }
            }
            saveMarketPlacePlugin(plugin, function (err, result) {
                if (err) {
                    dbResult = { status: "ERROR" }
                    return callback(dbResult)
                } else {
                    dbResult = { status: "OK" }
                    callback()
                }
            })
        }], function (err) {
            res.setHeader('Content-Type', 'application/json')

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
app.get('/getplugins', function (req, res) {
    var dbResult;
    async.series([
        function (callback) {
            getPlugins(function (err, result) {
                if (err) {
                    dbResult = { status: "FAILED" }
                    return callback(dbResult)
                }
                dbResult = result
                callback()
            })
        }], function (err) {
            res.setHeader('Content-Type', 'application/json')
            if (err) {
                res.status(500)
            } else {
                res.status(200)
            }
            console.log(JSON.stringify({ plugins: dbResult }))
            res.json({ plugins: dbResult })
        })
})

/*
Method - POST
Delete every plugin from database
*/
app.post('/clearplugins', function (req, res) {
    var dbResult;
    async.series([
        function (callback) {
            clearPluginCollection(function (err, result) {
                if (err) {
                    return callback(err)
                } else {
                    dbResult = result
                    return callback(null, result)
                }
            })
        }
    ], function (err) {
        res.setHeader('Content-Type', 'application/json')
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
app.get('/plugin', function (req, res) {
    //res.setHeader('Cache-Control', 'public, max-age=31557600'); // one year
    res.sendFile(path.join(__dirname + '/public/index.html'));
    //__dirname : It will resolve to your project folder.
});

var server = app.listen(8083, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Plugin server listening at http://%s:%s", host, port)

})
