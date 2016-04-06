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

© xPager - xMaps - Manuel Kleinert - www.xpager.ch - info(at)xpager.ch - v 2.2.1 - 06.04.2016
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
                self.location = pos;
                self.lat = self.location.lat();
                self.lng = self.location.lng();
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

    getLocationByGeolocation:function(fn){
        navigator.geolocation.getCurrentPosition(function(position){
            var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            if(fn){fn(pos);}
        });
    },

    getLocationByAdress:function(address,fn){
        var self = this;
        this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode({'address':address}
            , function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var pos = results[0].geometry.location;
                }else{
                    var pos = new google.maps.LatLng(self.lat,self.lng);
                }
                if(fn){fn(pos);}
            });
    },

    getLocationByLatLng:function(lat,lng,fn){
        var self = this;
        var pos = new google.maps.LatLng(lat,lng);
        if(fn){fn(pos);}
    },

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

        // ready

        if(this.ready){
            this.ready();
        }

        // Set Center Markter
        this.setMarker({
            lat:                 this.lat,
    		lng:                 this.lng,
            top:                 this.top,
            left:                this.left,
            address:             false,
            showMarker:          this.showMarker,
            markerIcon:          this.markerIcon,
            markerTitle:         this.markerTitle,
    		markerContent:       this.markerContent,
            markerOpen:          this.markerOpen,
            disableAutoPan:      false
        });
	},

    setStyle:function(){
        if(this.style){
            var self = this;
            this.styledMap = new google.maps.StyledMapType(eval(self.style),{name:"Styled Map"});
            this.map.mapTypes.set('map_style', self.styledMap);
            this.map.setMapTypeId('map_style');
        }
	},

    setMarker:function(options){
        this.markerArray.push(new xMapsMarker(this,options));
	},

    setRoute(options,fn){
        var self = this;
        options.travelMode = google.maps.DirectionsTravelMode[options.travelMode];
        this.directionsService.route(options, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                self.directionsDisplay.setDirections(result);
                if(fn){fn();}
            }
        });
    }
}

var xMapsMarker = function(obj,options){

    this.options = $.extend({
        obj:obj,
        lat:0,
        lng: 0,
        top: 0,
        left:0,
        address:false,
        showMarker:true,
        markerOpen:false,
        markerIcon: "",
        markerTitle: false,
        markerContent: false,
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
            if(self.showMarker){
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
