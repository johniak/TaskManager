

function ProjectsListView(projectsArray) {


    this.setTasks = function (projectsArrayL) {
        this.projectsArray = projectsArrayL;
        $('#project-listview').empty();
        for (var i = 0; i < projectsArrayL.length; i++) {
            $('#project-listview').
            append($('<li/>', "").append($("<a/>", {
                "data-id": this.projectsArray[i].id
            }).append(this.projectsArray[i].name)));
        }
        $('#project-listview li a').click(function () {

            id = $(this).attr("data-id");
            if ($.isNumeric(id)){
                api.getTasks(app.projectsListView.projectsArray[0].id, function(tasks) {
                   app.tasksListView= new TasksListView(tasks);
                });
            }

            //console.log( projectsArray[id].name);
        });
        $('#project-listview').listview('refresh');
    };

    this.setTasks(projectsArray);
}

function TasksListView(tasksArray) {
    this.setTasks = function (tasksArrayL) {
        this.tasksArray = tasksArrayL;
        $('#tasks-listview').empty();
        for (var i = 0; i < this.tasksArray.length; i++) {
            $('#tasks-listview').
            append($('<li/>', "").append($("<a/>", {
                "data-id": this.tasksArray[i].id
            }).append(this.tasksArray[i].message)));
        }
        $('#tasks-listview li a').click(function () {

            id = $(this).attr("data-id");
            if ($.isNumeric(id)) {
                console.log(tasksArray[id]);
                $("#edit-task-panel").panel("open");
                $("#message").val(tasksArray[id].message);
                $("#radio-choice-h-" + tasksArray[id].priority).attr("checked", "checked");
                $("#radio-choice-h-" + tasksArray[id].priority).next().click();
                $('#slider').val(tasksArray[id].status == 1 ? "on" : "off").slider("refresh");
                console.log($("#radio-choice-h-" + tasksArray[id].priority));
            }

            //console.log( projectsArray[id].name);
        });
        $('#tasks-listview').listview('refresh');
    }
    this.setTasks(tasksArray);
}