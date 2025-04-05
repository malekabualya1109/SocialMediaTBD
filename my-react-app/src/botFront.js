import React, { useState, useEffect } from "react"; // Import React and hooks
import axios from "axios"; // HTTP client
import "./dailyForum.css"; // CSS for styling
import Picker from "@emoji-mart/react"; // Emoji picker component
import data from "@emoji-mart/data"; // Emoji data
import { format } from "timeago.js"; // Format timestamps into "time ago" strings

function BotForum({ username }) {
  const [comment, setComment] = useState(""); // New comment text
  const [comments, setComments] = useState([]); // List of all comments
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker visibility
  const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
  const [replyText, setReplyText] = useState(""); // Text of reply

  const loadComments = async () => {
    // Load comments from backend
    try {
      const response = await axios.get("http://localhost:8081/comments");
      setComments(response.data.reverse()); // Show newest first
    } catch (error) {
      console.error("Error loading comments", error);
    }
  };

  useEffect(() => {
    // Auto-refresh comments every 5 seconds
    loadComments();
    const interval = setInterval(loadComments, 5000);
    return () => clearInterval(interval);
  }, []);

  const postComment = async () => {
    // Post new comment to server
    if (comment.trim()) {
      try {
        const requestBody = { username, text: comment };
        const response = await axios.post("http://localhost:8081/comments", requestBody, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 201) {
          const res = await axios.get("http://localhost:8081/comments");
          const newComment = res.data[res.data.length - 1]; // Get the latest comment

          await axios.post("http://localhost:8081/comments/reply", {
            timestamp: newComment.timestamp,
            text: "ignore this",
            username: "Bot"
          });

          setComment(""); // Clear input
          loadComments(); // Reload comments
        }
      } catch (error) {
        console.error("Error posting comment", error.response ? error.response.data : error.message);
      }
    }
  };

  const sendOnEnter = (e) => {
    // Send comment on Enter key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postComment();
    }
  };

  const likeComment = async (timestamp) => {
    // Send like request to server
    try {
      const response = await axios.post("http://localhost:8081/comments/like", { timestamp });
      if (response.status === 200) {
        loadComments(); // Reload comments after like
      }
    } catch (error) {
      console.error("Error liking comment", error);
    }
  };

  const replyComment = async (timestamp, replyText) => {
    // Submit reply to a comment
    if (!replyText.trim()) return;

    try {
      const response = await axios.post("http://localhost:8081/comments/reply", {
        timestamp,
        text: replyText,
        username,
      });

      setReplyingTo(null); // Close reply input
      setReplyText(""); // Clear reply input
      loadComments(); // Refresh comments
    } catch ({ response, message }) {
      console.error("Error replying to comment", response?.data || message);
    }
  };

  const hideEmojiSet = (emoji) => {
    // Add emoji to comment
    setComment(comment + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="container"> {/* Main container */}
      <h1>Bot Forum</h1> {/* Title */}
      <h2>Chat with me</h2> {/* Subtitle */}

      <div className="comments-section"> {/* Section for all comments */}
        {comments.length > 0 ? (
          comments.map((cmt, index) => (
            <div key={index} className="comment-box"> {/* Individual comment */}
              <p>
                <strong>{cmt.username}</strong> - {format(cmt.timestamp)} {/* Timestamp display */}
              </p>
              <p>{cmt.text}</p> {/* Comment text */}

              {/* <button onClick={() => likeComment(cmt.timestamp)}>Like {cmt.likes}</button> Like button */}
              {/* <button onClick={() => setReplyingTo(cmt.timestamp)}>Reply</button>          Reply button */}
              
              {/* {replyingTo === cmt.timestamp && (
                <div className="reply-input"> 
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                  />
                  <button onClick={() => replyComment(cmt.timestamp, replyText)}>Send Reply</button>
                </div>
              )} */}

              {cmt.replies && cmt.replies.length > 0 && (
                <div className="replies"> {/* Nested replies */}
                  {cmt.replies.map((reply, idx) => (
                    <div key={idx} className="reply-box">
                      <p>
                        <strong>{reply.username}</strong> replying to{" "}
                        <strong>{cmt.username}</strong> - {format(reply.timestamp)} {/* Reply timestamp */}
                      </p>
                      <p>{reply.text}</p> {/* Reply text */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment</p> // Message for empty state
        )}
      </div>

      <div className="comment-input"> {/* Input for new comment */}
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={sendOnEnter}
          placeholder="Type your comment"
          className="input-bar"
        />
        <button onClick={postComment} className="send-button">Send</button> {/* Submit comment */}
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-button">😄</button> {/* Emoji toggle */}

        {showEmojiPicker && (
          <div className="emoji-picker"> {/* Emoji picker popup */}
            <Picker data={data} onEmojiSelect={hideEmojiSet} />
          </div>
        )}
      </div>
    </div>
  );
}

export default BotForum; // Export component