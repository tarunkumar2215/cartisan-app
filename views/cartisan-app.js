var app = angular.module("cartisanApp", ['ngRoute','ngStorage','ngMaterial']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "home.html"
    })
    .otherwise({
        template : "<h1>None</h1><p>Nothing has been selected</p>"
    });
});


/************************** Home Controller **************************
*/

app.controller("HomeCtrl", ['$scope','$location','$http','$localStorage','$timeout', '$q', '$log','$window', function ($scope,$location,$http,$localStorage,$timeout,$q,$log,$window) {
  
  //Variable declations
  $scope.city = "";
  $scope.lat  = "";
  $scope.lat  = "";
  $scope.petrolPrice = "";
  $scope.dieselPrice = "";
  $scope.fuelPriceData  = [];
  $scope.RATE_API_URL   = "http://localhost:3000/api/get-fuel-price";
  $scope.PLACE_DETAILS_API_URL = "http://localhost:3000/api/get-place-details";
  $scope.place_id = "ChIJIW7F5loYDTkRdR1sO6V7bzE";
  $scope.state = true;
  $scope.place_details = "";

  // Place details data
  $scope.place_details_img  = "";
  $scope.place_name         = "";
  $scope.place_tot_ratting  = "";
  $scope.place_formatted_address = "";

  $scope.toggle = function () {
    $scope.state = !$scope.state;
  };

  // @function getFuelPrice: If user city is found then we will fetch the fuel rates from api's
  $scope.getFuelPrice = function(){
    
    if($scope.city){
      $http({
           method: 'POST',
           url: $scope.RATE_API_URL,
           headers: {'Content-Type': 'application/x-www-form-urlencoded'},
           data: 'city='+$scope.city
       }).then(function mySuccess(response) {
            console.log(response);
            if(response.data.status == true){
              if(response.data.data){
                //$scope.fuelPriceData  = response.data.data;
                var data = response.data.data;
                for(row in data){
                  if(data[row].type == 'petrol'){
                    $scope.petrolPrice = data[row].price;
                    
                  }else if(data[row].type == 'diesel'){
                    $scope.dieselPrice = data[row].price;
                  }
                }


              }else{
                console.log("No data available for user");
              }
            }
          }, function myError(response) {
              console.log("Error in User search data");
      });
    }
  }

  function processPlaceDetailsData(body){ 

    body = JSON.parse(body);

    if(body.status && body.status.toLowerCase() == 'ok'){

        var lat = '';
        var lng = '';

        if(body.result.geometry){
           var geo = body.result.geometry;
          for (x in geo) {
            if(x == 'location'){
              lat = geo[x].lat;
              lng = geo[x].lng; 
            }
          }
        }

        var reviewsHtml = ""; 
        var reviews     = body.result.reviews;
        
        for(data in reviews){
          console.log(reviews[data]);
          reviewsHtml += "Author:"+reviews[data].author_name;
          reviewsHtml += "author_url:"+reviews[data].author_url;
          reviewsHtml += "profile_photo_url:"+reviews[data].profile_photo_url;
          reviewsHtml += "rating:"+reviews[data].rating;
          reviewsHtml += "relative_time_description:"+reviews[data].relative_time_description;
          reviewsHtml += "text:"+reviews[data].text;
          reviewsHtml += "time:"+reviews[data].time;
          reviewsHtml += '<br/><hr>';
        }

        var sideNavBarHtml = 'Name:'+body.result.name+'<br/>'+
                          'formatted_address:'+body.result.formatted_address+'<br/>'+
                          'latitude:'+body.result.icon+'<br/>'+
                          'latitude:'+body.result.rating+'<br/>'+
                          'latitude:'+body.result.place_id+'<br/>'+
                          'latitude:'+body.result.formatted_address+'<br/>'+
                          'latitude:'+lat+'<br/>'+
                          'longitude:'+lng+'<br/>'+
                          'Reviews:'+reviewsHtml;

        $scope.place_details_img  = body.result.icon;
        $scope.place_name         = body.result.name;
        $scope.place_tot_ratting  = body.result.rating;
        $scope.place_formatted_address = body.result.formatted_address;

        //document.getElementById('sidenav').innerHTML(sideNavBarHtml);
        // $scope.place_details = sideNavBarHtml;
    }
  }

  // @function getPlaceDetails: Get the place details from the API
  function getPlaceDetails(){
    
    if($scope.place_id){
      $http({
           method: 'POST',
           url: $scope.PLACE_DETAILS_API_URL,
           headers: {'Content-Type': 'application/x-www-form-urlencoded'},
           data: 'place_id='+$scope.place_id
       }).then(function mySuccess(response) {
            console.log(response);
            if(response.data.status == true){
              processPlaceDetailsData(response.data.data);
            }
          }, function myError(response) {
              console.log("Error in User search data");
      });
    }
  }
  $scope.getPlaceDetails();


  /** 
    *This area detals with getting user current GEO location data
    * 
  **/
  
  var geocoder;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
  } 

  // //Get the latitude and the longitude;
  function successFunction(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      $localStorage.lat = lat;
      $localStorage.lng = lng;
      codeLatLng(lat, lng);
  }

  function errorFunction(error){
    alert('Geocoder failed ERROR(' + error.code + '): ' + error.message);
    //Need to make call 
  }

  function initialize() {
    console.log("Application initialized.");
    geocoder = new google.maps.Geocoder();
  }

  function codeLatLng(lat, lng) {

    var latlng = new google.maps.LatLng(lat, lng);
    
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      
      if (status == google.maps.GeocoderStatus.OK) {
        console.log(results[0]);

        if (results[0]) {
          //formatted address
          //find country name
            for (var i=0; i<results[0].address_components.length; i++) {
              for (var b=0;b<results[0].address_components[i].types.length;b++) {
              //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (results[0].address_components[i].types[b] == "administrative_area_level_2") {
                    //this is the object you are looking for
                    city= results[0].address_components[i];
                    break;
                }
              }
            }

        $localStorage.city  = city.short_name;
        $scope.city         = city.short_name;  
        $scope.$digest();
        $scope.getFuelPrice();
        $scope.initMap();


        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  }

  initialize();

   /** 
    *This area detals with drawing gas station marker using current GEO location data
    * 
  **/

  var map;
  var infowindow;

  $scope.initMap = function() {

    var pyrmont = {lat: $localStorage.lat, lng: $localStorage.lng};

    map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 15
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: pyrmont,
      radius: 1000,
      type: ['gas_station']
    }, callback);
  }

  function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
    }
  }

  function createMarker(place) {

    var placeLoc = place.geometry.location;
    var destLat  = place.geometry.location.lat();
    var destLng  = place.geometry.location.lng();
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {

       infowindow.setContent('<div><img src="'+place.icon+'" />\
          <strong>' + place.name + '</strong><br>' +
            'Place ID: ' + place.place_id + '<br>' +
            'Ratting: ' + place.rating + '<br>' +
            '<button type="button" style="color:#4285F4;font-weight: bold;padding: 10px;border-radius: 10px;float: right;" onclick="plantDirectionMap('+destLat+','+destLng+','+$localStorage.lat+','+$localStorage.lng+');">Direction <i class="fas fa-arrow-right"></i></button>' +
            '</div>');

        infowindow.open(map, this);
    });
  }


}]);


/* End of Home Controller */



