package models;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.avaje.ebean.Ebean;

import play.data.format.Formats;
import play.data.validation.Constraints;
import play.db.ebean.Model;
import views.html.helper.ProjectDisplay;

@Entity 
public class Project extends Model {
	@Id
    public Long id;
	
    @Constraints.Required
    @Formats.NonEmpty
	public String name;
    
    @ManyToOne
    public User user;
    
    public static Model.Finder<Long, Project> find = new Model.Finder(Long.class, Project.class);

	public Project(String name, User user) {
		this.name = name;
		this.user = user;
	}
	
	public static List<ProjectDisplay> getAllProjectsByUserId(Long id){
		if(find.where().eq("user_id", id).findRowCount()==0)
			return new ArrayList<ProjectDisplay>();

		List<ProjectDisplay> results = new ArrayList<ProjectDisplay>();

		for(Project p : find.where().eq("user_id", id).findList()) {
			Long count = Long.valueOf(Task.find.where().eq("project.id", p.id).eq("status",Task.STATUS_WAITING).findRowCount());

			results.add(new ProjectDisplay(p.id, p.name, count));
		}
		return results;
	}
    
	public static void removeProject(Long project){
		Task.deleteInProject(project);
		Ebean.createSqlUpdate("delete from project where project_id = :project").setParameter("project", project).execute();
	}
	/**
	 * Rename a project
	 */
	public static String renameProject(Long project, String newName) {
		Ebean.createSqlUpdate("update task set folder = :newName where project_id = :project").setParameter("newName", newName)
				.setParameter("project", project).execute();
		return newName;
	}
    
}
