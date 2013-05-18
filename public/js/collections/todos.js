var app = app || {};

(function() {
	'use strict';

	// Todo Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	var TodoList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: app.Todo,

		// Save all of the todo items under the `"todos"` namespace.
		//localStorage: new Store('todos-backbone'),

		url: '/projects/'+window.tasks_url+'/tasks',

		getItem: function( item_id ) {
			return this.filter(function( todo ) {
				return todo.get('id') == item_id
			});
		},

		// Filter down the list of all todo items that are finished.
		completed: function() {
			return this.filter(function( todo ) {
				return todo.get('status') == 1;
			});
		},

		// Filter down the list to only todo items that are still not finished.
		remaining: function() {
			return this.without.apply( this, this.completed() );
		},

		// Todos are sorted by their original insertion order.
		comparator: function( todo, todo2 ) {
			if(todo.get('status')==1) return -1;
			if(todo2.get('status')==1) return 1;
			var date = tools.toDate(todo.get('deadline')).getTime();
			var date2 = tools.toDate(todo2.get('deadline')).getTime();
			if (date > date2) return -1; // before
			if (date < date2) return 1; // after
			if (date == date2) return (todo.get('priority')>todo2.get('priority'))
			return todo.get('order');
		}
	});

	// Create our global collection of **Todos**.
	app.Todos = new TodoList();

}());
