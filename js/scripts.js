const DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const NEXTGEN_CHANGES = {
  line_removed: "Line Removed",
  line_merged: "Line Merged",
  line_rerouted: "Line Re-routed",
  stops_changed: "Stops Changed",
  owl_discontinued: "Owl Discontinued"
};

let allBusChanges = {};

$.getJSON(DATA_URL, function (data) {
  allBusChanges = data.feed.entry;

  $(document).ready(function () {
    $(allBusChanges).each(function () {
      $('#busLines').append('<option>' + this.gsx$linenumber.$t + '</option>');
    });
  });
});

$('#myBusLine').change(function (e) {
  let myBusLine = $('#myBusLine').val();
  let myChanges = "";
  e.preventDefault();

  $(allBusChanges).each(function (index, element) {
    if (element.gsx$linenumber.$t == myBusLine) {
      myChanges = "<h2>Line " + myBusLine + " - " + element.gsx$linedescription.$t + "</h2>";

      if (element.gsx$linechanged.$t == 'no') {
        myChanges += "<h3>No changes to your line right now</h3>";
        myChanges += "<div>Sign up here if you'd like to be emailed about changes to your line </div>";
      } else {
        myChanges += "<h3>Changes affecting your line:</h3>";
        myChanges += "<div>" + getChanges(element) + "</div>"
        myChanges += "<a href=\"" + element.gsx$url.$t + "\">View the new timetable for details.</a>";
      }

      $('#busChanges').html(
        myChanges
      );

      $('#myBusLine').blur();
      return false;
    } else {
      myChanges = "<h2>We couldn't find that line, please try again!</h2>";
      $('#busChanges').html(
        myChanges
      );
    }
  });
  $('#myBusLine').blur();
  return false;
});

function getChanges(data) {
  let returnValues = "";


  if (data.gsx$lineremoved.$t == "yes") {
    returnValues += "<span>" + NEXTGEN_CHANGES.line_removed + "</span>";
  } else {
    if (data.gsx$linemerged.$t == "yes") {
      returnValues += "<span>" + NEXTGEN_CHANGES.line_merged + "</span>";
    }

    if (data.gsx$linechanged.$t == "yes") {
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