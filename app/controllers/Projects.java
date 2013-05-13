package controllers;

import static play.data.Form.form;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import models.Project;
import models.Task;
import models.User;

import org.codehaus.jackson.JsonNode;

import controllers.Tasks.TaskForm;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;
import play.mvc.Http.Context;

@Security.Authenticated(Secured.class)
public class Projects extends Controller {
	public static class ProjectForm {
		public String name;
	}
	


	public static Result add() {
		User user = Secured.getUser();
		Form<ProjectForm> projectForm = form(ProjectForm.class).bindFromRequest();
		if (projectForm.hasErrors()) {
			return badRequest();
		}
		Project project = new Project(projectForm.get().name, user);
		project.save();
		JsonNode result = Json.toJson(Boolean.TRUE);
		return ok(result);
	}

	public static Result getAll() {

		User user = Secured.getUser();
		List<Project> projectsUnsafe = Project.getAllProjectsByUserId(user.id);
		List<ProjectSafe> projects=new ArrayList<ProjectSafe>();
		for(Project p :projectsUnsafe){
			projects.add(new ProjectSafe(p.id,p.name,p.user.id));
		}
		JsonNode result = Json.toJson(projects);
		return ok(result);
	}
}
class ProjectSafe{
	public Long id;
	public String name;
	public Long user;
	public ProjectSafe(Long id, String name, Long user) {
		this.id = id;
		this.name = name;
		this.user = user;
	}
	
}