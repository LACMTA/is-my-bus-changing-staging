const SHAKEUP_DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const SHAKEUP_CHANGES = {
  no_changes: "Your bus line has no changes at this time. Please check back as we approach June 2021 for updates.",
  changes: "Your line has changes:",
  more_trips: "More Trips",
  more_frequency: "More Frequency",
  line_merged: "This Metro Rapid Line is merging with ",
  line_removed: "Line Removed",  
  line_rerouted: "Line Rerouted",
  stops_changed: "Stops Changed",
  owl_changed: "Owl Service Changed"
};

const TRANSIT_APP = "Download the <a href=\"#\">Transit App</a> on your smartphone to help plan your trips!";
const PDF_SCHEDULES = "See more details in the <a href=\"#\">schedule PDF</a>.";


let shakeupData = {};
let AJAX = [];

function getData(url) {
  return $.getJSON(url);
}

AJAX.push(getData(SHAKEUP_DATA_URL))

$.when.apply($, AJAX).done(function() {
  shakeupData = arguments[0].feed.entry;
  $.each(shakeupData, function () {
    $('#busLines').append('<option>' + this.gsx$linenumber.$t + '</option>');
  });
});

$('#myBusLine').change(function (e) {
  let myBusLine = $('#myBusLine').val();
  let myChanges = "";
  let busFound = null;
  e.preventDefault();

  $(shakeupData).each(function (index, element) {
    if (element.gsx$linenumber.$t == myBusLine) {
      busFound = element;
    }
  });
  
  if (busFound != null) {
    myChanges = "<h2>Line " + myBusLine + " - " + busFound.gsx$linedescription.$t + "</h2>";
    myChanges += "<li>" + TRANSIT_APP + "</li>";
    
    myChanges += "<div>" + getChanges(busFound) + "</div>"

    $('#busChanges').html(
      myChanges
    );
  } else {
    myChanges = "<h2>We couldn't find that line, please try again!</h2>";
    
    $('#busChanges').html(
      myChanges
    );
  }

  $('#myBusLine').blur();

  return false;
});

function getChanges(data) {
  let returnValues = "";

  if (data.gsx$shakeupinfo.$t == "no") {
    returnValues += "<li>" + SHAKEUP_CHANGES.no_changes + "</li>";
  } else {
    returnValues += "<li>" + PDF_SCHEDULES + "</li>";
    returnValues += "<li>" + SHAKEUP_CHANGES.changes + "</li>";

    if (data.gsx$lineremoved.$t == "yes") {
      returnValues += "<li>" + SHAKEUP_CHANGES.line_removed + "</li>";
    } else {
      if (data.gsx$moretrips.$t == "yes") {
        returnValues += "<li>" + SHAKEUP_CHANGES.more_trips + "</li>";
      }

      if (data.gsx$morefrequency.$t == "yes") {
        returnValues += "<li>" + SHAKEUP_CHANGES.more_frequency + "</li>";
      }

      if (data.gsx$linemerged.$t == "yes") {
        returnValues += "<li>" + SHAKEUP_CHANGES.line_merged + data.gsx$alternatives.$t + "</li>";
      }
  
      if (data.gsx$linererouted.$t == "yes") {
        returnValues += "<li>" + SHAKEUP_CHANGES.line_rerouted + "</li>";
      }
  
      if (data.gsx$stopschanged.$t == "yes") {
        returnValues += "<li>" + SHAKEUP_CHANGES.stops_changed + "</li>";
      }
  
      if (data.gsx$owlchanged.$t == "yes") {
        returnValues += "<li>" + SHAKEUP_CHANGES.owl_changed + "</li>";
      }
    }
  }
  return returnValues;
}