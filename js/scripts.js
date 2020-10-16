const DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const NEXTGEN_CHANGES = {
  line_removed: "Line Removed",
  line_merged: "Line Merged",
  line_rerouted: "Line Re-routed",
  stops_changed: "Stops Changed",
  owl_discontinued: "Owl Discontinued"
};

let allBusChanges = {};

$.getJSON(DATA_URL , function(data) {
  allBusChanges = data.feed.entry;

  $(document).ready(function() {
    $(allBusChanges).each(function() {
      $('#myBusLine').append('<option>' + this.gsx$linenumber.$t + '</option>');
    });
  });
});

$('#myBusLine').change(function() {
  let myBusLine = $('#myBusLine').val();
  let myChanges = "";

  $(allBusChanges).each(function(index, element) {
    if (element.gsx$linenumber.$t == myBusLine) {
      myChanges = "<h2>Changes affecting your line:</h2>";
      myChanges += "<div>" + getChanges(element) + "</div>"
      myChanges += "<a href=\"" + element.gsx$url.$t + "\">View the new timetable for details.</a>";

      $('#busChanges').html(
        myChanges 
      );
      return false;
    }
  });
});

function getChanges(data) {
  let returnValues = "";


  if (data.gsx$lineremoved.$t == "yes") {
    returnValues += "<span>" + NEXTGEN_CHANGES.line_removed + "</span>";
  } else {
    if (data.gsx$linemerged.$t == "yes") {
      returnValues += "<span>" + NEXTGEN_CHANGES.line_merged + "</span>";
    }

    if (data.gsx$linererouted.$t == "yes") {
      returnValues += "<span>" + NEXTGEN_CHANGES.line_rerouted + "</span>";      
    }

    if (data.gsx$stopschanged.$t == "yes") {
      returnValues += "<span>" + NEXTGEN_CHANGES.stops_changed + "</span>";      
    }

    if (data.gsx$owldiscontinued.$t == "yes") {
      returnValues += "<span>" + NEXTGEN_CHANGES.owl_discontinued + "</span>";      
    }
  }

  return returnValues;
}