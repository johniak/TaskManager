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
        api.getProjects(function (projects) {
            app.projectsListView = new ProjectsListView(projects);
            api.getTasks(app.projectsListView.projectsArray[0].id, function (tasks) {
                app.tasksListView = new TasksListView(tasks);


                // edit task
                tasks[0].message = "edited";
                api.putTask(tasks[0], function (synced_with_server, object) {
                    console.log("synced_with_server=" + synced_with_server);
                });
            });
        });
        var t = new Task(null, "hej!", 2, 1, "12/06/1991", 0);
        app.createTask(t);
    },

    login: function (status) {
        if (status == bridge.ERROR) return;

        api.syncTasks(function (list, sync, abandon) {
            navigator.notification.confirm(
                'Application found unsynced data. Do you want to sync data to server?',  // message
                function (button) {
                    if (button == 1) {
                        sync(list, app.readyToGo);
                    } else {
                        abandon(list, app.readyToGo);
                    }
                },
                'Dear user!',            // title
                'Yes,No'          // buttonLabels
            );
        }, app.readyToGo);
    },

    onDeviceReady: function () {
        console.log("nice READY!");
        api.login(app.login, 'test', 'test');
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
        var data = new Task(null, $("#add-task-input").val(), 2, 1, date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear(), 0);

        alert(app.projectsListView.projectsArray[app.projectsListView.selectedId].id);

        api.postTask(data, function (synced_with_server, object) {
            alert(synced_with_server+"cscs");
            api.getTasks(data.project, function (tasks) {
                // alert($.datepicker.formatDate('yy-mm-dd', new Date()));
                app.tasksListView = new TasksListView(tasks);
            });
        });
    }

};
