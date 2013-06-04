var api = {
    API_URL: "http://advanced-software.org:80/",

	initialize: function() {
        bridge.initialize();
    },

    /* 
     * login
     * @parm callback( login_status - bool )
     * @parm login - optional
     * @parm password - optional
     * api will store user data as local storage
     * so you don't have to pass login and password every time
     */
    login: function( callback, login, password ) {
        bridge.login(this.API_URL+"login", callback, login, password)
    },

    /*
     * check user authentication status
     * @return boolean (authentication status)
     */
    isAuthenticated: function() {
        return bridge.isAuthenticated();
    },

    logout: function() {
        bridge.logout();
        bridge.clearTasks();
        bridge.clearProjects();
    },

    /* 
     * getProjects
     * get projects
     * @parm callback - function( projects_list - Array of Projects )
     */
    getProjects: function( callback ) {
        bridge.get(
            this.API_URL+"projects/", "projects", callback,
            function(list, callback) { // sync
                // clear database
                bridge.query('DELETE FROM projects');

                for (var i=0; i<list.length; i++) {
                    bridge.query('INSERT INTO projects (id, name, tasks_count) VALUES (?, ?, ?)',
                        [list[i].id,String(list[i].name),list[i].count]
                    );
                }
                callback(list);
            },
            function(list) { // db to model
                results = [];
                for (var i=0; i<list.rows.length; i++) {
                    results.push(new Project(
                        list.rows.item(i).id,
                        list.rows.item(i).name,
                        list.rows.item(i).tasks_count
                    ));
                }
                return results;
            }
        );
    },

    /*
     *
     *
     */
    syncTasks: function(task_to_sync_callback, no_task_to_sync_callback) {
        bridge.sync(task_to_sync_callback, no_task_to_sync_callback);
    },

    /*
     * internal usage only - this method was designed 
     * to handle asynchronous database access.
     */
    _syncListLoop: function(list, i, action, query, parms, finish) {

        bridge.query(query, 
            parms(list, i),
            function(tx, results) {
                action(list, i, results);
                if(list.length-1 == i) {
                    finish(list);
                    return;
                }
                api._syncListLoop(list, ++i, action, query, parms, finish);
            }
        );
    },

    /* 
     * getTasks
     * get tasks
     * @parm project_id
     * @parm callback - function( tasks_list - Array of Tasks )
     */
    getTasks: function( project_id, callback ) {
        bridge.get(
            this.API_URL+"projects/"+project_id+"/tasks", "tasks", callback,
            function(list, callback) { // sync with database
                // clear database
                bridge.query('DELETE FROM tasks WHERE project = ? AND (sync is null or sync = "")', [project_id]);
                api._syncListLoop(list, 0, function(list, i, results) {
                        list[i]._id = results.insertId;
                    },
                    'INSERT INTO tasks (id, message, project, priority, deadline, status) VALUES (?, ?, ?, ?, ?, ?)',
                    function(list, i) {
                        return [ list[i].id,String(list[i].message),list[i].project,list[i].priority,String(list[i].deadline),list[i].status ];
                    },
                    function(list) {
                        callback(list);
                    }
                );
            },
            function(list) { // db to model
                results = [];
                for (var i=0; i<list.rows.length; i++) {
                    var task = new Task(
                        list.rows.item(i).id,
                        list.rows.item(i).message,
                        list.rows.item(i).project,
                        list.rows.item(i).priority,
                        list.rows.item(i).deadline,
                        list.rows.item(i).status
                    );
                    task._id = list.rows.item(i)._id;
                    results.push(task);
                }
                return results;
            },
            'project = '+project_id+' and (sync!="delete" or sync is null)'
        );
    },

    /* 
     * postTask
     * send post request or store task to sync in later
     * @parm data - task object
     * @parm callback - function( synced_with_server, task_object, orginal_object )
     */
    postTask: function( data, callback ) {
        bridge.post(
            this.API_URL+"projects/"+data.project+"/tasks", "tasks", data, callback,
            function(synced_with_server, object, callback) { // sync
                var id = (synced_with_server) ? object.id : null;
                var sync = (synced_with_server) ? "" : "add";

                bridge.query('INSERT INTO tasks (id, message, project, priority, deadline, status, sync) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                    [ id, String(object.message), object.project, object.priority, String(object.deadline), object.status, String(sync) ],
                function(tx, results) {
                    object._id = results.insertId;
                    callback(object);
                });
            }
        );
    },

    /* 
     * putTask
     * send put request
     * @parm data - task object
     * @parm callback - function( synced_with_server, task_object )
     */
    putTask: function( data, callback ) {
        bridge.put(
            this.API_URL+"projects/"+data.project+"/tasks/"+data.id, "tasks", data, callback,
            function(synced_with_server, object, orginal) { // sync
                var sync = (synced_with_server) ? "" : "edit";

                bridge.query('UPDATE tasks SET message = ?, priority = ?, deadline = ?, status = ?, sync = ? WHERE _id = ?', 
                    [ String(object.message), object.priority, String(object.deadline), object.status, String(sync), orginal._id ]
                );
            }
        );
    },

    /* 
     * deleteTask
     * send delete request
     * @parm data - task object
     * @parm callback - function( synced_with_server )
     */
    deleteTask: function( data, callback ) {
        bridge.remove(
            this.API_URL+"projects/"+data.project+"/tasks/"+data.id, "tasks", data, callback,
            function(synced_with_server, object) { // sync
                if(synced_with_server == true) {
                    // delete from local storage
                    bridge.query('DELETE tasks WHERE _id = ?', [data._id]);
                }else{
                    // set sync flag to delete
                    bridge.query('UPDATE tasks SET sync = "delete" WHERE _id = ?', [ data._id ]);
                }
            }
        );
    }
};