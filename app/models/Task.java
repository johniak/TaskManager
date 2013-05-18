package models;

import java.util.*;

import javax.persistence.*;

import play.db.ebean.*;
import play.data.format.*;
import play.data.validation.*;

import com.avaje.ebean.*;

/**
 * Task entity managed by Ebean
 */
@Entity
public class Task extends Model {

	@Id
	public Long id;

	@ManyToOne
	public User user;

	@ManyToOne
	public Project project;

	public int priority;

	public String message;

	public int status;

	@Formats.DateTime(pattern = "MM/dd/yy")
	public Date updated;

	@Formats.DateTime(pattern = "MM/dd/yy")
	public Date created;

	@Formats.DateTime(pattern = "MM/dd/yy")
	public Date deadline;

	
	public Task( User user, Project project, int priority, String message, int status, Date updated, Date created, Date deadline) {
		this.user = user;
		this.project = project;
		this.priority = priority;
		this.message = message;
		this.status = status;
		this.updated = updated;
		this.created = created;
		this.deadline = deadline;
	}

	public final static int PRIORITY_LOW=0;
	public final static int PRIORITY_NORMAL=1;
	public final static int PRIORITY_HIGH=2;
	

	public final static int STATUS_DONE=0;
	public final static int STATUS_WAITING=1;
	

	public static Model.Finder<Long, Task> find = new Model.Finder(Long.class, Task.class);

	/**
	 * Retrieve todo tasks for the user.
	 */
	public static List<Task> findAll(Long user_id) {
		return Task.find.where().eq("status",Task.STATUS_WAITING).eq("user.id", user_id).findList();
	}

	/**
	 * Find tasks related to a project
	 */
	public static List<Task> findByProject(Long project) {
		return Task.find.where().eq("project.id", project).findList();
	}

	/**
	 * Remove task
	 */
	public static void deleteTask(Long id) {
		Ebean.createSqlUpdate("delete from task where id = :id").setParameter("id", id).execute();
	}
	
	/**
	 * Delete all tasks in a project
	 */
	public static void deleteInProject(Long project) {
		Ebean.createSqlUpdate("delete from task where project_id = :project").setParameter("project", project).execute();
	}

	/**
	 * Rename a folder
	 */
	public static String renameProject(Long project, String newName) {
		Ebean.createSqlUpdate("update task set folder = :newName where project_id = :project").setParameter("newName", newName)
				.setParameter("project", project).execute();
		return newName;
	}

	/**
	 * Create a task
	 */
	public static Task create(Task task, Long project) {
		task.project = Project.find.ref(project);
		task.save();
		return task;
	}

	/**
	 * Ses staus
	 */
	public static void setStatus(Long taskId, int status) {
		Task task = Task.find.ref(taskId);
		task.status = status;
		task.update();
	}

	/**
	 * Check if a user is the owner of this task
	 */
	public static boolean isOwner(Long task, String user) {
		return find.where().eq("user_id", user).eq("id", task).findRowCount() > 0;
	}

	@Override
	public String toString() {
		return "Task(" + id + ") in project " + project;
	}
}
