var express = require('express');
//var router = express.Router();
var soda = require('soda-js');
const mongoose = require('mongoose');
var parkingdb = 'mongodb+srv://admin:process.env.atlas_pw@parkingdb-myglv.mongodb.net/parkingdb?retryWrites=true&w=majority';    //process.env.atlas_pw
var rows;
var date = new Date();

//initiating mongodb connection
mongoose.connect(parkingdb, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once("open", function() {
  console.log("MongoDB database connection established successfully");
 // console.log(db.ParkingIntervals.count());
});

//{"bay_id":"2048","st_marker_id":"3519S","status":"Unoccupied","location":{"latitude":"-37.81306404969793","longitude":"144.95582130129625"}}

var ParkingSchema = mongoose.Schema({
      bay_id: Number,
      st_marker_id: String,
      status: String,
      lat: Number,
      lon: Number,
      modified: String
    });
var Parking = mongoose.model('Parking', ParkingSchema);

mongoose.set('useFindAndModify', false);  //deprecated warnings

var app = express();

/* GET home page. 
router.get('/api/test', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

app.get('/api/test', function(req, res, next) {

	// define Schema
      

    setInterval(moner, 3000, Parking);			//call mine function every five minutes
    console.log("loop started");
    //Mock data to send across to webapp
    /*
    locations = []
    locations.push({'lat':'1234', 'lng':'1234'})
    locations.push({'lat':'213', 'lng':'123'})
    locations.push({'lat':'345', 'lng':'657'})
    locations.push({'lat':'345', 'lng':'453'})
    //Set the response
    res.json({locations: locations})
    */
});

app.get('/api/test2', async function(req, res, next) {

    
    
    setInterval(store, 10000, Parking);     //call store function 
    console.log("store called");

//    trim(await db.collection('ParkingIntervals').count())
    //var count=await db.collection('ParkingIntervals').count()
    //console.log("dsf",await db.collection('ParkingIntervals').count());
    //trim(count);
    //console.log("dsf",await db.collection('ParkingIntervals').count());
});



function mine(Parking){
  console.log("miner reached");
	var parkingapi = new soda.Consumer('data.melbourne.vic.gov.au');
    
    //console.log(date);
    data = parkingapi.query()
      .withDataset('vh2v-4nfs')
      .limit()
      .where({})
      //.where({ within_circle(location,'-37.81586448563712',144.98141868728942,1000) })
      .getRows()
        .on('success', function(rows) {
        	//console.log(rows);
        
  			db.once("open", function() {
		  		console.log("MongoDB database connection established successfully");
	    		
	 
		    // a document instance
		    //console.log(rows);
		    for (var i=0;i<rows.length;i++)
		    {
		    	/*var parking1 = new Parking(rows[i],date);
			    parking1.save(function (err, parking) {
			    if (err) return console.error(err);
			    //console.log(rows);
			    });*/

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

function store(Parking){

  console.log("store reached");
  var parkingapi = new soda.Consumer('data.melbourne.vic.gov.au');
    //console.log(date);
    data = parkingapi.query()
      .withDataset('vh2v-4nfs')
      .limit(2)
      .where({})
      //.where({ within_circle(location,'-37.81586448563712',144.98141868728942,1000) })
      .getRows()
        .on('success', function(rows) { 
          //console.log(rows);
          mongoose.connect(parkingdb, { useNewUrlParser: true });
          var db = mongoose.connection;
          db.on('error', console.error.bind(console, 'MongoDB connection error:'));
          db.once("open", function() {
              console.log("MongoDB database connection established successfully");
              
   

          /*for (var i=0;i<rows.length;i++)
          {
            /*var parking1 = new Parking(rows[i],date);
            parking1.save(function (err, parking) {
            if (err) return console.error(err);
            //console.log(rows);
            });*/ /*

            var query = {bay_id: rows[i].bay_id};
            var temp = {modified: date};
            Object.assign(rows, temp);
            //console.log(rows[i]);
            Parking.findOneAndUpdate(query, rows[i], {upsert: true}, function(err, doc) {
              if (err) console.log(err);
              //res.end();
          });

          }*/
          var temp = {modified: date};
          var value = Object.assign({data:rows}, temp);
          console.log(value);

          db.collection('ParkingIntervals').insert(value);      
          })
          
          .on('error', function(error) { console.error(error); });

      });
    //
    trim();
}

async function trim(){
  //if count>3
    //await db.collection('ParkingIntervals').deleteOne({"modified": );
    var count=await db.collection('ParkingIntervals').count();
    console.log("WQEWRWERWE",count);
    while(count>3){
        db.collection('ParkingIntervals').findOneAndDelete({},{sort:{"modified":1}})
        count--;
      }

    
      //db.collection('ParkingIntervals').delete({modified: result});
      //  console.log(await db.collection('ParkingIntervals').find().sort({"modified":1}).limit(1).toArray());
}

var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

//module.exports = app;