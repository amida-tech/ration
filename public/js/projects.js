$("tbody").sortable({
    items: "> tr",
    appendTo: "parent",
    helper: "clone"
}).disableSelection();

/**
 * Functions for Project List
 */

//Add a line to the table.
$("#add_project").click(function (e) {
    $('#projects_table tr:last').after('<tr><td><input type="text" class="form-control"></td></tr>');
});

// Submit the projects list
$("#save_projects").click(function () {
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
    console.log(projectData);
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

