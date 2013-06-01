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
            $('#popupSync a').live('click', function(e) {
                $('#popupSync').popup("close");
                var answer = $(this).attr('data-button-id');
                if( answer == "sync" ) {
                    sync(list, app.readyToGo);
                }else{
                    abandon(list, app.readyToGo);
                }
            });
        }, app.readyToGo);
    },

    onDeviceReady: function () {
        console.log("nice READY!");
        if ( api.isAuthenticated() ) {
            // just login
            api.login(app.login);
        } else {
            $('#popupLogin').popup("open");
            $('#popupLogin button').live('click', function(e) {
                $.mobile.loading('show');
                api.login(app.login, $('#popupLogin #username').val(), $('#popupLogin #password').val());
            });
        }
        $("#update-button").click(app.onUpdateButtonClicked);
        $("#add-task-button").click(app.onAddTaskButton);
    },

    onUpdateButtonClicked: function () {
      //  alert($("#message").val());
       // alert($('#slider').val());
       // alert($("#priority-selector label[data-icon=radio-on]").attr("data-id"));
      //  alert($("#date").val());
        alert(app.tasksListView.tasksArray[app.tasksListView.selectedId].message);
        var id=app.tasksListView.selectedId;
        app.tasksListView.tasksArray[id].message= $("#message").val();
        app.tasksListView.tasksArray[id].deadline= $("#date").val();
        app.tasksListView.tasksArray[id].priority= $("#priority-selector label[data-icon=radio-on]").attr("data-id");
        app.tasksListView.tasksArray[id].status= $('#slider').val()=="on"?1:0;
        api.putTask(app.tasksListView.tasksArray[app.tasksListView.selectedId], function (synced_with_server, object) {
            api.getTasks(app.tasksListView.tasksArray[app.tasksListView.selectedId].project, function (tasks) {
                app.tasksListView = new TasksListView(tasks);
            });
        });
    },
    onAddTaskButton: function(){
        var date = new Date();
        var data = new Task(null, $("#add-task-input").val(),
            app.projectsListView.projectsArray[app.projectsListView.selectedId].id,
            1, date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear(), 0);

        api.postTask(data, function (synced_with_server, object) {
            console.log("data.project", data.project);
            api.getTasks(data.project, function (tasks) {
                // alert($.datepicker.formatDate('yy-mm-dd', new Date()));
                app.tasksListView = new TasksListView(tasks);
            });
        });
    }

};
