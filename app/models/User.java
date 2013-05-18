package models;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

import javax.persistence.*;
import javax.validation.Constraint;

import play.db.ebean.*;
import play.data.format.*;
import play.data.validation.*;

import com.avaje.ebean.*;
import com.ning.http.util.Base64;

/**
 * User entity managed by Ebean
 */
@Entity 
@Table(name="account")
public class User extends Model {

	@Id
	public Long id;
    
    @Constraints.Required
    @Formats.NonEmpty
    public String username;
    
    
    @Constraints.Required
    @Formats.NonEmpty
    public String password;

    @Constraints.Required
    @Formats.NonEmpty
    public String mail;
    
    @Constraints.Required
    @Formats.NonEmpty
    public String userToken;
    
    @Formats.DateTime(pattern="MM/dd/yy")
    public Date created;
    
    @Formats.DateTime(pattern="MM/dd/yy")
    public Date updated;
    // -- Queries
    
    public static Model.Finder<Long,User> find = new Model.Finder(Long.class, User.class);
    
    /**
     * Retrieve all users.
     */
    public static List<User> findAll() {
        return find.all();
    }

    /**
     * Retrieve a User from email.
     */
    public static User findByEmail(String email) {
        return find.where().eq("email", email).findUnique();
    }

    /**
     * Retrieve a User by username.
     */
    public static User findByUsername(String username) {
        return find.where().eq("username", username).findUnique();
    }
    
    /**
     * Authenticate a User.
     */
    public static User authenticate(String username, String password) {
        return find.where()
            .eq("username", username)
            .eq("password", passwordHash(password))
            .findUnique();
    }
    
    public static User Register(String username, String password, String mail){
    	if( find.where().eq("username", username).findRowCount()!=0)
    		return null;
    	if( find.where().eq("mail", mail).findRowCount()!=0)
    		return null;
    	User user = new User();
    	user.username=username;
    	user.password=passwordHash(password);
    	user.mail=mail;
    	user.userToken=UUID.randomUUID().toString();
    	user.created=new Date();
    	user.updated=new Date();
    	user.save();
    	return user;
    }
    
	public static String passwordHash(String input) {
		try {
			MessageDigest m = MessageDigest.getInstance("MD5");
			byte[] out = m.digest(input.getBytes());
			return new String(Base64.encode(out));
		} catch (NoSuchAlgorithmException e) {
			return null;
		}
	}
    public String toString() {
        return "User(" + username + ")";
    }

}

