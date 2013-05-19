var api = {
    API_URL: "http://advanced-software.org:8090/",

	initialize: function() {
        bridge.initialize();
    },

    /* 
     * login
     * @parm callback( login_status )
     * @parm login - optional
     * @parm password - optional
     */
    login: function( callback, login, password ) {
        bridge.login(this.API_URL+"login", callback, login, password)
    },

    /* 
     * getProjects
     * send get request
     * @parm callback - function( projects_list )
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

    syncTasks: function() {
        bridge.sync();
    },

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
     * send get request
     * @parm project_id
     * @parm callback - function( tasks_list )
     */
    getTasks: function( project_id, callback ) {
        bridge.get(
            this.API_URL+"projects/"+project_id+"/tasks", "tasks", callback,
            function(list, callback) { // sync
                // clear database
                bridge.query('DELETE FROM tasks WHERE project = ?', [project_id]);
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
                    results.push(new Task(
                        list.rows.item(i).id,
                        list.rows.item(i).message,
                        list.rows.item(i).project,
                        list.rows.item(i).priority,
                        list.rows.item(i).deadline,
                        list.rows.item(i).status
                    ));
                }
                return results;
            }
        );
    },

    /* 
     * postTask
     * send post request
     * @parm data - task object
     * @parm callback - function( synced_with_server, task_object )
     */
    postTask: function( data, callback ) {
        bridge.post(
            this.API_URL+"projects/"+data.project+"/tasks", "tasks", data, callback,
            function(synced_with_server, object, callback) { // sync
                var id = (synced_with_server) ? object.id : null;
                bridge.query('INSERT INTO tasks (id, message, project, priority, deadline, status) VALUES (?, ?, ?, ?, ?, ?)', 
                    [ id, String(object.message), object.project, object.priority, String(object.deadline), object.status ],
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
            function(synced_with_server, object) { // sync
                bridge.query('UPDATE tasks SET message = ?, priority = ?, deadline = ?, status = ? WHERE _id = ?', 
                    [ String(object.message), object.priority, String(object.deadline), object.status, object._id ]
                );
            }
        );
    },

    /* 
     * deleteTask
     * send put request
     * @parm data - task object
     * @parm callback - function( synced_with_server )
     */
    deleteTask: function( data, callback ) {
        bridge.delete(
            this.API_URL+"projects/"+data.project+"/tasks/"+data.id, "tasks", data, callback,
            function(synced_with_server, object) { // sync
                if(synced_with_server == true) {
                    // delete from local storage
                    bridge.query('DELETE tasks WHERE _id = ?', [data._id]);
                }else{
                    // @TODO set sync flag
                }
            }
        );
    }
};