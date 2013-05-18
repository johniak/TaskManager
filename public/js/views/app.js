var app = app || {};

$(function( $ ) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	app.AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: 'body',

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #add-task-input': 'keyPress',
			'click #add-task-button': 'addTask',
			'click .close': 'closeDetails',
			'click .delete': 'deleteSelected',
			'click .save': 'saveSelected',
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function(callback) {

			this.input = $('#add-task-input');

			this.selected = -1;

			this.listenTo(app.Todos, 'add', this.addAll);
			this.listenTo(app.Todos, 'reset', this.addAll);
			this.listenTo(app.Todos, 'change:status', this.filterOne);
			//this.listenTo(app.Todos, 'all', this.render);

			this.callback = callback;
			app.Todos.fetch();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			
		},

		addOne: function( todo ) {
			var view = new app.TodoView({ model: todo });
			todo.view = view;
			$('#task-list').prepend( view.render().el );
		},

		addAll: function() {
			this.$('#task-list').html('');
			app.Todos.each(this.addOne, this);
			if(typeof(this.callback) == "function")
        			this.callback(this);
		},

		filterOne: function( todo ) {
			todo.trigger('visible');
		},

		deleteSelected: function() {
			this.selected.clear();
			this.closeDetails();
		},

		saveSelected: function() {
			var message = $("#title").val();
			var deadline = $("#date").val();
			var priority =  $("#priority .active").attr('data-id');

			this.selected.model.set('message', message);
			this.selected.model.set('deadline', deadline);
			this.selected.model.set('priority', priority);
			this.selected.model.save();
			this.closeDetails();
		},

		select: function( data, item ) {
			// unselect future
			if (this.selected == item) {
				this.closeDetails();
				return;
			}

			app.TodoRouter.navigate('task/'+data.id);

			// set selected id
			this.selected = item;

			// unselect others
			$(".task.selected").removeClass('selected');
			// select
			item.$el.addClass('selected');

			$("#title").val(data.message);
			$("#date").datepicker('setValue',data.deadline);

			$("#priority .active").removeClass('active');
			$("#priority button[data-id="+data.priority+"]").addClass('active');

			// display box
			$("#details").show();
		},

		closeDetails: function() {
			app.TodoRouter.navigate();
			// hide box and unselect selected
			$("#details").hide();
			$(".task.selected").removeClass('selected');
			this.selected = -1;
		},

		addTask: function() {
			var today =  new Date();
			today.setHours(0, 0, 0, 0);

			var t = new Date();
		    t.setHours(0, 0, 0, 0);
		    t.setDate(today.getDate() + 1);

		    var date_string = (t.getMonth()+1)+"/"+t.getDate()+"/"+t.getFullYear();

			app.Todos.create( {
				message: this.input.val(),
				status: 0,
				deadline: date_string
			} );

			this.input.val('');
		},

		keyPress: function( e ) {

			if ( e.which !== 13 ) {
				return;
			}

			this.addTask();
		}
	});
});
