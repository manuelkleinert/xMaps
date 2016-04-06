xMaps
=====

Add:

```html
  <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>
```

```javascript 
  $(document).ready(function(){
    // Map Init
    var Map =  new xMaps({/*Options*/});
    
    Map.ready(function(){
      
      // Add Route
      this.setRoute({origin:"Meggen Schweiz",destination:"Sursee Schweiz",travelMode:"DRIVING",waypoints:[
          {
            location:"Sembach Schweiz",
            stopover:false
          },{
            location:"Emmen Schweiz",
            stopover:true
          }
      ]})
      
      // Add Marker
      this.setMarker({
          address:'',
          lat:'',
          lng:'',
          markerIcon:'',
          showMarker:true,
          markerOpen:true,
          disableAutoPan:true,
          markerTitle: 'Titel',
          markerContent: 'Text'
      });
    
  });
```
