package controllers;

import static play.data.Form.form;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.OneToMany;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;

import models.Project;
import models.Task;
import models.User;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;
import play.mvc.Http.Context;

@Security.Authenticated(Secured.class)
public class Tasks extends Controller {

	public static class TaskForm {

		public int priority;

		public String message;

		public int status;

		public String deadline;
	}
	

	public static Result add(Long project) {
		System.out.println(project);
		User user = Secured.getUser();
		if (!Secured.isOwnerOfProject(project, user.id)) {
			return forbidden();
		}
		Form<TaskForm> taskForm = form(TaskForm.class).bindFromRequest();
		if (taskForm.hasErrors()) {
			return badRequest();
		}
		Task task;
		try {
			task = new Task(user, Project.find.ref(project), taskForm.get().priority, taskForm.get().message, taskForm.get().status, new Date(), new Date(),
					new SimpleDateFormat("dd/mm/yyyy").parse(taskForm.get().deadline));
			task.save();

			JsonNode result = Json.toJson(new TaskSafe(task.id, task.project.id, task.priority, task.message, task.status,new SimpleDateFormat("dd/mm/yyyy").format(task.deadline)));
			return ok(result);
		} catch (ParseException e) {
			JsonNode result = Json.toJson(Boolean.FALSE);
			return ok(result);
		}
	}
	
	public static Result update(Long project,Long task) {
		System.out.println(project);
		User user = Secured.getUser();
		if (!Secured.isOwnerOfProject(project, user.id)) {
			return forbidden();
		}
		Form<TaskForm> taskForm = form(TaskForm.class).bindFromRequest();
		if (taskForm.hasErrors()) {
			return badRequest();
		}
		Task taskR;
		try {
			taskR = Task.find.ref(task);
			taskR.message=taskForm.get().message;
			taskR.deadline=new SimpleDateFormat("dd/mm/yyyy").parse(taskForm.get().deadline);
			taskR.priority=taskForm.get().priority;
			taskR.status=taskForm.get().status;
			taskR.message=taskForm.get().message;
			taskR.updated=new Date();
			taskR.save();

			JsonNode result = Json.toJson(new TaskSafe(taskR.id, taskR.project.id, taskR.priority, taskR.message, taskR.status,new SimpleDateFormat("dd/mm/yyyy").format(taskR.deadline)));
			return ok(result);
		} catch (ParseException e) {
			JsonNode result = Json.toJson(Boolean.FALSE);
			return ok(result);
		}
	}
	
	public static Result delete(Long project,Long task) {
		Task taskR = Task.find.ref(task);
		taskR.delete();
		JsonNode result = Json.toJson(Boolean.TRUE);
		return ok(result);
	}
	
	public static Result getAll() {
		User user = Secured.getUser();

		List<Task> tasks= Task.findAll(user.id);
		List<TaskSafe> tasksSafe= new ArrayList<TaskSafe>();
		for(Task t : tasks){
			tasksSafe.add(new TaskSafe(t.id, t.project.id, t.priority, t.message, t.status,new SimpleDateFormat("dd/mm/yyyy").format(t.deadline)));
		}
		JsonNode result = Json.toJson(tasksSafe);
		return ok(result);
	}

	public static Result getByProject(Long project) {
		User user = Secured.getUser();
		if (!Secured.isOwnerOfProject(project, user.id)) {
			return forbidden();
		}
		List<Task> tasks= Task.findByProject(project);
		List<TaskSafe> tasksSafe= new ArrayList<TaskSafe>();
		for(Task t : tasks){
			tasksSafe.add(new TaskSafe(t.id, t.project.id, t.priority, t.message, t.status,new SimpleDateFormat("dd/mm/yyyy").format(t.deadline)));
		}
		JsonNode result = Json.toJson(tasksSafe);
		return ok(result);
	}
	
	public static Result getByUser() {
		User user = Secured.getUser();
		List<Task> tasks= Task.findByUser(user.id);
		List<TaskSafe> tasksSafe= new ArrayList<TaskSafe>();
		for(Task t : tasks){
			tasksSafe.add(new TaskSafe(t.id, t.project.id, t.priority, t.message, t.status,new SimpleDateFormat("dd/mmm/yyyy").format(t.deadline)));
		}
		JsonNode result = Json.toJson(tasksSafe);
		return ok(result);
	}
}

class TaskSafe{
	public Long id;
	
	public Long project;

	public int priority;

	public String message;

	public int status;

	public String deadline;

	public TaskSafe(Long id, Long project, int priority, String message, int status, String deadline) {
		this.id = id;
		this.project = project;
		this.priority = priority;
		this.message = message;
		this.status = status;
		this.deadline = deadline;
	}
	
	
}