const SHAKEUP_DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const MESSAGES = {
  yes_changes: "Key change(s):",
  no_changes: "No changes at this time. New bus update coming June 2021. Check back then.",
  line_not_found: "We couldn't find that line, please try again!",
  more_trips: "More trips",
  more_frequency: "Frequency increased",  
  segments_rerouted: "Segment(s) rerouted",
  start_or_end_changes: "Start or end point changes",
  late_night_changes: "Late night (owl) service changes",
  is_back: "Line is back in service",
  discontinued: "Line discontinued",
  remains_suspended: "Service remains suspended",
  line_number_changed: "Line number changed"
};
let shakeupData = {};
let AJAX = [];
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function getData(url) {
  return $.getJSON(url);
}

AJAX.push(getData(SHAKEUP_DATA_URL));

$(function() {
  $.when.apply($, AJAX).done(function() {
    shakeupData = arguments[0].feed.entry;

    $.each(shakeupData, function () {
      if (this.gsx$linenumber.$t == urlParams.get('line')) {
        if (showLine(this)) {
          showChanges(this);
          showDetailsAlternatives(this);
          showWhy(this);
          showSchedule(this);
        }

        return false;
      }
    });
  });


});

function showLine(data) {
  let lineNumber = data.gsx$linenumber.$t;
  let lineText = '';
  const regex = /^[0-9]/;

  if (data != null) {
    if (lineNumber[0].match(regex)) {
      lineText = "Bus Line " + lineNumber;
    } else {
      lineText = lineNumber;

    }
    $('title').text('Details for ' + lineText);
    $('#busLine h1').text(lineText);
    $('#busLine h2').text(data.gsx$linedescription.$t);

    return true;
  } else {
    $('title').text('Line Not Found');
    $('#busNoResults').html('<h1>' + MESSAGES.line_not_found + '</h1>');
    return false;
  }
}

function hasChanges(data, countDiscontinued) {
  if (data.gsx$moretrips.$t == "TRUE" ||
      data.gsx$morefrequency.$t == "TRUE" ||
      data.gsx$segmentsrerouted.$t == "TRUE" ||
      data.gsx$startorendpointchanges.$t == "TRUE" ||
      data.gsx$latenightservicechanges.$t == "TRUE" ||
      data.gsx$lineisback.$t == "TRUE" ||
      data.gsx$linenumberchanged.$t == "TRUE"){
    return true;
  }

  if (countDiscontinued && data.gsx$linediscontinued.$t == "TRUE") {
    return true;
  }

  return false;
}

function showChanges(data) {
  if (hasChanges(data, true)) { /* has changes - show "Key Change(s)" heading + list of changes*/
    $('#busChanges').append('<h3>' + MESSAGES.yes_changes + '</h3>');
    $('#busChanges').append('<div id="changeList" class="rounded"></div>')
    $('#changeList').append('<ul class="list-unstyled"></ul>');

    if (data.gsx$linediscontinued.$t == "TRUE") { /* Line discontinued */
      $('#changeList ul').append('<li class="my-4">' + MESSAGES.discontinued + '</li>');
    } else {
      if (data.gsx$moretrips.$t == "TRUE") { /* More trips */
        $('#changeList ul').append('<li class="my-4">' + MESSAGES.more_trips + '</li>');
      }

      if (data.gsx$morefrequency.$t == "TRUE") { /* More frequency */
        $('#changeList ul').append('<li class="my-4">' + MESSAGES.more_frequency + '</li>');
      }

      if (data.gsx$segmentsrerouted.$t == "TRUE") { /* Segments rerouted */
        $('#changeList ul').append('<li class="my-4">' + MESSAGES.segments_rerouted + '</li>');
      }

      if (data.gsx$startorendpointchanges.$t == "TRUE") { /* Start or End point changes */
        $('#changeList ul').append('<li class="my-4">' + MESSAGES.start_or_end_changes + '</li>');
      }

      if (data.gsx$latenightservicechanges.$t == "TRUE") { /* Late night service changes */
        $('#changeList ul').append('<li class="my-4">' + MESSAGES.late_night_changes + '</li>');
      }

      if (data.gsx$lineisback.$t == "TRUE") { /* Line is back */
        $('#changeList ul').append('<li class="my-4">' + MESSAGES.is_back + '</li>');
      }

      if (data.gsx$linenumberchanged.$t == "TRUE") { /* Line is back */
        $('#changeList ul').append('<li class="my-4">' + MESSAGES.line_number_changed + '</li>');
      }
    }
    
  } else { /* no changes, show no heading + show no changes message */
    $('#busChanges').append('<div id="changeList"></div>')
    $('#changeList').append('<ul class="list-unstyled"><li class="my-4">' + MESSAGES.no_changes + '</li></ul>');
  }
  return;
}

function showDetailsAlternatives(data) {
  if (data.gsx$details.$t != '') {
    /* if line discontinued, show "Alternatives" */
    if (data.gsx$linediscontinued.$t == "TRUE") {
      $('#busDetailsAlternatives').append("<h3>Alternatives:</h3>");
    } else { /* else show "Details" */
      $('#busDetailsAlternatives').append("<h3>Details:</h3>");
    }

    $('#busDetailsAlternatives').append(data.gsx$details.$t);
  }
}

function showWhy(data) {
  if (data.gsx$why.$t != '') {
    $('#busWhy').append("<h3>Why we're making this change:</h3>");
    $('#busWhy').append(data.gsx$why.$t);
  }
}

function showSchedule(data) {
  /* Line discontinued or remains suspended */
  if (data.gsx$linediscontinued.$t == "TRUE" || data.gsx$remainssuspended.$t == "TRUE") {
    return;
  } else if (hasChanges(data, false)) { /* if changes, show "New" schedule */
    if (data.gsx$scheduleurl.$t == '') {
      $('#getSchedule').text('Schedule Coming Soon').removeClass('btn-primary').addClass('btn-secondary').addClass('disabled').attr('aria-disabled', true).show();
    } else {
      $('#getSchedule').text('New Schedule & Route').attr({
        'href': data.gsx$scheduleurl.$t,
        'aria-disabled': false,
        'data-schedule-version': 'new'
      }).removeClass('disabled').removeClass('btn-secondary').addClass('btn-primary');
    }
  } else {    /* if no changes, show "Current" schedule */
    $('#getSchedule').text('Current Schedule & Route').attr({
      'href': data.gsx$scheduleurl.$t,
      'aria-disabled': false,
      'data-schedule-version': 'current'
    }).removeClass('disabled').removeClass('btn-secondary').addClass('btn-primary');
  }

}

