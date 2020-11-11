const SHAKEUP_DATA_URL = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
const SHAKEUP_CHANGES = {
  no_changes: "No changes at this time. Check back in June 2021.",
  more_trips: "More trips",
  more_frequency: "Frequency increased",  
  segments_rerouted: "Segment(s) rerouted",
  start_or_end_changes: "Start or end point changes",
  late_night_changes: "Late night (owl) service changes",
  is_back: "Line is back in service",
  discontinued: "Line discontinued",
  remains_suspended: "Service remains suspended"
};

const PDF_SCHEDULES = "See updated ### schedule and route";
const TIPS = {
  transit_app: `Download the <a href="https://transitapp.com/download?utm_source=lametro-ca-website&utm_medium=referral&utm_campaign=partners">Transit App</a> on your smartphone to help plan your trips!`,
  tap: `Load fare at <a href="https://taptogo.net">taptogo.net</a> or download the <a href="#">TAP App</a>.`
};

$('.resultView').hide();
$('#getSchedule').hide();

function resetPage() {
  $('.queryView').each(function() {
    $(this).show();
  });

  $('#myBusLine').val('');

  $('.resultView').hide();
  $('#getSchedule').hide();

  $('#busLine').text('');
  $('#busChanges').text('');
  $('#busDetailsAlternatives').text('');
  $('#busWhy').text('');
  $('#busTips').text('');
  $('#busNoResults').text('');  
}

$('#searchAgainButton').click(function() {
  resetPage();
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
      data.gsx$lineisback.$t == "TRUE"){
    return true;
  }

  if (countDiscontinued && data.gsx$linediscontinued.$t == "TRUE") {
    return true;
  }

  return false;
}

function showHeading(data) {
  if (data != null)  {
    $('#busLine').html(`<h1>Bus Line ${data.gsx$linenumber.$t}</h1><h2>${data.gsx$linedescription.$t}</h2>`);
    return true;
  } else {
    $('#busNoResults').html("<h1>We couldn't find that line, please try again!</h1>");
    return false;
  }
}

function showChanges(data) {
  if (hasChanges(data, true)) { /* has changes - show "Key Change(s)" heading + list of changes*/
    $('#busChanges').append('<h3>Yes! Key change(s):</h3>');
    $('#busChanges').append('<div id="changeList"></div>')
    $('#changeList').append('<ul class="list-unstyled"></ul>');

    if (data.gsx$linediscontinued.$t == "TRUE") { /* Line discontinued */
      $('#changeList ul').append(`<li class="my-4">${SHAKEUP_CHANGES.discontinued}</li>`);
    } else {
      if (data.gsx$moretrips.$t == "TRUE") { /* More trips */
        $('#changeList ul').append(`<li class="my-4">${SHAKEUP_CHANGES.more_trips}</li>`);
      }

      if (data.gsx$morefrequency.$t == "TRUE") { /* More frequency */
        $('#changeList ul').append(`<li class="my-4">${SHAKEUP_CHANGES.more_frequency}</li>`);
      }

      if (data.gsx$segmentsrerouted.$t == "TRUE") { /* Segments rerouted */
        $('#changeList ul').append(`<li class="my-4">${SHAKEUP_CHANGES.segments_rerouted}</li>`);
      }

      if (data.gsx$startorendpointchanges.$t == "TRUE") { /* Start or End point changes */
        $('#changeList ul').append(`<li class="my-4">${SHAKEUP_CHANGES.start_or_end_changes}</li>`);
      }

      if (data.gsx$latenightservicechanges.$t == "TRUE") { /* Late night service changes */
        $('#changeList ul').append(`<li class="my-4">${SHAKEUP_CHANGES.late_night_changes}</li>`);
      }

      if (data.gsx$lineisback.$t == "TRUE") { /* Line is back */
        $('#changeList ul').append(`<li class="my-4">${SHAKEUP_CHANGES.is_back}</li>`);
      }
    }
    
  } else { /* no changes, show no heading + show no changes message */
    $('#busChanges').append('<div id="changeList"></div>')
    $('#changeList').append(SHAKEUP_CHANGES.no_changes);
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
    $('#getSchedule').text('New Schedule & Route').attr('href', data.gsx$scheduleurl.$t).show();
  } else {    /* if no changes, show "Current" schedule */
    $('#getSchedule').text('Current Schedule & Route').attr('href', data.gsx$scheduleurl.$t).show();
  }
}

function showTips(data) {
  /* Always show tips */
  $('#busTips').append(`<h3>Tips:</h3><ul><li>${TIPS.tap}</li><li>${TIPS.transit_app}</li></ul>`);
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
    if (showHeading(busData)) {
      /* A valid bus line was entered into the field */
      showChanges(busData);
      showDetailsAlternatives(busData);
      showWhy(busData);
      showSchedule(busData);
      showTips(busData);
    }
  }

  $('#myBusLine').blur();
  $('.queryView').hide();
  $('.resultView').show();

  return false;
});