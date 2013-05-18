var app = app || {};

var priority = {
	0: {'name': 'Chill out', class:'label-success'},
	1: {'name': 'Default', class:'hide'},
	2: {'name': 'Do it!', class:'label-important'},
};

(function() {
	'use strict';

	// Todo Model
	// ----------

	app.Todo = Backbone.Model.extend({

		defaults: {
			message: '',
			deadline: '',
			priority: 1,
			status: 0
		},

		getPriorityClass: function() {
			return priority[this.get('priority')].class;
		},

		getPriorityText: function() {
			return priority[this.get('priority')].name;
		},

		getDeadline: function() {
			return tools.formatDate(this.get('deadline'));
		},

		toggleStatus: function() {
			this.save({
				status: !this.get('status')
			});
		}

	});

}());
