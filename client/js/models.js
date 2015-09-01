var mongoose = require("mongoose"),
    mongoUrl;

    // set up our services
if (process.env.VCAP_SERVICES) {
           services = JSON.parse(process.env.VCAP_SERVICES);
           console.log( JSON.stringify( services ));
           mongoUrl = services["mongolab"][0].credentials.uri;
} else {
           //use this when not running on Cloud Foundry
           mongoUrl = "mongodb://localhost/findapt";
}

//test out moongoose
mongoose.createConnection(mongoUrl);

//schema for users profile
var profile_schema = mongoose.Schema({ 
  'user': {type: String, select: false, unique: true},
  'rentaltype': String, //apartment, condo, house
  'rentallocation': String, //sacramento, ca
  'rentrange': String, //low, med, high, nomax
  'bed': String, //1, 2, 3+
  'bath': String, //1, 2, 3+ 
  'amenities': [String],//[washerdyer, internet, cable]
  'saved': {type: [String], select: false}, //saved properties
});

var profile_model = mongoose.model("profile", profile_schema); //profile => collection profiles

var rental_schema = mongoose.Schema({ 
  'image': String, //url of image
  'address': {unique: true, type: String}, //"123 Marvel St"
  'rentallocation': String, //sacramento, ca
  'rentaltype': String, //apartment, condo, house
  'rent': Number, //900
  'bed': String, //1, 2, 3+
  'bath': String, //1, 2, 3+
  'amenities': [String], //washerdyer, internet
  'user': String //to display contact info
});

var rental_model = mongoose.model("rental", rental_schema); //profile => collection profiles

//gets user's profile
function mongoGet( user, callBack ){
  console.log( "mongoGet: " + user );
  profile_model.find({"user": user}, {'_id': 0}, 
    function (err, result) {
      if (err !== null) {
         console.log("ERROR: " + err);
         callBack({"user": null});
         return;
    }
      if( result.length > 0 ) callBack(result);
      else callBack({"user": null});
    }
  );
}

//saves users profile
function mongoSave( body, callBack ){
  var query = {"user": body.user};
  profile_model.findOneAndUpdate( query, body, {upsert: true, "new": true}, function(err, doc){ 
    console.log( "saved: " + JSON.stringify( doc) );
    callBack({"message": "good"}); 
  });
}

//adds rental into database
function addRental( body, callBack ){
  console.log(body);
  var query = {"user": body.user};
  rental_model.findOneAndUpdate( body, body, {upsert: true, "new": true}, function(err, doc){ 
    console.log(doc);
    console.log(err);
    console.log( "addedd: " + JSON.stringify( doc) );
    callBack({"message": "good"}); 
  });
}

//find rentals that match user's profile (query is 'body')
function findRental( body, user, callBack ){
  rental_model.find(body, {}, {sort: {_id: -1}},function (err, result) {
      if (err !== null) {
        console.log("ERROR: " + err);
        callBack({"result": null});
        return;
      }
      if( result.length > 0 ){
        callBack(result);
      }else{ 
        callBack({"result": null});
      }

    }
  );
}

module.exports = {
          "getProfile": mongoGet,
          "findRental": findRental,
          "saveProfile": mongoSave,
          "addRental": addRental
				};