$('#transit-details, #transit-open').hide();

$('.busTips#transit').on('click', function () {
    $('#transit-open, #transit-closed').toggle();
    $('#transit-details').slideToggle(300);
});