/**
         * Handle language switching.
         */

        $('#switchLanguage img').hover(function () {
            if (!$(this).hasClass('showLanguages')) {
                $(this).attr('src', 'img/language_icon_active.png');
            }
        }, function () {
            if (!$(this).hasClass('showLanguages')) {
                $(this).attr('src', 'img/language_icon.png');
            }
        });

        $('#switchLanguage img').click(function () {
            $(this).toggleClass('showLanguages');

            if ($(this).hasClass('showLanguages')) {
                $(this).attr('src', 'img/language_icon_active.png');
            } else {
                $(this).attr('src', 'img/language_icon.png');
            }
        });

        /**
         * Manually define list of bus lines (needs to match the Google Sheet's first column)
         */

        const currentLines = ['2', '4', '10', '14/37', '16', '18', '20', '28', '30', '33', '35/38', '40', '45', '48', '51/52', '53', '55', '60', '62', '66', '68', '70', '71', '76', '78/79', '81', '83', '90/91', '92', '94', '96', '102', '105', '106', '108', '110', '111', '115', '117', '120', '125', '126', '127', '128', '130', '150/240', '152', '154', '155', '158', '161', '162/163', '164', '165', '166', '167', '169', '175', '176', '177', '180/181', '183', '200', '201', '202', '204', '205', '206', '207', '209', '210', '211/215', '212', '217', '218', '222', '224', '230', '232', '233', '234', '236', '237/656', '239', '242/243', '244/245', '246', '251', '252', '254', '256', '258', '260', '265', '266', '264/267', '268', '302', '312', '316', '330', '344', '351', '353', '355', '358', '364', '378', '442', '460', '487/489', '501', '534', '550', '577', '601', '602', '603', '605', '607', '611', '612', '625', '665', '685', '686/687', '704', '705', '710', '720', '728', '733', '734', '740', '744', '745', '750', '751', '754', '757', '760', '762', '770', '780', '794', '901 - G Line (Orange)', '910/950 - J Line (Silver)', '834 - L Line (Gold) Shuttle'];

        function isValidBusLine() {
            let inputEntry = $('#myBusLine').val();
            let index = currentLines.indexOf(inputEntry);
            if (index > 0) {
                return true;
            } else {
                return false;
            }
        }

        $('#myBusLine').autocomplete({
            source: currentLines,
            autoFocus: true,
            minLength: 0
        }).focus(function () {
            $('#myBusLine').autocomplete('search');
        });

        // Handle Enter key being pressed (even when no item in list is selected)
        $('#myBusLine').keydown(function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                if (isValidBusLine()) {
                    window.location = 'bus.html?line=' + $('#myBusLine').val();
                }
            }
        });

        // Attempt to handle iOS keyboard "Done" button
        $('#myBusLine').focusout(function(e) {
            if (isValidBusLine()) {
                window.location = 'bus.html?line=' + $('#myBusLine').val();
            }
        });

        // Handles selection from dropdown list
        $('#myBusLine').on('autocompleteselect', function (e, ui) {
            $('#myBusLine').val(ui.item.value);

            if (isValidBusLine()) {
                window.location = 'bus.html?line=' + ui.item.value;
            }
        });