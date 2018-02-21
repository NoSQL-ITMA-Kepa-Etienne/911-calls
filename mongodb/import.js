var mongodb = require('mongodb');
var csv = require('csv-parser');
var fs = require('fs');

var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/911-calls';

var insertCalls = function(db, callback) {
    var collection = db.collection('calls');

    var calls = [];
    fs.createReadStream('../911.csv')
        .pipe(csv())
        .on('data', data => {
        var call = {
                location: {
                    type: "Point",
                    coordinates: [parseFloat(data.lng), parseFloat(data.lat)]
                },
                zip: data.zip,
                category: data.title.substring(0, data.title.indexOf(':')),
                event: data.title.substring(data.title.indexOf(':') + 1, data.title.length).trim(),
                date: new Date(data.timeStamp),
                township: data.twp,
                address: data.addr
            };
            calls.push(call);
        })
        .on('end', () => {
          collection.insertMany(calls, (err, result) => {
            callback(result)
          });
        });
}

MongoClient.connect(mongoUrl, (err, db) => {
    insertCalls(db, result => {
        console.log(`${result.insertedCount} calls inserted`);
        db.close();
    });
});
