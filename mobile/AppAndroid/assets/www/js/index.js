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

    login: function (status) {
        if (status == bridge.ERROR) return;

        api.syncTasks();

        api.getProjects(function (projects) {
            app.projectsListView = new ProjectsListView(projects);
        });

        api.getTasks(app.projectsListView.projectsArray[0].id, function (tasks) {

            app.tasksListView = new ProjectsListView(tasks);
            // edit task
            tasks[0].message = "edited";
            api.putTask(tasks[0], function (synced_with_server, object) {
                console.log("synced_with_server=" + synced_with_server);
            });
        });

        var t = new Task(null, "hej!", 2, 1, "12/06/1991", 0);
        createTask(t);
    },

    onDeviceReady: function () {
        console.log("[nice]READY!");
        api.login(app.login, 'test', 'test');
    }


};
