function Project(id, name, tasks_count) {
    this.id = id;
    this.name = name;
    this.tasks_count = tasks_count;
}

function Task(id, message, project, priority, deadline, status, sync) {
    this.id = id;
    this.project = project;
    this.message = message;
    this.priority = priority;
    this.deadline = deadline;
    this.status = status;
    this.sync = sync;

}