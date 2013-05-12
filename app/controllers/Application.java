package controllers;

import static play.data.Form.form;
import models.User;
import play.*;
import play.data.Form;
import play.mvc.*;
import views.*;
import views.html.*;

public class Application extends Controller {

	public static class Login {

		public String username;
		public String password;

		public String validate() {
			if (User.authenticate(username, password) == null) {

				return "Invalid user or password!";
			}
			return null;
		}

	}

	public static class Register {
		public String username;
		public String email;
		public String password;
		public String rePassword;

		public String validate() {
			if (!username.matches("^[a-zA-Z0-9]{4,20}$")) {
				return "Invalid username. Must be 4 to 20 length and might use only alphanumeric characters";
			}
			if(password.compareTo(rePassword)!=0){
				return "Passwords don't match";				
			}
			if (!password.matches(".{4,20}")) {
				return "Invalid password. Must be 4 to 25 length";
			}
			if (!email
					.matches("^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,3})$")) {
				return "Invalid email";
			}
			if (User.Register(username, password, email) == null) {
				return "login or email exist";
			}
			return null;
		}
	}

	/**
	 * Login page.
	 */
	public static Result login() {
		// return ok("fdsf");
		return ok(login.render(form(Login.class)));
	}

	/**
	 * Handle login form submission.
	 */
	public static Result authenticate() {
		Form<Login> loginForm = form(Login.class).bindFromRequest();
		if (loginForm.hasErrors()) {
			return badRequest(login.render(loginForm));
		} else {
			session("username", loginForm.get().username);
			return redirect(routes.Application.index());
		}
	}
	
	/**
	 * Handle register form submission.
	 * @return
	 */
	public static Result registerPost(){
		User.Register("aa", "bb", "cc");
		Form<Register> registerForm = form(Register.class).bindFromRequest();
		if (registerForm.hasErrors()) {
			return badRequest(register.render(registerForm));
		} else {
			return redirect(routes.Application.login());
		}
	}
	
	/**
	 * Login page.
	 */
	public static Result register() {
		// return ok("fdsf");
		return ok(register.render(form(Register.class)));
	}

	
	public static Result index() {
		 String s="";
		for (User u :User.find.all()){
			s+=u.id+":"+u.username+"\n";
		}
		s+="\n";
		return ok(s);
	}

}
