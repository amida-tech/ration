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
        $('#my_hours_table tr:last').after('<tr><td><select type="text" class="form-control">' + optionString + '</td><td><input type="text" class="form-control"></td></tr>');
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
        window.location = "/api/csv/1";
    });

    /**
     * Functions for Project List
     */

    //Add a line to the table.
    $("#add_project").click(function (e) {
        $('#projects_table tr:last').after('<tr><td><input type="text" class="form-control"></td></tr>');
    });

    // Submit the projects list
    $("#save_projects").click(function () {
        var url = window.location;
        var hostname = $('<a>').prop('href', url).prop('hostname');
        var projectData = [];

        $('#projects_table > tbody').find('tr').each(function (i, el) {
            var $tds = $(this).find('td');

            var project = $tds.eq(0).find('input').val();

            if (project) {
                projectData.push({
                    name: project
                });
            }
        });

        $.ajax({
            type: 'PUT',
            url: '/api/projects',
            data: {
                projects: projectData
            },

            success: function (data, status) {
                window.location.href = '/dashboard';
            }
        });

        event.preventDefault();
    });

});