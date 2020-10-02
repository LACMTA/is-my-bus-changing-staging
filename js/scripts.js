const data_url = "https://spreadsheets.google.com/feeds/list/15oORluAXFWZBD1thTLHIZADg2fBNhJ2LrcLCDXftcpM/od6/public/values?alt=json";

$.getJSON(data_url , function(data) {
  var entry = data.feed.entry;
  $(entry).each(function() {
    console.log(this.gsx$oldlinenumber.$t);
  });
});
