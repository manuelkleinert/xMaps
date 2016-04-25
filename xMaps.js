/*#####################################################################################################################

                    PPPPPPPPPPPPPPPPP
                    P::::::::::::::::P
                    P::::::PPPPPP:::::P
                    PP:::::P     P:::::P
xxxxxxx      xxxxxxx  P::::P     P:::::Paaaaaaaaaaaaa     ggggggggg   ggggg    eeeeeeeeeeee    rrrrr   rrrrrrrrr
 x:::::x    x:::::x   P::::P     P:::::Pa::::::::::::a   g:::::::::ggg::::g  ee::::::::::::ee  r::::rrr:::::::::r
  x:::::x  x:::::x    P::::PPPPPP:::::P aaaaaaaaa:::::a g:::::::::::::::::g e::::::eeeee:::::eer:::::::::::::::::r
   x:::::xx:::::x     P:::::::::::::PP           a::::ag::::::ggggg::::::gge::::::e     e:::::err::::::rrrrr::::::r
    x::::::::::x      P::::PPPPPPPPP      aaaaaaa:::::ag:::::g     g:::::g e:::::::eeeee::::::e r:::::r     r:::::r
     x::::::::x       P::::P            aa::::::::::::ag:::::g     g:::::g e:::::::::::::::::e  r:::::r     rrrrrrr
     x::::::::x       P::::P           a::::aaaa::::::ag:::::g     g:::::g e::::::eeeeeeeeeee   r:::::r
    x::::::::::x      P::::P          a::::a    a:::::ag::::::g    g:::::g e:::::::e            r:::::r
   x:::::xx:::::x   PP::::::PP        a::::a    a:::::ag:::::::ggggg:::::g e::::::::e           r:::::r
  x:::::x  x:::::x  P::::::::P        a:::::aaaa::::::a g::::::::::::::::g  e::::::::eeeeeeee   r:::::r
 x:::::x    x:::::x P::::::::P         a::::::::::aa:::a gg::::::::::::::g   ee:::::::::::::e   r:::::r
xxxxxxx      xxxxxxxPPPPPPPPPP          aaaaaaaaaa  aaaa   gggggggg::::::g     eeeeeeeeeeeeee   rrrrrrr
                                                                   g:::::g
                                                       gggggg      g:::::g
                                                       g:::::gg   gg:::::g
                                                        g::::::ggg:::::::g
                                                         gg:::::::::::::g
                                                           ggg::::::ggg
                                                              gggggg

© xPager - xMaps - Manuel Kleinert - www.xpager.ch - info(at)xpager.ch - v 2.2.2 - 25.04.2016
#####################################################################################################################*/

(function($){
	$.fn.xMaps = function(options){
		if(!options){var options = {};}
		return this.each(function() {
			options.obj = this;
			new xMaps(options);
		});
	}
}(jQuery));

// Referenzen Class
var xMaps = function(options) {
	this.options = $.extend({
		obj: false,
		lat:0,                  // Latitude
		lng: 0,                 // Longitude
        address:false,          // Adress Position
        geolocation:false,      // GPS Position
        top: 0,                 // Map move top
        left:0,                 // Map move left
		zoom: 0,                // Zoom 1-18
		zoomControl: true,      // Zoom Controller
		scrollWheel: true,      // Map Scroll (Zoom)
        draggable:true,         // Map Drag (Fade)
		panControl: true,       // Navigations Controller
		mapTypeControl: true,   // Controller for Style
        mapType:"ROADMAP",      // Style (HYBRID/ROADMAP/SATELLITE/TERRAIN)
		streetView: true,       // StreetView Controller
        showMarker:true,        // Show Marker
        markerIcon: "",         // Add other Icon
        markerTitle: false,     // Titel
		markerContent: false,   // Text
        markerOpen:false,       // Text open on start
		style: false,           // Map Style
        center:false,           // Center Top Left Addition [Top,left]
        mobileDraggable:false   // Mobile Fade
	}, options);

    // Options to Attributs
	for(var name in this.options){eval("this."+name+"=this.options."+name);}

    // Set Obj
	if(this.options.obj){
		this.obj =  this.options.obj[0];
	}

    // Attributs
	this.geocoder = new google.maps.Geocoder();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
	this.location = false;
	this.styledMap;
	this.map;
	this.mapOptions;
    this.content = "Error";
	this.markerArray = [];
    this.ready;

    this.init();

}

// Functions
xMaps.prototype = {
    init:function(){
        var self = this;

        if(!this.mobileDraggable){
            if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
              this.draggable = false;
            }
        }

        this.setLocation(function(){
            google.maps.event.addDomListener(window,'load',self.setMap());
        });
    },

    ready:function(fn){
        this.ready = fn;
    },

    setLocation:function(fn){
        var self = this;

        // Geo Daten
        if(this.geolocation && navigator.geolocation){

            this.getLocationByGeolocation(function(pos){
                if(pos){
                    self.lat = self.location.lat();
                    self.lng = self.location.lng();
                }
                if(fn){fn();}
            });

        // Adresse
        }else if(this.address){

            this.getLocationByAdress(this.address,function(pos){
                self.location = pos;
                self.lat = self.location.lat();
                self.lng = self.location.lng();
                if(fn){fn();}
            });

        // Lat und Lng
        }else{
            this.getLocationByLatLng(this.lat,this.lng,function(pos){
                self.location = pos;
                self.lat = self.location.lat();
                self.lng = self.location.lng();
                if(fn){fn();}
            });
        }
    },

	// GPS ermitteln
    getLocationByGeolocation:function(fn){
        var self = this;
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
				if(position.coords.accuracy < 500){
					var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
					self.location = pos;
	                if(fn){fn(position);}
				}else{
					console.log("GPS zu ungenau!");
					self.getLocationByAdress(self.address,fn,false);
				}

            },function(){
                console.log("GPS in ihrem Browser nicht Aktiviert!");
                self.getLocationByAdress(self.address,fn,false);
            },{timeout:8000});
        }else{
			console.log("GPS in ihrem Browser nicht Aktiviert!");
            if(fn){fn(false);}
        }
    },

	// Location by Adress
    getLocationByAdress:function(address,fn,statusGPS){

        var self = this;
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode(
			{'address':address},
			function(results, status) {
	            if (status == google.maps.GeocoderStatus.OK) {
	                var pos = results[0].geometry.location;
	            }else{
	                var pos = new google.maps.LatLng(self.lat,self.lng);
	            }
				self.location = pos;

				if(statusGPS != null){
					if(fn){fn(statusGPS);}
				}else{
					if(fn){fn(pos);}
				}
	        }
		);
    },

	// Set Location by Lat / Lon
    getLocationByLatLng:function(lat,lng,fn){
        var self = this;
        var pos = new google.maps.LatLng(lat,lng);
		self.location = pos;
        if(fn){fn(pos);}
    },

	// Set Map
    setMap:function(){
		var self = this;

        this.mapOptions = {
       	    zoomControl:        this.zoomControl,
			panControl:         this.panControl,
			mapTypeControl:     this.mapTypeControl,
			streetViewControl:  this.streetView,
            draggable:          this.draggable,
			scrollwheel:        this.scrollWheel,
            zoom:               this.zoom,
            center:             this.location,
            mapTypeId:          eval("google.maps.MapTypeId."+self.mapType)
		};

        this.map = new google.maps.Map(this.obj,this.mapOptions);
        this.directionsDisplay.setMap(this.map);

        // Set Style
        this.setStyle();

        // Ready Function
        if(this.ready){
            this.ready();
        }

        // Set Center Markter
        this.setMarker({
            lat:                 this.lat,
    		lng:                 this.lng,
            top:                 this.top,
            left:                this.left,
            find:                false,
            address:             false,
            showMarker:          this.showMarker,
            markerIcon:          this.markerIcon,
            markerTitle:         this.markerTitle,
    		markerContent:       this.markerContent,
            markerOpen:          this.markerOpen,
            disableAutoPan:      false
        });
	},

	// Set Google Maps Style
    setStyle:function(){
        if(this.style){
            var self = this;
            this.styledMap = new google.maps.StyledMapType(eval(self.style),{name:"Styled Map"});
            this.map.mapTypes.set('map_style', self.styledMap);
            this.map.setMapTypeId('map_style');
        }
	},

	// Add Marker
    setMarker:function(options){
        this.markerArray.push(new xMapsMarker(this,options));
	},

    // Search closest Marker
    findClosestMarker:function(fn){
        function rad(x) {return x*Math.PI/180;}

        var self = this;
        var lat = this.location.lat();
        var lng = this.location.lng();
        var r = 6371; // radius of earth in km
        var distances = [];
        var closest = -1;
        for( i=0;i<this.markerArray.length; i++ ) {
            if(self.markerArray[i].find){
                var mlat = self.markerArray[i].location.lat();
                var mlng = self.markerArray[i].location.lng();
                var dLat  = rad(mlat - lat);
                var dLong = rad(mlng - lng);
                var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                var d = r * c;
                distances[i] = d;
                if ( closest == -1 || d < distances[closest] ) {
                    closest = i;
                }
            }
        }
        if(fn){fn(this.markerArray[closest]);}
    },

	// Draw a circle around the user position
    setGPSMarker:function(posUser) {
        var self = this;
		this.getLocationByGeolocation(function(pos){
			if(pos && pos.coords){
				self.accuracyCircle = new google.maps.Circle({
					center: self.location,
					radius: pos.coords.accuracy,
					map: self.map,
					fillColor: '#3498db',
					fillOpacity: 0.25,
					strokeColor: '#FFFFFF',
					strokeOpacity: 0.0
				});

				self.userCircle = new google.maps.Circle({
					center: self.location,
					radius: 3,
					map: self.map,
					fillColor: '#3498db',
					fillOpacity: 1.0,
					strokeColor: '#FFFFFF',
					strokeOpacity: 1.0,
					strokeWeight: 2
				});

				setInterval(function(){
					self.getLocationByGeolocation(function(pos){
						if(pos && pos.coords){
							self.accuracyCircle.setCenter(self.location);
							self.accuracyCircle.setRadius(pos.coords.accuracy);
							self.userCircle.setCenter(self.location);
						}
					});
				},3000);
			}
		});
    },

	// Search Route
    setRoute:function(directionsServiceOptions,directionsDisplayOptions,fn){
        var self = this;
        directionsServiceOptions.travelMode = google.maps.DirectionsTravelMode[directionsServiceOptions.travelMode];
        this.directionsService.route(directionsServiceOptions,function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {

                self.directionsDisplay.setOptions(directionsDisplayOptions);      // Hide Marker
                self.directionsDisplay.setDirections(result);
                if(fn){fn(result);}
            }
        });
    }
}


/* Marker */
var xMapsMarker = function(obj,options){

    this.options = $.extend({
        obj:obj,
        id:0,
        lat:0,
        lng: 0,
        top: 0,
        left:0,
        address:false,
        find:false,
        showMarker:true,
        markerOpen:false,
        markerIcon: "",
        markerTitle: false,
        markerContent: false,
        markerDiv:false,
        disableAutoPan:true
    }, options);

    // Options to Attributs
	for(var name in this.options){eval("this."+name+"=this.options."+name);}

    this.marker;
    this.location;

    this.init();
}

xMapsMarker.prototype = {

    init:function(){
        var self = this;
        this.setLocation(function(){
            if(self.showMarker || self.markerDiv){
                self.setMarker();
            }
        });
    },

    setLocation:function(fn){
        var self = this;
        // Adress
        if(this.address){
            this.obj.getLocationByAdress(this.address,function(pos){
                self.location = pos;
                if(fn){fn();}
            });
        // Lat und Lng
        }else if(this.lat && this.lng){
            this.obj.getLocationByLatLng(this.lat,this.lng,function(pos){
                self.location = pos;
                if(fn){fn();}
            });
        }
    },

    setMarker:function(){
        var self = this;

        this.infowindow = new google.maps.InfoWindow({
            content: "<h3>"+this.markerTitle+"</h3>"+this.markerContent,
            disableAutoPan: this.disableAutoPan
        });

        if(this.markerDiv){
            this.marker = new CustomMarker({
                position:this.location,
                map:this.obj.map,
                args:this.id,
                infowindow:this.infowindow
            });
        }else{
            this.marker = new google.maps.Marker({
                position: this.location,
                icon:this.markerIcon,
                map: this.obj.map
            });

            google.maps.event.addListener(this.marker,'click', function() {
                self.infowindow.open(self.obj.map,self.marker);
            });

            if(this.markerOpen){
                this.infowindow.open(this.obj.map,this.marker);
            }
        }
    }
}


/* Div Marker */

function CustomMarker(options) {
    this.options = $.extend({
        position:false,
        map:false,
        args:false,
        infowindow: false
    }, options);

    // Options to Attributs
	for(var name in options){eval("this."+name+"=options."+name);}

	this.setMap(this.map);
}

CustomMarker.prototype =  new google.maps.OverlayView();
CustomMarker.prototype.constructor=CustomMarker;
CustomMarker.prototype.draw = function() {

	var self = this;
	var div = this.div;

	if (!div) {

		div = this.div = document.createElement('div');
		div.className = 'marker';
		div.style.position = 'absolute';
		div.style.cursor = 'pointer';

		if (typeof(self.args.marker_id) !== 'undefined') {
			div.dataset.marker_id = self.args.marker_id;
		}

		google.maps.event.addDomListener(div, "click", function(event) {
			//Chlick Event
			self.infowindow.setPosition(self.position);
			self.infowindow.open(self.map);
			google.maps.event.trigger(self, "click");
		});

		var panes = this.getPanes();
		panes.overlayImage.appendChild(div);
	}

	var point = this.getProjection().fromLatLngToDivPixel(this.position);

	if (point) {
		div.style.left = (point.x) + 'px';
		div.style.top = (point.y) + 'px';
	}
};
CustomMarker.prototype.remove = function() {
	if (this.div) {
		this.div.parentNode.removeChild(this.div);
		this.div = null;
	}
};
CustomMarker.prototype.getPosition = function() {
	return this.location;
};
