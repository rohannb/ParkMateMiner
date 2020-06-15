var express = require('express');
//var router = express.Router();
var soda = require('soda-js');
const mongoose = require('mongoose');
var parkingdb = 'mongodb+srv://admin:sit737group2@parkingdb-myglv.mongodb.net/parkingdb?retryWrites=true&w=majority';
var rows;

mongoose.set('useFindAndModify', false);  //deprecated warnings

var app = express();

/* GET home page. 
router.get('/api/test', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

app.get('/api/test', function(req, res, next) {

	// define Schema
    var ParkingSchema = mongoose.Schema({
      bay_id: Number,
      st_marker_id: String,
      status: String,
      modified: String
    });
	var Parking = mongoose.model('Parking', ParkingSchema);

    setInterval(mine, 300000, Parking);			//call mine function every five minutes
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

function mine(Parking){
	var parkingapi = new soda.Consumer('data.melbourne.vic.gov.au');
    var date = new Date();
    //console.log(date);
    data = parkingapi.query()
      .withDataset('vh2v-4nfs')
      .limit()
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
			    console.log(rows[i]);
			    Parking.findOneAndUpdate(query, rows[i], {upsert: true}, function(err, doc) {
				    if (err) console.log(err);
				    //res.end();
				});

		    }
		    
        })
        
        .on('error', function(error) { console.error(error); });

	});
}

var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

//module.exports = app;