xMaps
=====

Add:
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>

$(document).ready(function(){
  // Map Init
  var Map =  new xMaps({/*Options*/});
  
  Map.ready(function(){
    // route
    this.setRoute("Meggen Schweiz","Sursee Schweiz","DRIVING",[
    {
      location:"Sembach Schweiz",
      stopover:false
    },{
      location:"Emmen Schweiz",
      stopover:true
  }]);
  
});
