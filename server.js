var express = require('express');
var app = express();
var cron = require('node-cron');
var soda = require('soda-js');
const mongoose = require('mongoose');
var parkingdb = 'mongodb+srv://admin:'+process.env.atlas_pw+'@parkingdb-myglv.mongodb.net/parkingdb?retryWrites=true&w=majority';    //process.env.atlas_pw
var rows;
var date = new Date();

//initiating mongodb connection
mongoose.connect(parkingdb, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once("open", function() {
  console.log("MongoDB database connection established successfully");
});
mongoose.set('useFindAndModify', false);  //deprecated warnings

//create a parking schema
var ParkingSchema = mongoose.Schema({
      bay_id: Number,
      st_marker_id: String,
      status: String,
      lat: Number,
      lon: Number,
      modified: String
    });
var Parking = mongoose.model('Parking', ParkingSchema);

//calling mine and store functions at intervals
cron.schedule("* 5 * * * * ", () => {      
mine(Parking);
});

cron.schedule("* * 1 * * * ", () => {
store(Parking);
});




function mine(Parking){             //function to extract data from API for real-time parking availability
  console.log("mine reached");
	var parkingapi = new soda.Consumer('data.melbourne.vic.gov.au');
  data = parkingapi.query()
  .withDataset('vh2v-4nfs')
  .limit()
  .where({})
  .getRows()
  .on('success', function(rows) {
		db.once("open", function() {
	  		console.log("MongoDB database connection established successfully");
	    //console.log(rows);
	    for (var i=0;i<rows.length;i++)
	    {
	    	var query = {bay_id: rows[i].bay_id};
		    var temp = {modified: date};
		    Object.assign(rows[i], temp);
		    //console.log(rows[i]);
		    Parking.findOneAndUpdate(query, rows[i], {upsert: true}, function(err, doc) {
			    if (err) console.log(err);
			    //res.end();
        });
	    }
    })
    .on('error', function(error) { console.error(error); });

  });
}

async function store(Parking){
  console.log("store reached");
  var parkingapi = new soda.Consumer('data.melbourne.vic.gov.au');
    data = parkingapi.query()
    .withDataset('vh2v-4nfs')
    .limit()
    .where({})
    .getRows()
    .on('success', function(rows) { 
      //console.log(rows);
      mongoose.connect(parkingdb, { useNewUrlParser: true });
      var db = mongoose.connection;
      db.on('error', console.error.bind(console, 'MongoDB connection error:'));
      db.once("open", async function() {
          console.log("MongoDB database connection established successfully");

        var temp = {modified: date};
        var value = Object.assign({data:rows}, temp);
        console.log("marker ");

        await db.collection('ParkingIntervals').insert(value);
        //setInterval 3 secs
        var count = await db.collection('ParkingIntervals').count();
        while(count>3){
            db.collection('ParkingIntervals').findOneAndDelete({},{sort:{"modified":1}});
            count--;
            console.log("trim: ", count);
        }
      })
      .on('error', function(error) { console.error(error); });
    });
}

var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});