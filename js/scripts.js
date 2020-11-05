const SHAKEUP_DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const SHAKEUP_CHANGES = {
  no_changes: "No changes at this time. Check back in June 2021 for service updates.",
  changes: "Key changes:",
  more_trips: "More trips",
  more_frequency: "Frequency increased",
  line_merged: "Line merged",
  line_removed: "Line removed",
  segments_rerouted: "Segment(s) rerouted",
  start_or_end_changes: "Start or end point changes",
  late_night_changes: "Late night service changes",
  line_is_back: "Line is back"
};

const TRANSIT_APP = "Download the <a href=\"#\">Transit App</a> on your smartphone to help plan your trips!";
const PDF_SCHEDULES = "See more details in the <a href=\"#\">schedule PDF</a>.";

$('#searchAgain').hide();
$('.bi-caret-up-fill').hide();

$('#searchAgain').click(function() {
  $('#busQuery').show();
  $('#searchAgain').hide();
  $('#busChanges').text('');
  $('#myBusLine').val('');
});

/**
 * Handle language switching.
 */

$('#switchLanguage').click(function() {
  $(this).toggleClass('blue');
  $('.bi-caret-down-fill').toggle();
  $('.bi-caret-up-fill').toggle();
});


/*
$('[lang="es"]').hide();

$('#switchLanguage').click(function() {
  if ($('#currentLanguage').val() == 'en') {
    $('#currentLanguage').val('es');
    $('#myBusLine').attr('placeholder', 'selecciona su autobús');
    $('#switchLanguage').text('english');
  } else {
    $('#currentLanguage').val('en');
    $('#myBusLine').attr('placeholder', 'select your line');
    $('#switchLanguage').text('español');
  }
  
  $('[lang="es"]').toggle();
  $('[lang="en"]').toggle();
});
*/

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
    myChanges = "<h2>Bus Line " + myBusLine + "<br>" + busFound.gsx$linedescription.$t + "</h2>";
    
    myChanges += "<div>" + getChanges(busFound) + "</div>"

    $('#busQuery').hide();
    $('#searchAgain').show();

    $('#busChanges').html(
      myChanges
    );
  } else {
    if (myBusLine.trim() == "") {
      myChanges = "";
    } else {
      myChanges = "<h2>We couldn't find that line, please try again!</h2>";
    }
    
    $('#busChanges').html(
      myChanges
    );
  }

  $('#myBusLine').blur();

  return false;
});

function getChanges(data) {
  let returnValues = "";

  if (data.gsx$shakeupinfo.$t == "FALSE") {
    returnValues += "<p>" + SHAKEUP_CHANGES.no_changes + "</p>";
    returnValues += "<p>" + "<a href=\"" + data.gsx$scheduleurl.$t + "\">See current schedule and route.</a>" + "</p>";
  } else {
    returnValues += "<p>" + PDF_SCHEDULES + "</p>";
    returnValues += "<p>" + TRANSIT_APP + "</p>";
    returnValues += "<p>" + SHAKEUP_CHANGES.changes + "</p>";

    if (data.gsx$lineremoved.$t == "TRUE") {
      returnValues += "<p>" + SHAKEUP_CHANGES.line_removed + "</p>";
    } else {
      if (data.gsx$moretrips.$t == "TRUE") {
        returnValues += "<p>" + SHAKEUP_CHANGES.more_trips + "</p>";
      }

      if (data.gsx$morefrequency.$t == "TRUE") {
        returnValues += "<p>" + SHAKEUP_CHANGES.more_frequency + "</p>";
      }

      if (data.gsx$linemerged.$t == "TRUE") {
        returnValues += "<p>" + SHAKEUP_CHANGES.line_merged + data.gsx$alternatives.$t + "</p>";
      }
  
      if (data.gsx$segmentsrerouted.$t == "TRUE") {
        returnValues += "<p>" + SHAKEUP_CHANGES.segments_rerouted + "</p>";
      }
  
      if (data.gsx$startorendpointchanges.$t == "TRUE") {
        returnValues += "<p>" + SHAKEUP_CHANGES.start_or_end_changes + "</p>";
      }
  
      if (data.gsx$latenightservicechanges.$t == "TRUE") {
        returnValues += "<p>" + SHAKEUP_CHANGES.late_night_changes + "</p>";
      }
    }
  }
  return returnValues;
}