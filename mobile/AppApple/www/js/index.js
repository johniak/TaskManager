/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    initialize: function () {
        this.bindEvents();
        api.initialize();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    createTask: function (t) {
        api.postTask(t, function (synced_with_server, object) {
            console.log("synced_with_server=" + synced_with_server);
            console.log("t.id=" + object.id);
            console.log("t._id=" + object._id);
        });
    },

    deleteTask: function (task) {
        api.deleteTask(task, function (synced_with_server) {
            console.log("synced_with_server=" + synced_with_server);
        });
    },

    readyToGo: function () {
        console.log("Ready to go");
        api.getProjects(function (projects) {
            app.projectsListView = new ProjectsListView(projects);
            api.getTasks(app.projectsListView.projectsArray[0].id, function (tasks) {
                app.tasksListView = new TasksListView(tasks);
            });
        });
    },

    login: function (status) {
        $.mobile.loading('hide');
        if (status == bridge.ERROR) return;

        $('#popupLogin').popup("close");

        api.syncTasks(function (list, sync, abandon) {
            $('#popupSync').popup("open");
            $('#popupSync a').live('click', function (e) {
                $('#popupSync').popup("close");
                var answer = $(this).attr('data-button-id');
                if (answer == "sync") {
                    sync(list, app.readyToGo);
                } else {
                    abandon(list, app.readyToGo);
                }
            });
        }, app.readyToGo);
    },

    onDeviceReady: function () {
        console.log("nice READY!");
        if (api.isAuthenticated()) {
            // just login
            api.login(app.login);
        } else {
            $('#popupLogin').popup("open");
            $('#popupLogin button').live('click', function (e) {
                $.mobile.loading('show');
                api.login(app.login, $('#popupLogin #username').val(), $('#popupLogin #password').val());
            });
        }
        $("#update-button").click(app.onUpdateButtonClicked);
        $("#add-task-button").click(app.onAddTaskButton);
        $("#logout-button").click(app.onLogOut);
        $("#confirm-delete-button").click(app.onDeleteTask);

        $("#delete-button").click(app.showDeletePupup);

    },

    onTapHold: function (event) {
        var id = $(event.target).attr("data-id");
        $("#popupMore p").text(app.tasksListView.tasksArray[id].message);
        $("#popupMore").popup("open");

        var object = $(event.target).parent().parent().parent();
        object.removeClass("ui-btn-down-c");
        if (!object.hasClass("ui-btn-up-c"))
            object.addClass("ui-btn-up-c");
    },

    onUpdateButtonClicked: function () {
        var id = app.tasksListView.selectedId;
        app.tasksListView.tasksArray[id].message = $("#message").val();
        app.tasksListView.tasksArray[id].deadline = $("#date").val();
        app.tasksListView.tasksArray[id].priority = $("#priority-selector label[data-icon=radio-on]").attr("data-id");
        app.tasksListView.tasksArray[id].status = $('#slider').val() == "on" ? 1 : 0;
        api.putTask(app.tasksListView.tasksArray[app.tasksListView.selectedId], function (synced_with_server, object) {
            api.getTasks(app.tasksListView.tasksArray[app.tasksListView.selectedId].project, function (tasks) {
                app.tasksListView = new TasksListView(tasks);
            });
        });
    },
    onAddTaskButton: function () {
        var date = new Date();
        var data = new Task(null, $("#add-task-input").val(),
            app.projectsListView.projectsArray[app.projectsListView.selectedId].id,
            1, date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear(), 0);
        $.mobile.loading('show');
        api.postTask(data, function (synced_with_server, object) {
            $("#add-task-input").val("");
            api.getTasks(data.project, function (tasks) {
                app.tasksListView = new TasksListView(tasks);
                $.mobile.loading('hide');
            });
        });
    },

    onLogOut: function () {
        api.logout();
        location.reload();
    },

    onDeleteTask: function () {
        var task = app.tasksListView.tasksArray[app.tasksListView.selectedId];
        $.mobile.loading('show');
        api.deleteTask(task, function (synced_with_server, object) {
            $("#popupdel").popup("close");
            $("#edit-task-panel").panel("close");

            api.getTasks(app.tasksListView.tasksArray[app.tasksListView.selectedId].project, function (tasks) {
                app.tasksListView = new TasksListView(tasks);
                $.mobile.loading('hide');
            });
        });
    },
    showDeletePupup: function () {
        $("#popupdel").popup("open");
    }


};


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
    this.comparator = function (todo, todo2) {
        var date = tools.toDate(todo.deadline).getTime();
        var date2 = tools.toDate(todo2.deadline).getTime();
        if (date > date2) return -1; // before
        if (date < date2) return 1; // after
        if (date == date2) return (todo.priority > todo2.priority)
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

tools.formatDate = function (date) {
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

tools.toDate = function (date) {
    var date_object = date.split("/");

    var MMDD = new Date()
    MMDD.setHours(0, 0, 0, 0);
    MMDD.setFullYear(date_object[2], date_object[1] - 1, date_object[0]);
    return MMDD;
}

tools.alert = function (type, message) {
    $("#alert-area").append($("<div class='alert-message alert alert-" + type + " fade in' data-alert='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button> " + message + " </div>"));
    $(".alert-message").delay(2000).fadeOut("slow", function () {
        $(this).remove();
    });
}

tools.isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
