var bridge = {

	SUCCESS: 1,
	ERROR: 0,

	initialize: function() {
        this.db = window.openDatabase("localStorage", "1.0", "localStorage", 200000);
        this.db.transaction(this.initDatabase);
    },

    initDatabase: function( tx ) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS projects (_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, id unique, name, tasks_count)');
    	tx.executeSql('CREATE TABLE IF NOT EXISTS tasks (_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, id unique, message, project, priority, deadline, status)');
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

    sync: function() {
    	console.log("soon");
    },

    /*  
     * backup(object)
     * callback(object) 
     */
    get: function(url, table_name, callback, backup, dbtolist) {
    	if(typeof callback !== "function") return;

    	if( this.isNetworkAccess() ) {
    		$.get(url, function(result) {
    			// backup this to database
    			backup(result, function(result) {
    				callback(result);
    			});
    		});
    	} else {
    		this.query("SELECT * FROM "+table_name, [], function(tx, results) {
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
    		$.post(url, data, function(result) {
    			// backup this to database
    			backup(false, result, function(result) {
    				callback(true, result);
    			});
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

    query: function( query, parms, success, error ) {
    	this.db.transaction(function(tx) {
    		tx.executeSql(query, parms, success, error);
    	});
    },

    isNetworkAccess: function() {
    	return navigator.connection.type != Connection.NONE;
    }
};