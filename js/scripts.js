const SHAKEUP_DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const MESSAGES = {
  yes_changes: "Key change(s):",
  no_changes: "No changes at this time. Check back in June 2021.",
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

$('.resultView').hide();
$('#getSchedule').hide();

function resetPage() {
  $('.queryView').each(function() {
    $(this).show();
  });

  $('title').text('Is my bus line changing?');
  $('#myBusLine').val('');

  $('.resultView').hide();
  $('#getSchedule').hide();

  $('#busLine h1').text('');
  $('#busLine h2').text('');
  $('#busChanges').text('');
  $('#busDetailsAlternatives').text('');
  $('#busWhy').text('');
  $('#busNoResults').text('');  
}

$('#searchAgainButton').click(function(e) {
  e.preventDefault();
  window.history.pushState({}, '', './');
  resetPage();
  gtag('config', 'UA-10002990-14', {
    'page_title': 'Is my bus line changing?',
    'page_path': ''
  });
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

let shakeupData = {};
let AJAX = [];
let currentLines = [];

function getData(url) {
  return $.getJSON(url);
}

AJAX.push(getData(SHAKEUP_DATA_URL))

$(function() {
  resetPage();

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

    $('html').removeClass('js');
  });
});

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
    $('title').text(`Details for ${lineText}`);
    $('#busLine h1').text(lineText);
    $('#busLine h2').text(data.gsx$linedescription.$t);

    return true;
  } else {
    $('title').text(`Line Not Found`);
    $('#busNoResults').html(`<h1>${MESSAGES.line_not_found}</h1>`);
    return false;
  }
}

function showChanges(data) {
  if (hasChanges(data, true)) { /* has changes - show "Key Change(s)" heading + list of changes*/
    $('#busChanges').append(`<h3>${MESSAGES.yes_changes}</h3>`);
    $('#busChanges').append('<div id="changeList" class="rounded"></div>')
    $('#changeList').append('<ul class="list-unstyled"></ul>');

    if (data.gsx$linediscontinued.$t == "TRUE") { /* Line discontinued */
      $('#changeList ul').append(`<li class="my-4">${MESSAGES.discontinued}</li>`);
    } else {
      if (data.gsx$moretrips.$t == "TRUE") { /* More trips */
        $('#changeList ul').append(`<li class="my-4">${MESSAGES.more_trips}</li>`);
      }

      if (data.gsx$morefrequency.$t == "TRUE") { /* More frequency */
        $('#changeList ul').append(`<li class="my-4">${MESSAGES.more_frequency}</li>`);
      }

      if (data.gsx$segmentsrerouted.$t == "TRUE") { /* Segments rerouted */
        $('#changeList ul').append(`<li class="my-4">${MESSAGES.segments_rerouted}</li>`);
      }

      if (data.gsx$startorendpointchanges.$t == "TRUE") { /* Start or End point changes */
        $('#changeList ul').append(`<li class="my-4">${MESSAGES.start_or_end_changes}</li>`);
      }

      if (data.gsx$latenightservicechanges.$t == "TRUE") { /* Late night service changes */
        $('#changeList ul').append(`<li class="my-4">${MESSAGES.late_night_changes}</li>`);
      }

      if (data.gsx$lineisback.$t == "TRUE") { /* Line is back */
        $('#changeList ul').append(`<li class="my-4">${MESSAGES.is_back}</li>`);
      }

      if (data.gsx$linenumberchanged.$t == "TRUE") { /* Line is back */
        $('#changeList ul').append(`<li class="my-4">${MESSAGES.line_number_changed}</li>`);
      }
    }
    
  } else { /* no changes, show no heading + show no changes message */
    $('#busChanges').append('<div id="changeList"></div>')
    $('#changeList').append(`<ul class="list-unstyled"><li class="my-4">${MESSAGES.no_changes}</li></ul>`);
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
    $('#getSchedule').text('New Schedule & Route').attr({
      'href': data.gsx$scheduleurl.$t,
      'data-schedule-version': 'new'
    }).show();
  } else {    /* if no changes, show "Current" schedule */
    $('#getSchedule').text('Current Schedule & Route').attr({
      'href': data.gsx$scheduleurl.$t,
      'data-schedule-version': 'current'
    }).show();
  }
}

$('#myBusLine').on('autocompleteselect', function (e, ui) {
  let myBusLine = ui.item.value;
  let busData = null;
  e.preventDefault();

  /* Hide language selector if a bus line is chosen */
  if ($('#switchLanguage img').hasClass('showLanguages')) {
    $('#switchLanguage img').click();
  }

  /* Check if something was entered */
  if (myBusLine.trim() != "") { 

    /* Try to find the bus line from the data */
    $(shakeupData).each(function (index, element) { 
      if (element.gsx$linenumber.$t == myBusLine) {
        busData = element;
      }
    });

    /* Something was entered into the field */
    if (showLine(busData)) {
      /* A valid bus line was entered into the field */
      const regex1 = /(\/|\(|\)|\s)/g;
      const regex2 = /--/g;
      const regex3 = /-$/;

      busLinePath = busData.gsx$linenumber.$t.replace(regex1, '-').replace(regex2, '-').replace(regex3, '');
      window.history.pushState({}, '',  `${window.location}?line=${busLinePath}`);
      
      gtag('config', 'UA-10002990-14', {
        'page_title': busData.gsx$linenumber.$t,
        'page_path': `?line=${busLinePath}`
      });

      showChanges(busData);
      showDetailsAlternatives(busData);
      showWhy(busData);
      showSchedule(busData);
    }
  }

  $('#myBusLine').blur();
  $('.queryView').hide();
  $('.resultView').show();

  return false;
});