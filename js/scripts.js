const data_url = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";
let allBusChanges = {};

$.getJSON(data_url , function(data) {
  allBusChanges = data.feed.entry;

  $(document).ready(function() {
    $(allBusChanges).each(function() {
      $('#oldBusLines').append('<option>' + this.gsx$oldlinenumber.$t + '</option>');
    });
  });
});

$('#submitBusQuery').click(function() {
  let myBusLine = $('#myBusLine').val();
  $(allBusChanges).each(function(index, element) {
    if (element.gsx$oldlinenumber.$t == myBusLine) {
      $('#busChanges').html(
        '<span>Line Changes: ' + element.gsx$linenumberchange.$t + '</span><br>' + 
        '<span>Route Changes: ' + element.gsx$routechanges.$t + '</span><br>' + 
        '<span>Stop Changes: ' + element.gsx$stopchanges.$t + '</span><br>' + 
        '<span>Frequency Changes: ' + element.gsx$frequencychanges.$t + '</span>'
      );
      return false;
    }
  });
});