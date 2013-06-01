

function ProjectsListView(projectsArray) {

    this.selectedId=0;
    this.setTasks = function (projectsArrayL) {
        this.projectsArray = projectsArrayL;
        $('#project-listview').empty();
        for (var i = 0; i < projectsArrayL.length; i++) {
            $('#project-listview').
            append($('<li/>', "").append($("<a/>", {
                "data-id": i
            }).append(this.projectsArray[i].name)));
        }

        //app.projectsListView.selectedId=0;
        $('#project-listview li a').click(function () {

            id = $(this).attr("data-id");
            $("#nav-panel").panel("close");
            if ($.isNumeric(id)){
                app.projectsListView.selectedId=id;
                $.mobile.loading('show');
                api.getTasks(app.projectsListView.projectsArray[id].id, function(tasks) {
                             console.log(tasks.length);
                    $.mobile.loading('hide');
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
    this.selectedId=0;
    this.setTasks = function (tasksArrayL) {
        this.tasksArray = tasksArrayL;
        $('#tasks-listview').empty();
        for (var i = 0; i < this.tasksArray.length; i++) {
            $('#tasks-listview').
            append($('<li/>', "").append($("<a/>", {
                "data-id": i
            }).append(this.tasksArray[i].message)));
        }

        $('#tasks-listview').on( 'taphold', app.onTapHold );
        $('#tasks-listview li a').click(function () {

            id = $(this).attr("data-id");
            if ($.isNumeric(id)) {

                app.tasksListView.selectedId=id;
                console.log(tasksArray[id]);
                $("#edit-task-panel").panel("open");
                $("#message").val(tasksArray[id].message);
                $("#radio-choice-h-" + tasksArray[id].priority).attr("checked", "checked");
                $("#radio-choice-h-" + tasksArray[id].priority).next().click();
                $('#slider').val(tasksArray[id].status == 1 ? "on" : "off").slider("refresh");
                $("#date").val(tasksArray[id].deadline);
                console.log($("#radio-choice-h-" + tasksArray[id].priority));
            }

            //console.log( projectsArray[id].name);
        });
        $('#tasks-listview').listview('refresh');
    }

    this.refresh=function(project){

    }
    this.setTasks(tasksArray);
}