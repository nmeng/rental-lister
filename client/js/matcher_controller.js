//handle the results from logging in
//redirects to main app page
function handleLoginResult(resp_body) {
  if(resp_body.message === "fail") $("span#loginresult").text("Username/Password: No match found, try again!");
  if( resp_body.url ) window.location = resp_body.url; //load main app page
};

//handle the results from changing password
//displays error or success message
function handleSettingsResult(resp_body) {
  if(resp_body.message === "success"){
    $("span#settingsresult").text("Changes saved!");
  }else{
    $("span#settingsresult").text("Error! Please check if your current password is correct.");
  }
};

//handle the results from registering
//redirects to main app page
function handleRegisterResult(resp_body) {
  if( resp_body.url ) window.location = resp_body.url;
};

//handle the results from saving profile
//alerts user if saved successfully
function handleSaveProfile(err, resp_body) {
  console.log(resp_body);
  if(resp_body === 'success'){
    $("span#profileresult").text("Profile saved successfully!");
  }else{
    $("span#profileresult").text("Unsuccessful save, try again!");
  }
};

//this function handles the result after user
//explicitly clicks the add button, the page
//is reloaded to display to the user the new listings
function handleAddRental(err, resp_body) {
  if(resp_body === 'success'){
    $("span#profileresult").text("Added successfully!");
    location.reload();
    console.log('success');
  }else{
    $("span#profileresult").text("Unsuccessful add, try again!");
  }
};

//handle the results from retieving users profile
//gets the info and fills it in for user
function handleRetrieveResult(resp_body) {
    //lets clear what user has entered first
    $('form').trigger("reset");
    var e = resp_body[0];
      for(var key in e){
        if(e[key].length){
          if(key === 'amenities'){
            e[key].forEach(function(el){
              $("input:checkbox[value='"+el+"']").prop('checked', true);
            });
          }else{
            $("#"+key).val(e[key]);
          }
        }
      }
      $("span#profileresult").text("Got it!");

  }

//handle the results from matching
//parses results and prints on screen
//if have time do the parsing server side?
function handleMatchResult(resp_body) {
  var str = "<p></p>";
  if(resp_body.length){
    resp_body.every(function(e){
      str += "<div id='listing'>";
      if('image' in e) str += "<p><img src="+ e['image'] +"></p>";
      str += "<span class='rentlabel'>$" + e['rent'] + "/month</span>"; //required
      str += "<span><h3>" + e['address'] + "</h3>"; //required
      str += "<h4>" + e['rentallocation'] + "</h4></span>"; //required
      if('bed' in e) str += "<span class='details'><p><span class='resultlabel'>Bedrooms</span>: " + e['bed'] + "</p>";
      if('bath' in e) str += "<p><span class='resultlabel'>Bathrooms</span>: " + e['bath'] + "</p>";
      if('amenities' in e) str += "<p><span class='resultlabel'>Amenities</span>: " + e['amenities'] + "</p>";
      str += "<p><span class='resultlabel'>Type</span>: " + e['rentaltype'] + "</p>";
      str += "<p><span class='resultlabel'>Contact</span>: " + e['user'] + "</p> </span></div> <br>";
      return str;
    });
  }else{
    str += "no results </div>";
    console.log(str);
  }
  $('#results').html(str);
};

//for adding rentals, does a little more checking
//on what user enters
function addRentalValue(){
  var regxLN = /^[A-Za-z., 0-9#]+$/; //letters and numbers
  var regxN = /^[0-9]+$/; //numbers
  //get values that user entered
  var obj = {};
  var valid = true;
   $(".listen").each(function(index){
    var attribute = $(this).attr("id");
    var attrval = $("#"+attribute).val();
    if((attribute === "rent") && (!regxN.test(attrval))){
      valid = false; return false;
    }else if(((attribute === "rentaltype") || (attribute === "rentallocation") || (attribute === "address") ) 
      && (attrval === undefined || (!regxLN.test(attrval)))){ valid = false; return false; }
    valid = true;
    obj[attribute] = attrval;
  });
  if(valid === false){return false;}
  else{
    var amenities = $( "input:checkbox[name='amenities']:checked" ).map(function () {return this.value;}).get();
    if(!amenities.length){ amenities = ['']; }
    obj.amenities = amenities;
    return obj;
  }
}

//for save profile and match, we don't care if
//user decides to leave options blank
function getValues(){
  var obj = {};
   $(".listen").each(function(index){
    var attribute = $(this).attr("id");
    var attrval = $("#"+attribute).val();
    obj[attribute] = attrval;
  });
    var amenities = $( "input:checkbox[name='amenities']:checked" ).map(function () {return this.value;}).get();
    if(!amenities.length){ amenities = ['']; }
    obj.amenities = amenities;

    return obj;
}
//for tabs
function selectTab(bid){
    $(".tabs button").removeClass("active");
    $(".tabs button#"+bid).addClass("active");

    $(".login").addClass("hidden");
    $(".triad").addClass("hidden");
    $("div.tab"+bid).removeClass("hidden");

}

var index_main = function (){

//button listeners

  //settings
  $("button#settings").on("click", function (event){ 
    $.post("settings.json",
           {"password": $("#currentpw").val(), "newpw": $("#newpw").val() },
           handleSettingsResult);
  });
  
  //login
  $("button#login").on("click", function (event){ 
    $.get("login.json",
           {"user": $("#old_name").val(), "password": $("#old_pass").val() },
           handleLoginResult);
  });

  //register
  $("button#register").on("click", function (event){
    var user =  $("#new_name").val();
    var pass =  $("#new_pass").val();
    var regx = /^[a-zA-Z0-9]+$/;
    var usertype = $( "input:radio[name='usertype']:checked" ).val();
    if(regx.test(user) && regx.test(pass) && usertype!=undefined){
      $.post("register.json",
             {"user": user, "password": pass, "usertype":  usertype},
             handleRegisterResult);
    }else{
      $("span#registerresult").text("please enter valid user/pass and usertype");
    }
  });

  //save
  $("button#saveprofile").on("click", function (event){ 
    var values = getValues();
    //post to server
    $.post("saveprofile.json", values, handleSaveProfile);
  });

    //add rental
  $("button#addrental").on("click", function (event){ 
    var values = addRentalValue();
    if(values === false){
      $("span#profileresult").text("Invalid entry! Check your input!");
    }else{
    //post to server
    console.log(values);
     $.post("addrental.json", values, handleAddRental);
    }
  });

  //match
  $("button#match").on("click", function (event){
    var values = getValues();
    $.get("matchmatch.json", values, handleMatchResult);
  });

  //retrieve
  $("button#retrieveprofile").on("click", function (event){ 
    $.get("retrieveprofile.json", handleRetrieveResult);
  });

  //logout
  $("button#logout").on("click", function (event){ 
     $.get("logout.json", function(resp){ if( resp.url ) window.location = resp.url; });
  });

  //for tabs
  $(".tabs button").on("click", function(event){
      var bid = event.currentTarget.id; //get id of button clicked on
      selectTab(bid);
  });
  }