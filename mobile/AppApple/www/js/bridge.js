var bridge = {

	SUCCESS: 1,
	ERROR: 0,

	initialize: function() {
        this.db = window.openDatabase("localStorage", "1.0", "localStorage", 200000);
        this.db.transaction(this.initDatabase);
    },

    initDatabase: function( tx ) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS projects (_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, id, name, tasks_count)');
    	tx.executeSql('CREATE TABLE IF NOT EXISTS tasks (_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, id, message, project, priority, deadline, status, sync)');
    },

    isAuthenticated: function() {
        return window.localStorage.getItem("login") && window.localStorage.getItem("password");
    },

    login: function( url, callback, login, password ) {
    	if(typeof callback !== "function") return;

    	if ( login == undefined && password == undefined ) {
    		login = window.localStorage.getItem("login");
    		password = window.localStorage.getItem("password");
    	}

    	if( !this.isNetworkAccess() ) {
    		// offline mode
    		if(login == undefined && password == undefined )
    			return callback(bridge.ERROR);

    		callback(bridge.SUCCESS);
    	} else {
    		$.post(url, {
    				username: login,
    				password: password
    		})
    		.done(function() {
    			window.localStorage.setItem("login", login);
    			window.localStorage.setItem("password", password);
    			callback(bridge.SUCCESS);
    		})
			.fail(function() { callback(bridge.ERROR); });
    	}
    },

    sync: function(task_to_sync_callback, no_task_to_sync_callback) {

        if( ! this.isNetworkAccess() ) return;

        this.query("SELECT * FROM tasks WHERE sync is not null" , [], function(tx, results) {
            if ( results.rows.length == 0) {

                if(typeof no_task_to_sync_callback !== "function") return;
                return no_task_to_sync_callback();
            }

            var list = [];

            for (var i=0; i<results.rows.length; i++) {
                var task = new Task(
                    results.rows.item(i).id,
                    results.rows.item(i).message,
                    results.rows.item(i).project,
                    results.rows.item(i).priority,
                    results.rows.item(i).deadline,
                    results.rows.item(i).status,
                    results.rows.item(i).sync
                );
                task._id = results.rows.item(i)._id;
                list.push(task);
            }

            task_to_sync_callback(list, function(list, callback) {
                // sync callback
                for (var i=0; i<list.length; i++) {
                    if(list[i].sync == "delete") {
                        api.deleteTask(list[i], function(sync_with_server, object) {
                            if(!sync_with_server) return;
                            // delete old one
                            bridge.query('DELETE FROM tasks WHERE _id = _id = ' + object._id +'; ');
                        });
                    }else if(list[i].sync == "add") {
                        var old_one = list[i];
                        api.postTask(list[i], function(sync_with_server, object) {
                            if(!sync_with_server) return;
                            // delete old one
                            bridge.query('DELETE FROM tasks WHERE _id = ' + old_one._id +'; ');
                        });
                    }else if(list[i].sync == "edit") {
                        api.putTask(list[i], function(sync_with_server, object) {
                            if(!sync_with_server) return;
                            // delete sync flag
                            bridge.query('UPDATE tasks SET sync = mull WHERE _id = ' + object._id +'; ');
                        });
                    }
                }
                callback();
            }, function(list, callback) {
                // abandon callback
                bridge.query('DELETE tasks WHERE sync is not null');
                callback();
            });
        });
    },

    /*  
     * backup(object)
     * callback(object) 
     */
    get: function(url, table_name, callback, backup, dbtolist, where) {
    	if(typeof callback !== "function") return;

        if(typeof where === "undefined") {
            // where is optional
            where = "1=1";
        }

    	if( this.isNetworkAccess() ) {
    		$.get(url, function(result) {
    			// backup this to database
    			backup(result, function(result) {
    				callback(result);
    			});
    		});
    	} else {
    		this.query("SELECT * FROM "+table_name+" WHERE "+where , [], function(tx, results) {
				callback(dbtolist(results));
			});
		}
    },

    /*  
     * backup(object)
     * callback(status, object) 
     */
    post: function(url, table_name, data, callback, backup) {
    	if(typeof callback !== "function") return;
		
		if( this.isNetworkAccess() ) {
            // online
            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function (result) {
                backup(true, result, function(result) {
                    callback(true, result);
                });
                }
            });
    	} else {
    		backup(false, data, function(data) {
    			callback(false, data);	
    		});
		}
    },

    put: function(url, table_name, data, callback, backup) {
    	if(typeof callback !== "function") return;
		
		if( this.isNetworkAccess() ) {
			$.ajax({
	        	url: url,
	        	type: 'PUT',
	        	data: data,
	        	success: function (result) {
	        		backup(true, result);
	        		callback(true, result);
	            }
	        });
    	} else {
    		// @TODO set sync flag
    		backup(false, data);
    		callback(false, data);
		}
    },

    delete: function(url, table_name, data, callback, backup) {
    	if(typeof callback !== "function") return;
		
		if( this.isNetworkAccess() ) {
			$.ajax({
	        	url: url,
	        	type: 'DELETE',
	        	success: function (result) {
	        		backup(true, object);
	        		callback(true, object);
	            }
	        });
    	} else {
    		// @TODO set sync flag
    		backup(false, data);
    		callback(false, data);
		}
    },

    query: function( query, parms, success, error ) {
    	this.db.transaction(function(tx) {
    		tx.executeSql(query, parms, success, error);
    	});
    },

    isNetworkAccess: function() {
    	return navigator.connection.type != Connection.NONE;
    }
};