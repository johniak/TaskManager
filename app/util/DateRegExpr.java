package util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DateRegExpr
{
   private static String REGEX = "@(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\\d{2}(-|/)\\d{2}(-|/)\\d{4})( |$)";
   private String output_date = "";
   private StringBuffer sb = new StringBuffer();

   public String getDate() {
      return output_date;
   }

   public String getMessage() {
      return sb.toString();
   }

   public boolean found() {
    return ! "".equals(output_date);
   }

   public DateRegExpr(String input) {
      Pattern p = Pattern.compile(REGEX);
      // get a matcher object
      Matcher m = p.matcher(input);
      
      if( m.find() ) {
    	 String input_pattern = m.group(1);
    	 Calendar now = Calendar.getInstance();
    	 
    	 int dayOfweek = -1;
    	 
    	 if ("sunday".equalsIgnoreCase(input_pattern)) {
             dayOfweek = Calendar.SUNDAY;
         } else if ("monday".equalsIgnoreCase(input_pattern)) {
             dayOfweek = Calendar.MONDAY;
         } else if ("tuesday".equalsIgnoreCase(input_pattern)) {
             dayOfweek = Calendar.TUESDAY;
         } else if ("wednesday".equalsIgnoreCase(input_pattern)) {
             dayOfweek = Calendar.WEDNESDAY;
         } else if ("thursday".equalsIgnoreCase(input_pattern)) {
             dayOfweek = Calendar.THURSDAY;
         } else if ("friday".equalsIgnoreCase(input_pattern)) {
             dayOfweek = Calendar.FRIDAY;
         } else if ("saturday".equalsIgnoreCase(input_pattern)) {
             dayOfweek = Calendar.SATURDAY;
         }
    	 
    	 if( dayOfweek != -1) {
    		 int weekday = now.get(Calendar.DAY_OF_WEEK);
    		 if (weekday != dayOfweek)
    		 {
    		     int days = (Calendar.SATURDAY - weekday + dayOfweek) % 7;
    		     now.add(Calendar.DAY_OF_YEAR, days);
    		 }else{
    			 now.add(Calendar.DAY_OF_YEAR, 7);
    		 }
    		 output_date = new SimpleDateFormat("dd/MM/yyyy").format(now.getTime());
    	 }else if("today".equalsIgnoreCase(input_pattern)) {
    		 output_date = new SimpleDateFormat("dd/MM/yyyy").format(now.getTime());
    	 }else if("tomorrow".equalsIgnoreCase(input_pattern)) {
    		 now.add(Calendar.DAY_OF_YEAR, 1);
    		 output_date = new SimpleDateFormat("dd/MM/yyyy").format(now.getTime());
    	 }else if(input_pattern.length() == 10) {
    		 output_date = input_pattern.replace("-", "/");
    	 }
    	 // remove it from message
         m.appendReplacement(sb,"");
      }
      m.appendTail(sb);
   }
}