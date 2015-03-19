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
															  
© xPager - xMaps - Manuel Kleinert - www.xpager.ch - info(at)xpager.ch - v 1.1.6 - 19.03.2015
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
        address:false,          // Adress
		lat:0,                  // Latitude
		lng: 0,                 // Longitude
        top: 0,                 // Map move top
        left:0,                 // Map move left
		zoom: 10,               // Zoom 1-18
		zoomControl: true,      // Zoom Controller
		scrollWheel: true,      // Map Scroll (Zoom)
        draggable:true,         // Map Drag (Fade)
		panControl: true,       // Navigations Controller
		mapTypeControl: true,   // Controller for Style
        mapType:"ROADMAP",      // Style (HYBRID/ROADMAP/SATELLITE/TERRAIN)
		streetView: true,       // StreetView Controller
        showMarker:true,        // Show Marker
        markerIcon: false,      // Add other Icon
        markerTitle: false,     // Titel
		markerContent: false,   // Text
        markerOpen:false,       // Text open on start
		style: false,           // Map Style
        center:false,           // Center Top Left Addition [Top,left]
        routes:[]               // Route
	}, options);
	
    // Options to Attributs
	for(var name in this.options){eval("this."+name+"=this.options."+name);}
	
    // Attributs
	this.geocoder = new google.maps.Geocoder();
    this.directionsService = new google.maps.DirectionsService();
	this.location;
	this.styledMap;
	this.map;
	this.mapOptions;
	this.marker;
    this.colourArray = ['navy', 'red', 'grey', 'fuchsia', 'black', 'white', 'lime', 'maroon', 'purple', 'aqua', 'green', 'silver', 'olive', 'blue', 'yellow', 'teal'];
    
    this.init();
    
}

// Functions
xMaps.prototype = {
	init:function(fx){
		var self = this;
		this.setLocation(function(){
            self.setMap();
		    self.setStyle();
		    self.setMarker();
            self.centerMap();
            self.generateRequests();
        })
        
		if(fx){fx();}
	},

	
	setMap:function(){
		var self = this;
		// set map options
		this.mapOptions = {
			zoomControl: self.zoomControl,
			panControl: self.panControl,
			mapTypeControl: self.mapTypeControl,
			streetViewControl: self.streetView,
			//travelMode: google.maps.TravelMode.TRANSIT, Evt. Fix
            draggable:self.draggable,
			scrollwheel: self.scrollWheel,
			zoom: self.zoom,
			center: self.location,
			mapTypeId: eval("google.maps.MapTypeId."+self.mapType)
		};
        this.map = new google.maps.Map(this.obj,this.mapOptions);
	},
    
    setStyle:function(){
        if(this.style){
            var self = this;
            this.styledMap = new google.maps.StyledMapType(eval(self.style),{name:"Styled Map"});
            this.map.mapTypes.set('map_style', self.styledMap);
            this.map.setMapTypeId('map_style');
        }
	},
	
	setMarker:function(){
        if(this.showMarker){
            var self = this;
            var markerSetting = new Array();
            markerSetting['position'] = new google.maps.LatLng(this.lat,this.lng);
            markerSetting['map'] = this.map;
            if(this.markerIcon){markerSetting['icon']=this.markerIcon;}
            if(this.markerTitle){markerSetting['title']=this.markerTitle;}
            this.marker = new google.maps.Marker(markerSetting);
        }
        
        if(this.markerContent){
            var infowindow = new google.maps.InfoWindow();
            infowindow.setContent("<div class='infodiv'>"+ self.markerContent+"</div>");
            if(this.markerOpen){infowindow.open(self.map,this.marker);}
            google.maps.event.addListener(this.marker, 'click', function() {
                infowindow.open(self.map,this);
            });
        }
	},
    
    removeMarker:function(){
       this.marker.setMap(null);
    },
    
    setLocation:function(fx) {
        var self = this;
        if(this.address){
            this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode({'address': self.address}
            , function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    self.location = results[0].geometry.location;
                }else{
                    self.location = new google.maps.LatLng(self.lat,self.lng);
                }
                self.lat = self.location.lat()
                self.lng = self.location.lng()
                
                if(fx){fx();}
            });
        }else{
            this.location = new google.maps.LatLng(this.lat,this.long);
            if(fx){fx();}
        }
    },
	
	centerMap:function(){
        if(this.center){
            var self = this;
            var center = this.location;
            this.map.setCenter(new google.maps.LatLng(self.lat+(self.top/1000), self.lng-(self.left/1000)));
        }
	},
    
    setRoute:function(route){
        this.routes.push(route);
    },
    
    generateRequests:function(){
        var self = this;
        var i = 0;

        var checkRoute = function(route,statusIndex,start,end,waypts){
            
            if(route.length == statusIndex){
                var request = {
                    origin: start,
                    destination: end,
                    waypoints: waypts,
                    optimizeWaypoints: true,
                    travelMode: google.maps.TravelMode.DRIVING
                };
        
                self.directionsService.route(request, function(result, status){
                    
                    var directionsRenderer = new google.maps.DirectionsRenderer();
                    directionsRenderer.setMap(self.map);
            
                   /*directionsRenderer.setOptions({
                        suppressInfoWindows: true,
                        polylineOptions: {
                            strokeWeight: 4,
                            strokeOpacity: 0.8,
                            strokeColor: self.colourArray[i]
                        },
                        markerOptions:{
                            icon:{
                                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                                scale: 3,
                                strokeColor: self.colourArray[i]
                            }
                        }
                    });*/
                    
                    directionsRenderer.setDirections(result);
 
                    i++;
                });
            }
        }
        
    
        $.each(this.routes,function(routeIndex,route){
            
            var waypts = [];
            var start = false;
            var end = false;
            var statusIndex = 0;
            
            $.each(route,function(index,ort){
                
                if(ort["name"]){
                    
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'address':ort["name"]}, function(results, status) {
                        // Start
                        if(index == 0){
                            if (status == google.maps.GeocoderStatus.OK) {
                                start = results[0].geometry.location;
                                statusIndex++;
                                checkRoute(route,statusIndex,start,end,waypts);
                            }
                        }
                            
                        // Waypoints
                        if(index != 0 && index != route.length-1){
                            if (status == google.maps.GeocoderStatus.OK) {
                                waypts.push({
                                    location:results[0].geometry.location,
                                stopover:true});
                                statusIndex++;
                                checkRoute(route,statusIndex,start,end,waypts);
                            }
                        }
                            
                        // Ende
                        if(index == route.length-1){
                            if (status == google.maps.GeocoderStatus.OK) {
                                end = results[0].geometry.location;
                                statusIndex++;
                                checkRoute(route,statusIndex,start,end,waypts);

                                /*var pos = new google.maps.LatLng(end.k,end.D);
                                
                                 var marker = new google.maps.Marker({
                                      position: pos,
                                      map: self.map
                                 });    
        
                                var infowindow = new google.maps.InfoWindow();
                                infowindow.setContent("<div class='infodiv'>Test</div>");
                                infowindow.open(self.map,marker);
                                google.maps.event.addListener(marker,'click', function() {
                                    infowindow.open(self.map,this);
                                });*/
                                
                            }
                        }
                    
                        
                    });
                }
            });
        });
        
    }

}