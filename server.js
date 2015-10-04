var express = require("express"),
    connect = require("connect"),
    bodyParser = require("body-parser");
    cookieParser = require('cookie-parser');
    http = require("http"),
    login_handlers = require("./login_routes.js"),
	profile_handlers = require("./client/js/routes.js"),
    app = express();

port = process.env.PORT || 8080;
    http.createServer(app).listen(port);
    console.log("Express is listening on port " + port);

// configure the app to use the client directory for static files
app.use(express.static(__dirname + "/client"));

// tell Express to parse incoming JSON objects
app.use(bodyParser.urlencoded({extended:true}));  //this allows req.body; makes it easier to read

var cookie_options = {};
app.use(cookieParser('S3CRE7'));  //to be used if signing

//routes for login page (index.html)
app.get("/login.json", login_handlers.loginHandler);

app.post("/register.json", login_handlers.registerHandler);

//clear cookie when user logs out, redirect to index
app.get("/logout.json", function(res, req){ 
    req.clearCookie('user'); 
    req.clearCookie('usertype'); 
    req.json({"url": "./index.html"}); });

//routes for main app page (profile.html)
//retrieves user profile info
app.get("/retrieveprofile.json", 
    function(res, req){ 
    	profile_handlers.retrieveProfileHandler( res, req); });

//saves users profile
app.post("/saveprofile.json", profile_handlers.saveProfileHandler);
//add a rental to the database
app.post("/addrental.json", profile_handlers.addRentalHandler);
//change settings, password
app.post("/settings.json", function(res, req){ login_handlers.settingsHandler(res, req); });
//get results users profile
app.get("/matchmatch.json", 
    function(res, req){
        //check if object is empty, if it is we just want to 
        //load the items in database that provider created
        res.body.user = res.cookies.user;
        if(!Object.keys(res.body).length) profile_handlers.matchHandler( res, req); //if empty
        else profile_handlers.matchHandler( res, req); 
    });

//check session, if doesn't exist redirect login
app.get("/auth.json", function(res, req){
	if(res.cookies.user === undefined){ req.json({"url": "./index.html"}); }
});

