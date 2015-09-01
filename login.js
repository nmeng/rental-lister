var mongoose = require("mongoose"),
    //require to hash passwords
    bcrypt = require('bcrypt'),
    mongoUrl;

if (process.env.VCAP_SERVICES) {
    //for cloud foundry
    services = JSON.parse(process.env.VCAP_SERVICES);
    mongoUrl = services["mongolab"][0].credentials.uri;
} else {
   //use this when not running on Cloud Foundry
   mongoUrl = "mongodb://localhost/findapt";
}

mongoose.connect(mongoUrl);

//set up new collection: schema + model
var UserSchema = mongoose.Schema({
  user: {type: String, unique : true }, //the user name
  password: String, //user's choosen password hashed
  history: [String],
  compromised: [String],
  usertype: String //usertype is either client or provider
});

var User = mongoose.model("User", UserSchema);

//expects login to be of form {user: String, password: String, usertype: String}
//provides callBack with arg: {"user": bool, "password": bool} or {err: error}
function mongoCheckExistence( login, callBack ){
  var user = login.user;          //assume unique
  var pass = login.password;      //not unique
  User.findOne({"user": user},
    function (err, result) {
      if (err !== null) {
       console.log("ERROR: " + err);
       callBack({"err": err});
       return;
      }
      if( result ){
        if(bcrypt.compareSync(pass, result.password)) //check if hashes match, true
           //both matched, return usertype as well
          callBack({"user": true, "password": true, "usertype": result.usertype});
        else
          callBack({"user": true, "password": false}); //only user matched
        } else {
        callBack({"user": false, "password": null});     //user did not match
        }
   });
  }

//expects login to be of form {user: String, password: String}
//provides callBack with arg: {"saved": bool} or {err: error}
function mongoRegister( login, callBack ){
  mongoCheckExistence( login, function( result ){
    if( result.err ){
      callBack({"err": result.err});  //just pass it back to callee
      return;
    }
    if( result.user ){
       callBack({"saved": false});  //exists so was not saved
    } else {
      // Hash the password with the salt
      var hash = bcrypt.hashSync(login.password, 10);
      var user = new User( {"user": login.user, password: hash,
                            "history": [], "compromised": [], "usertype": login.usertype });
      user.save(function (err, doc){ 
       console.log( "register result: " + JSON.stringify( err ) + " & " + JSON.stringify( doc));
      });
      callBack({"saved": true});
    }
 });
}

//expects login to be of form {user: String, password: String}
//provides callBack with arg: {"user": bool, "password": bool} or {err: error}
function mongoLogin( login, callBack ){
  mongoCheckExistence( login, function( result ){
    if( result.err )
         callBack({"err": result.err});  //just pass it back to callee
    else
         callBack(result);  //let callee know how it matched
  });
}

//checks if user enters the correct current password
//if they do then go ahead and update, if not return error
function settings( passwords, callBack ){
  mongoCheckExistence( passwords, function( result ){
    if( result.user !== true || result.password !== true ){
      callBack({"message": "fail"});
    }else {
      // Hash the password with the salt
      var newhash = bcrypt.hashSync(passwords.newpw, 10);
      User.findOneAndUpdate( {"user": passwords.user}, {password: newhash}, {"new": true}, function(err, doc){ 
        if( err ) callBack({"message": "fail"}); 
          console.log( "password changed" );
          callBack({"message": "success"});
        });
      }
    });
}

module.exports = {
          "handleRegistration": mongoRegister,
          "handleLogin": mongoLogin,
          "checkExistence": mongoCheckExistence,
          "settings": settings
				};