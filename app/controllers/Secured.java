package controllers;

import models.Project;
import models.User;
import play.mvc.Result;
import play.mvc.Security;
import play.mvc.Http.Context;

public class Secured extends Security.Authenticator {
    @Override
    public String getUsername(Context ctx) {
        return ctx.session().get("username");
    }
    
    @Override
    public Result onUnauthorized(Context ctx) {
        return redirect(routes.Application.login());
    }
    
    public static boolean isOwnerOfProject(Long project,Long user){
    	if(Project.find.where().eq("id", project).eq("user_id",user).findRowCount()>0){
    		return true;
    	}
    	return false;
    }
    public static User getUser(){
    	System.out.println(Context.current().request().username()+User.find.all().get(1));
    	return User.find.where().eq("username", Context.current().request().username()).findUnique();
    }
}
