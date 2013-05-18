package util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PriorityRegExpr
{
   private static String REGEX = "( |^)(!|!!|!!!)( |$)";
   private int output_priority = -1;
   private StringBuffer sb = new StringBuffer();

   public int getPriority() {
      return output_priority;
   }

   public String getMessage() {
      return sb.toString();
   }

   public boolean found() {
    return output_priority != -1;
   }

   public PriorityRegExpr(String input) {
      Pattern p = Pattern.compile(REGEX);
      // get a matcher object
      Matcher m = p.matcher(input);
      
      if( m.find() ) {
    	 String input_pattern = m.group(2);
    	 if("!".equalsIgnoreCase(input_pattern)) {
          output_priority = 0;
       }else if("!!".equalsIgnoreCase(input_pattern)) {
          output_priority = 1;
       }else if("!!!".equalsIgnoreCase(input_pattern)) {
          output_priority = 2;
       }
    	 // remove it from message
         m.appendReplacement(sb,"");
      }
      m.appendTail(sb);
   }
}