const SHAKEUP_DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const SHAKEUP_CHANGES = {
  no_changes: "No changes at this time. Check back in June 2021 for service updates.",
  changes: "Key change(s):",
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
const TAP = "Load fare at <a href=\"#\">taptogo.net</a> or download the <a href=\"#\">TAP App<\a>";

$('#searchAgain').click(function() {
  $('.queryRow').each(function() {
    $(this).show();
  });
  $('.resultRow').hide();
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
    myChanges = "<h1>Bus Line " + myBusLine + "</h1>";
    myChanges += "<p class=\"lineDescription\">" + busFound.gsx$linedescription.$t + "</p>";
    
    myChanges += "<div class=\"keyChanges\">" + getChanges(busFound) + "</div>"



    $('#busChanges').html(
      myChanges
    );
  } else {
    if (myBusLine.trim() == "") {
      myChanges = "";
    } else {
      myChanges = "<h1>We couldn't find that line, please try again!</h1>";
    }
    
    $('#busChanges').html(
      myChanges
    );
  }

  $('#myBusLine').blur();

  $('.queryRow').hide();
  $('.resultRow').show();

  return false;
});

function getChanges(data) {
  let returnValues = "";

  if (data.gsx$shakeupinfo.$t == "FALSE") {
    returnValues += "<p>" + SHAKEUP_CHANGES.no_changes + "</p>";
    returnValues += "<p>" + "<a href=\"" + data.gsx$scheduleurl.$t + "\">See current schedule and route.</a>" + "</p>";
  } else {
    returnValues += "<p>" + SHAKEUP_CHANGES.changes + "</p><hr>";

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

      returnValues += "<p>Details:</p>";
      returnValues += "<p>" + PDF_SCHEDULES + "</p>";

      let tips = document.createElement('div');
      tips.append()

      returnValues += "<p>Tips:</p>";
      returnValues += "<p>" + TAP + "</p>";
      returnValues += "<p>" + TRANSIT_APP + "</p>";
    }
  }
  return returnValues;
}