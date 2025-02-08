import java.io.*;
import java.net.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;
import com.sun.net.httpserver.*;

public class DailyForumBackend {
    private static List<Comment> comments = Collections.synchronizedList(new ArrayList<>());  // Thread-safe list of Comment objects

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/api/comments", new CommentHandler());
        server.setExecutor(null);  // Default executor
        server.start();
        System.out.println("Server started at http://localhost:8080");

        // Scheduled task to delete comments older than 1 minute
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(() -> {
            synchronized (comments) {
                if (!comments.isEmpty()) {
                    System.out.println("Checking for comments older than 1 minute...");
                    int beforeSize = comments.size();
                    comments.removeIf(comment -> {
                        LocalDateTime commentTime = LocalDateTime.parse(comment.getTimestamp(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        return commentTime.isBefore(LocalDateTime.now().minusMinutes(1));
                    });
                    int afterSize = comments.size();
                    System.out.println((beforeSize - afterSize) + " comments deleted. Remaining comments: " + afterSize);
                }
            }
        }, 1, 1, TimeUnit.MINUTES);
    }

    static class CommentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();

            if ("GET".equalsIgnoreCase(method)) {
                handleGet(exchange);
            } else if ("POST".equalsIgnoreCase(method)) {
                handlePost(exchange);
            } else if ("OPTIONS".equalsIgnoreCase(method)) {
                handleOptions(exchange);
            } else {
                exchange.sendResponseHeaders(405, -1);  // Method Not Allowed
            }
        }

        private void handleGet(HttpExchange exchange) throws IOException {
            System.out.println("GET request received");
            String response = comments.stream()
                    .map(Comment::toString)
                    .collect(Collectors.joining("\n"));
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }

        private void handlePost(HttpExchange exchange) throws IOException {
            InputStream is = exchange.getRequestBody();
            String newCommentText = new BufferedReader(new InputStreamReader(is))
                    .lines()
                    .collect(Collectors.joining("\n"));

            synchronized (comments) {
                comments.add(new Comment(newCommentText));  // Add a new Comment object with timestamp
            }

            System.out.println("Received Comment: " + newCommentText);
            String response = "Comment added successfully!";
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }

        private void handleOptions(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "*");
            exchange.sendResponseHeaders(204, -1);  // No content
        }
    }
}

class Comment {
    private String text;
    private String timestamp;

    public Comment(String text) {
        this.text = text;
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public String getText() {
        return text;
    }

    public String getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "[" + timestamp + "] " + text;
    }
}
