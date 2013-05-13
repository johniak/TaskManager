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
	
	public static List<Project> getAllProjectsByUserId(Long id){
		if(find.where().eq("user_id", id).findRowCount()==0)
			return new ArrayList<Project>();
		return find.where().eq("user_id", id).findList();
	}
    
	public static void removeProject(Long project){
		Task.deleteInProject(project);
		Ebean.createSqlUpdate("delete from project where project_id = :project").setParameter("project", project).execute();
	}
    
    
}
