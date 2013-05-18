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
import java.sql.Timestamp;
import java.util.GregorianCalendar;
import java.util.Calendar;

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
	
	public static Result addAll() {
		User user = Secured.getUser();
		Long project_home = Project.getAllProjectsByUserId(user.id).get(0).id;
		return add(project_home);
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
					new SimpleDateFormat("dd/MM/yyyy").parse(taskForm.get().deadline));
			task.save();

			JsonNode result = Json.toJson(new TaskSafe(task.id, task.project.id, task.priority, task.message, task.status,new SimpleDateFormat("dd/MM/yyyy").format(task.deadline), task.project.name));
			return ok(result);
		} catch (ParseException e) {
			JsonNode result = Json.toJson(Boolean.FALSE);
			return ok(result);
		}
	}

	public static Result updateAll(Long task) {
		User user = Secured.getUser();
		Long project_home = Project.getAllProjectsByUserId(user.id).get(0).id;
		return update(project_home, task);
	}
	
	public static Result update(Long project,Long task) {
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
			taskR.deadline=new SimpleDateFormat("dd/MM/yyyy").parse(taskForm.get().deadline);
			taskR.priority=taskForm.get().priority;
			taskR.status=taskForm.get().status;
			taskR.message=taskForm.get().message;
			taskR.updated=new Date();
			taskR.save();

			JsonNode result = Json.toJson(new TaskSafe(taskR.id, taskR.project.id, taskR.priority, taskR.message, taskR.status,new SimpleDateFormat("dd/MM/yyyy").format(taskR.deadline), taskR.project.name));
			return ok(result);
		} catch (ParseException e) {
			JsonNode result = Json.toJson(Boolean.FALSE);
			return ok(result);
		}
	}
	
	public static Result deleteAll(Long task) {
		User user = Secured.getUser();
		Long project_home = Project.getAllProjectsByUserId(user.id).get(0).id;
		return delete(project_home, task);
	}

	public static Result delete(Long project,Long task) {
		Task taskR = Task.find.ref(task);
		taskR.delete();
		JsonNode result = Json.toJson(Boolean.TRUE);
		return ok(result);
	}
	
	public static Result getWeek() {
		User user = Secured.getUser();
		// today    
		Calendar date = new GregorianCalendar();
		// reset hour, minutes, seconds and millis
		date.set(Calendar.HOUR_OF_DAY, 0);
		date.set(Calendar.MINUTE, 0);
		date.set(Calendar.SECOND, 0);
		date.set(Calendar.MILLISECOND, 0);
		Date now = date.getTime();
		// next day
		date.add(Calendar.DAY_OF_MONTH, 7);
		Date week = date.getTime();

		List<Task> tasks= Task.find.where().eq("user.id", user.id).findList();

		List<TaskSafe> tasksSafe= new ArrayList<TaskSafe>();
		for(Task t : tasks){
			if(t.deadline.compareTo(now) >= 0 && t.deadline.compareTo(week) <= 0) {
				tasksSafe.add(new TaskSafe(t.id, t.project.id, t.priority, t.message, t.status, new SimpleDateFormat("dd/MM/yyyy").format(t.deadline), t.project.name));
			}
		}
		JsonNode result = Json.toJson(tasksSafe);
		return ok(result);
	}

	public static Result getAll() {
		User user = Secured.getUser();

		List<Task> tasks= Task.findAll(user.id);
		List<TaskSafe> tasksSafe= new ArrayList<TaskSafe>();
		for(Task t : tasks){
			tasksSafe.add(new TaskSafe(t.id, t.project.id, t.priority, t.message, t.status,new SimpleDateFormat("dd/MM/yyyy").format(t.deadline), t.project.name));
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
			tasksSafe.add(new TaskSafe(t.id, t.project.id, t.priority, t.message, t.status,new SimpleDateFormat("dd/MM/yyyy").format(t.deadline), t.project.name));
		}
		JsonNode result = Json.toJson(tasksSafe);
		return ok(result);
	}
	
	public static Result getByUser() {
		User user = Secured.getUser();
		List<Task> tasks= Task.findByUser(user.id);
		List<TaskSafe> tasksSafe= new ArrayList<TaskSafe>();
		for(Task t : tasks){
			tasksSafe.add(new TaskSafe(t.id, t.project.id, t.priority, t.message, t.status,new SimpleDateFormat("dd/MM/yyyy").format(t.deadline), t.project.name));
		}
		JsonNode result = Json.toJson(tasksSafe);
		return ok(result);
	}
}

class TaskSafe{
	public Long id;
	
	public Long project;

	public String project_name;

	public int priority;

	public String message;

	public int status;

	public String deadline;

	public TaskSafe(Long id, Long project, int priority, String message, int status, String deadline, String project_name) {
		this.id = id;
		this.project = project;
		this.priority = priority;
		this.message = message;
		this.status = status;
		this.deadline = deadline;
		this.project_name = project_name;
	}
	
	
}