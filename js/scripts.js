const SHAKEUP_DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const SHAKEUP_CHANGES = {
  no_changes: "No changes at this time. Check back in June 2021 for service updates.",
  more_trips: "More trips",
  more_frequency: "Frequency increased",
  line_removed: "Line discontinued",
  segments_rerouted: "Segment(s) rerouted",
  start_or_end_changes: "Start or end point changes",
  late_night_changes: "Late night service changes",
  line_is_back: "Line is back"
};

const PDF_SCHEDULES = "See updated ### schedule and route";
const TIPS = {
  transit_app: "Download the <a href=\"#\">Transit App</a> on your smartphone to help plan your trips!",
  tap: "Load fare at <a href=\"https://taptogo.net\">taptogo.net</a> or download the <a href=\"#\">TAP App<\a>"
};

$('.resultView').hide();

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

$('#switchLanguage img').hover(function() {
  if (!$(this).hasClass('showLanguages')) {
    $(this).attr('src', 'img/language_icon_active.png');
  }
}, function() {
  if (!$(this).hasClass('showLanguages')) {
    $(this).attr('src', 'img/language_icon.png');
  }
});

$('#switchLanguage img').click(function() {
  $(this).toggleClass('showLanguages');

  if ($(this).hasClass('showLanguages')) {
    $(this).attr('src', 'img/language_icon_active.png');
  } else {
    $(this).attr('src', 'img/language_icon.png');
  }
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
let currentLines = [];

function getData(url) {
  return $.getJSON(url);
}

AJAX.push(getData(SHAKEUP_DATA_URL))

$(function() {
  $.when.apply($, AJAX).done(function() {
    shakeupData = arguments[0].feed.entry;

    $.each(shakeupData, function () {
      currentLines.push(this.gsx$linenumber.$t);
    });

    $('#myBusLine').autocomplete({
      source: currentLines,
      autoFocus: true,
      minLength: 0
    }).focus(function() {
      $('#myBusLine').autocomplete('search');
    });
  });
});


$('#myBusLine').on('autocompleteselect', function (e, ui) {
  let myBusLine = ui.item.value;
  let myChanges = "";
  let busFound = null;
  e.preventDefault();

  $(shakeupData).each(function (index, element) {
    if (element.gsx$linenumber.$t == myBusLine) {
      busFound = element;
    }
  });
  
  if (busFound != null) { /* Bus line exists in data */
    myChanges = `<h1>Bus Line ${myBusLine}</h1>`;
    myChanges += `<h2>${busFound.gsx$linedescription.$t}</h2>`;
    myChanges += getChanges(busFound);
  } else {
    if (myBusLine.trim() == "") { /* No bus line entered */
      myChanges = "";
    } else { /* Bus line doesn't exist in data*/
      myChanges = "<h1>We couldn't find that line, please try again!</h1>";
    }
  }

  $('#busChanges').html(
    myChanges
  );

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

  if (data.gsx$changes.$t == "FALSE") { /* No changes this shakeup */
    results += `<p>${SHAKEUP_CHANGES.no_changes}</p>`;
    results += `<p><a href="${data.gsx$scheduleurl.$t}">See current schedule and route.</a></p>`;

  } else { /* Yes changes this shakeup */
    changes += `<div id="keyChanges" class="mt-3"><h3>Key change(s):</h3><hr><ul>`;

    if (data.gsx$lineremoved.$t == "TRUE") { /* Line discontinued */
      changes += `<li>${SHAKEUP_CHANGES.line_removed}</li></ul></div>`;

    } else { /* Line still exists */
      
      if (data.gsx$moretrips.$t == "TRUE") { /* More trips */
        changes += `<li>${SHAKEUP_CHANGES.more_trips}</li>`;
      }

      if (data.gsx$morefrequency.$t == "TRUE") { /* More frequency */
        changes += `<li>${SHAKEUP_CHANGES.more_frequency}</li>`;
      }

      if (data.gsx$segmentsrerouted.$t == "TRUE") { /* Segments rerouted */
        changes += `<li>${SHAKEUP_CHANGES.segments_rerouted}</li>`;
      }
  
      if (data.gsx$startorendpointchanges.$t == "TRUE") { /* Start or End point changes */
        changes += `<li>${SHAKEUP_CHANGES.start_or_end_changes}</li>`;
      }
  
      if (data.gsx$latenightservicechanges.$t == "TRUE") { /* Late night service changes */
        changes += `<li>${SHAKEUP_CHANGES.late_night_changes}</li>`;
      }

      if (data.gsx$lineisback.$t == "TRUE") { /* Line is back */
        changes += `<li>${SHAKEUP_CHANGES.line_is_back}</li>`;
      }
  
      changes += `</ul><p>See <a href="${data.gsx$scheduleurl.$t}">updated ${data.gsx$linenumber.$t} schedule and route.</a></p></div>`;
    }

    if (data.gsx$details.$t != '') { /* Show details if they exist */
      details = `<div id="details" class="mt-3"><h3>Details:</h3>${data.gsx$details.$t}</div>`;
    }

    tips = `<div id="tips" class="mt-3"><h3>Tips:</h3><ul><li>${TIPS.tap}</li><li>${TIPS.transit_app}</li></ul>`; /* Show Tips */
  }

  results += changes + details + tips;

  return results;
}