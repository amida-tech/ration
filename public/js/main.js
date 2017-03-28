$(document).ready(function () {

    /**
     * Functions for My Hours
     */

    // Add a row to the projects list
    $("#add_row").click(function () {
        var optionString = "";
        $('#project_select').find('option').text(function (i, el) {
            optionString = optionString + "<option>" + el + "</option>";
        })
        $('#my_hours_table tbody:first').append('<tr><td><select type="text" class="form-control">' + optionString + '</td><td><input type="text" class="form-control"></td></tr>');
    });

    // Keep myhours total updates
    $('#my_hours_table').on('change', 'input', function(){
        var sum = 0;
        // iterate through each td based on class and add the values
        $('td input').each(function() {
            var value = $(this).val();
            // add only if the value is number
            if(!isNaN(value) && value.length != 0) {
                sum += parseFloat(value);
            }
        });
        $('#total_hours').html(sum);
    });

    // Submit the projects list
    $("#post_hours").click(function () {
        var url = window.location;
        var hostname = $('<a>').prop('href', url).prop('hostname');
        var hoursData = [];

        $('#my_hours_table > tbody').find('tr').each(function (i, el) {
            var $tds = $(this).find('td');

            var project = $tds.eq(0).find('select').find('option:selected').text();
            var hours = $tds.eq(1).find('input').val();

            if (project && hours) {
                // check if a project name already exists
                // in the case of a duplicate project name we only take the first
                var result = [];

                if (hoursData.length > 0) {
                    result = hoursData.filter(function (data) {
                        return data.name === project;
                    });
                }

                if (result.length === 0) {
                    hoursData.push({
                        name: project,
                        hours: hours
                    });
                }
            }
        });

        $.ajax({
            type: 'PUT',
            url: '/api/hours/me',
            data: {
                hours: hoursData
            },

            success: function (data, status) {
                window.location.href = '/dashboard';
            }
        });

        event.preventDefault();
    });

    /**
     * Functions for Dashboard
     */
    $("#download_hours").click(function (e) {
        e.preventDefault();
        window.location = "/api/csv/report";
    });

});