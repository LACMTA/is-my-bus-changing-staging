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

$('#searchAgainButton').click(function() {
  $('.queryView').each(function() {
    $(this).show();
  });
  $('.resultView').hide();
  $('#busChanges').text('');
  $('#myBusLine').val('');
});

/**
 * Handle language switching.
 */

$('#switchLanguage').click(function() {
  $(this).toggleClass('blue');
  $(this).toggleClass('black');
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
    myChanges += "<p id=\"lineDescription\">" + busFound.gsx$linedescription.$t + "</p>";
    
    myChanges += getChanges(busFound);



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

  $('.queryView').hide();
  $('.resultView').show();

  return false;
});

function getChanges(data) {
  let results = ""
  let changes = "";
  let details = "";
  let tips = "";

  if (data.gsx$shakeupinfo.$t == "FALSE") {
    results += "<p>" + SHAKEUP_CHANGES.no_changes + "</p>";
    results += "<p>" + "<a href=\"" + data.gsx$scheduleurl.$t + "\">See current schedule and route.</a>" + "</p>";
  } else {
    changes += "<div id=\"keyChanges\">";
    changes += "<p>" + SHAKEUP_CHANGES.changes + "</p><hr>";
    changes += "<ul>";

    if (data.gsx$lineremoved.$t == "TRUE") {
      changes += "<li>" + SHAKEUP_CHANGES.line_removed + "</li></ul></div>";

      if (data.gsx$alternatives.$t != '') {
        details = "<div id=\"details\">" +
                  "<p>Details:</p>" +
                  data.gsx$alternatives.$t + 
                  "</div>";
        tips = "<div id=\"tips\">" +
                  "<p>Tips:</p><ul>" +
                  "<li>" + TAP + "</li>" +
                  "<li>" + TRANSIT_APP + "</li></ul>";
      }
    } else {
      
      if (data.gsx$moretrips.$t == "TRUE") {
        changes += "<li>" + SHAKEUP_CHANGES.more_trips + "</li>";
      }

      if (data.gsx$morefrequency.$t == "TRUE") {
        changes += "<li>" + SHAKEUP_CHANGES.more_frequency + "</li>";
      }

      if (data.gsx$linemerged.$t == "TRUE") {
        changes += "<li>" + SHAKEUP_CHANGES.line_merged + "</li>";
      }
  
      if (data.gsx$segmentsrerouted.$t == "TRUE") {
        changes += "<li>" + SHAKEUP_CHANGES.segments_rerouted + "</li>";
      }
  
      if (data.gsx$startorendpointchanges.$t == "TRUE") {
        changes += "<li>" + SHAKEUP_CHANGES.start_or_end_changes + "</li>";
      }
  
      if (data.gsx$latenightservicechanges.$t == "TRUE") {
        changes += "<li>" + SHAKEUP_CHANGES.late_night_changes + "</li>";
      }
      changes += "</ul></div>";

      if (data.gsx$alternatives.$t != '') {
        details = "<div id=\"details\">" +
                  "<p>Details:</p>" +
                  data.gsx$alternatives.$t + 
                  "</div>";
      }

      tips = "<div id=\"tips\">" +
              "<p>Tips:</p><ul>" +
              "<li>" + TAP + "</li>" +
              "<li>" + TRANSIT_APP + "</li></ul>";
    }
  }

  results += changes + details + tips;

  return results;
}