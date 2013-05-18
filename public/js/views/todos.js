var app = app || {};

$(function() {
	'use strict';

	// Todo Item View
	// --------------

	// The DOM element for a todo item...
	app.TodoView = Backbone.View.extend({

		//... is a list tag.
		tagName:  'li',

		className: 'task',

		// Cache the template function for a single item.
		template: _.template( $('#item-template').html() ),

		// The DOM events specific to an item.
		events: {
			'click .status': 'toggleCompleted',
			'click': 'displayDetails'
		},

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.clear);
		},

		// Re-render the titles of the todo item.
		render: function() {
			var object = this.model.toJSON();

			object.display_deadline = this.model.getDeadline();
			object.display_priority_class = this.model.getPriorityClass();
			object.display_priority_text = this.model.getPriorityText();

			this.$el.html( this.template( object ) );

			return this;
		},

		// Toggle the `"completed"` state of the model.
		toggleCompleted: function( e ) {
			this.model.toggleStatus();

			e.preventDefault();
			return false;
		},

		displayDetails: function() {
			appView.select(this.model.toJSON(), this);
		},

		// Remove the item, destroy the model from *localStorage* and delete its view.
		clear: function() {
			this.model.destroy();
		}
	});
});
