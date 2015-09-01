var models = require("./models.js");

//handlers for main app page (profile.html)
function retrieveProfileHandler(req, res){
    var user = req.cookies.user;
    models.getProfile( user, function ( janswer ){res.json( janswer );} );
}

function saveProfileHandler(req, res){
    var the_body = req.body;
    the_body.user = req.cookies.user;  //add in the user user
    models.saveProfile( the_body, function ( janswer ){res.json( janswer );} );
}

function addRentalHandler(req, res){
    var the_body = req.body;
    the_body.user = req.cookies.user;  //add in the user user
    models.addRental( the_body, function ( janswer ){res.json( janswer );} );
}

//handler for the matching, where the magic happens
function matchHandler(req, res){
        //convert doc to object and build query
        var data = req.query;
        if(!Object.keys(req.query).length) data = req.body;
        for(var k in data){
            //if field is not empty
            if(data[k].length){
                //check if the field is bed or bath
                //if it is check if the field is 3
                //if it is we know we must add some range operators
                if((k === 'bed' || k === 'bath') && data[k] === "3"){
                    //bed/bath is greater than equal to 3
                    data[k] = {$gte: 3};
                }else if(k === 'rentallocation'){
                    console.log(data[k]);
                    var val = data[k];
                    data.rentallocation = {$regex: new RegExp('^'+val+'$', 'i')};

                }else if(k === 'rentrange'){
                //if field is rentrange then we need to convert to numerical
                //ranges
                    if(data[k] === 'low') data.rent = {$gte: 0, $lt: 600};
                    if(data[k] === 'medium') data.rent = {$gte: 601, $lt: 800};
                    if(data[k] === 'high') data.rent = {$gte: 801, $lt: 1000};
                    if(data[k] === 'nomax') data.rent = {$gte: 1001};

                    delete data[k];
                }else if(k === 'amenities'){
                //if field is amenities, we need to check the array against array
                //of each rental property.  use $all operator because all items in users array
                //must match rentals
                    var tags = data[k];
                    data[k] = {$all: tags};
                }

            }else{
            //field is empty remove from query
                delete data[k];
            }
        }
        //finally use the constructed query to search against database
        models.findRental( data, req.cookies.user, function ( matches ){ res.json(  matches ); 
        } );
}

module.exports = {
    "retrieveProfileHandler": retrieveProfileHandler,
    "saveProfileHandler": saveProfileHandler,
    "matchHandler": matchHandler,
    "addRentalHandler": addRentalHandler
};
