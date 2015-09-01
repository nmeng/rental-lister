var login = require("./login.js");

var cookie_options = {};

//handlers for login page
//expect body to be {user: String, password: String}
//provides callBack with either {url: url} or {user: Bool, password: Bool}
function loginHandler(req, res){
    var the_body = req.query;
    login.handleLogin( the_body, function ( janswer ){
        if( janswer.user !== true || janswer.password !== true )
            res.json( {"message": "fail"} );
        else {
            //sucess set the cookie, usertype so we know where to redirect
            res.cookie('user', the_body.user, cookie_options);
            res.cookie('usertype', janswer.usertype, cookie_options);
            if(janswer.usertype === "client"){console.log("client"); res.json({"url": "./profile.html"});}
            else{ res.json({"url": "./provider.html"});} };
    });
}

//expect body to be {user: String, password: String}
//provides callBack with either {saved: Bool} or {user: Bool, password: Bool}
function registerHandler(req, res){
  var the_body = req.body;
  login.handleRegistration( the_body ,
    function ( janswer ){
        if( janswer.saved === false )
            res.json( janswer );
        else {
            //sucess set the cookie, usertype so we know where to redirect
            res.cookie('user', the_body.user, cookie_options);
            res.cookie('usertype', the_body.usertype, cookie_options);
            if(the_body.usertype === "client") res.json({"url": "./profile.html"});
            else res.json({"url": "./provider.html"});
        };
    });
}

//handler for settings changes, user can only change password for now
//uses the existence checker in the login.js file
function settingsHandler(req, res){
    var the_body = req.body;
    the_body.user = req.cookies.user;
    login.settings( the_body, function ( janswer ){ res.json( janswer );} );
}

module.exports = {
    "loginHandler": loginHandler,
    "registerHandler": registerHandler,
    "settingsHandler": settingsHandler
};
