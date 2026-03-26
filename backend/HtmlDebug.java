import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class HtmlDebug {
    public static void main(String[] args) throws Exception {
        String url = "https://codeforces.com/contest/2182/problem/A";
        
        Document doc = Jsoup.connect(url)
            .timeout(15000)
            .ignoreHttpErrors(true)
            .userAgent("Mozilla/5.0")
            .get();
        
        Element problemStatement = doc.select(".problem-statement").first();
        if (problemStatement != null) {
            Elements allDivs = problemStatement.select("div, p, span");
            System.out.println("Total elements: " + allDivs.size());
            System.out.println("\nFirst 20 elements:");
            
            for (int i = 0; i < Math.min(20, allDivs.size()); i++) {
                String text = allDivs.get(i).text().trim();
                if (text.length() > 0 && text.length() < 150) {
                    System.out.println("[" + i + "] " + text.substring(0, Math.min(80, text.length())));
                }
            }
            
            System.out.println("\n\nSearching for 'Input' and 'Output':");
            for (int i = 0; i < allDivs.size(); i++) {
                String text = allDivs.get(i).text().trim();
                if (text.equalsIgnoreCase("Input") || text.equalsIgnoreCase("Output") 
                    || text.toLowerCase().startsWith("input") || text.toLowerCase().startsWith("output")) {
                    System.out.println("[" + i + "] FOUND: " + text.substring(0, Math.min(100, text.length())));
                }
            }
        }
    }
}
