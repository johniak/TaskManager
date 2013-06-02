function ProjectsListView(projectsArray) {

    this.selectedId = 0;
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
            if ($.isNumeric(id)) {
                app.projectsListView.selectedId = id;
                $.mobile.loading('show');
                api.getTasks(app.projectsListView.projectsArray[id].id, function (tasks) {
                    console.log(tasks.length);
                    $.mobile.loading('hide');
                    app.tasksListView = new TasksListView(tasks);
                });
            }

            //console.log( projectsArray[id].name);
        });
        $('#project-listview').listview('refresh');
    };
    this.setTasks(projectsArray);
}

function TasksListView(tasksArray) {
    this.selectedId = 0;
    this.comparator= function( todo, todo2 ) {
        var date = tools.toDate(todo.deadline).getTime();
        var date2 = tools.toDate(todo2.deadline).getTime();
        if (date > date2) return -1; // before
        if (date < date2) return 1; // after
        if (date == date2) return (todo.priority>todo2.priority)
        return 1;
    };

    this.setTasks = function (tasksArrayL) {
        this.tasksArray = tasksArrayL;
        $('#tasks-listview').empty();
        this.tasksArray.sort(this.comparator);

        for (var i = 0; i < this.tasksArray.length; i++) {
            if (this.tasksArray[i].status != 1) {
                $('#tasks-listview').
                    prepend($('<li/>', "").append($("<a/>", {
                        "data-id": i
                    }).append(this.tasksArray[i].message)));
            }
        }

        $('#tasks-listview').on('taphold', app.onTapHold);
        $('#tasks-listview li a').click(function () {

            id = $(this).attr("data-id");
            if ($.isNumeric(id)) {

                app.tasksListView.selectedId = id;
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

    this.refresh = function (project) {

    }
    this.setTasks(tasksArray);
}


var tools = {};

tools.formatDate = function(date) {
    var MMDD = tools.toDate(date);

    var strDate = "";

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    var tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (today.getTime() == MMDD.getTime()) {
        strDate = "Today";
    } else if (yesterday.getTime() == MMDD.getTime()) {
        strDate = "Yesterday";
    } else if (tomorrow.getTime() == MMDD.getTime()) {
        strDate = "Tomorrow";
    } else {
        strDate = date;
    }

    return strDate;
}

tools.toDate = function(date) {
    var date_object = date.split("/");

    var MMDD = new Date()
    MMDD.setHours(0, 0, 0, 0);
    MMDD.setFullYear(date_object[2], date_object[1]-1, date_object[0]);
    return MMDD;
}

tools.alert = function(type, message) {
    $("#alert-area").append($("<div class='alert-message alert alert-" + type + " fade in' data-alert='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button> " + message + " </div>"));
    $(".alert-message").delay(2000).fadeOut("slow", function () { $(this).remove(); });
}

tools.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}