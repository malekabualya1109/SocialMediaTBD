import React, { useState, useEffect } from "react"; // Import React and hooks
import axios from "axios"; // HTTP client
import "./dailyForum.css"; // CSS for styling
import Picker from "@emoji-mart/react"; // Emoji picker component
import data from "@emoji-mart/data"; // Emoji data
import { format } from "timeago.js"; // Format timestamps into "time ago" strings

function DailyForum() {
  const username = localStorage.getItem("username");
  const [comment, setComment] = useState(""); // New comment text
  const [comments, setComments] = useState([]); // List of all comments
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker visibility
  const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
  const [replyText, setReplyText] = useState(""); // Text of reply

  const loadComments = async () => {
    // Load comments from backend
    try {
      const response = await axios.get("http://localhost:8080/comments");
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
        const response = await axios.post("http://localhost:8080/comments", requestBody, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 201) {
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
      const response = await axios.post("http://localhost:8080/comments/like", { timestamp });
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
      const response = await axios.post("http://localhost:8080/comments/reply", {
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

  const renderReplies = (replies, parentUsername) => {
    return replies.map((reply, idx) => (
      <div key={idx} className="reply-box" style={{ marginLeft: "20px" }}>
        <p>
          <strong>{reply.username}</strong> replying to{" "}
          <strong>{reply.replyingTo}</strong> - {format(reply.timestamp)}
        </p>
        <p>{reply.text}</p>
  
        <button className="reply-button" onClick={() => setReplyingTo(reply.timestamp)}>
          Reply
        </button>
  
        {replyingTo === reply.timestamp && (
          <div className="reply-input">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
            />
            <button onClick={() => replyComment(reply.timestamp, replyText)}>Send Reply</button>
          </div>
        )}
  
        {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, reply.username)}
      </div>
    ));
  };
  

  return (
    <>
      <div className="container">
        <img src="/dailyforumbanner.png" alt="Daily Forum Banner" className="banner-image" />
        {/* Back to Homepage link */}
        <div style={{ backgroundColor: "#f2f2f2", padding: "10px" }}>
          <a href="/" style={{ color: "#4B001f", fontWeight: "bold", textDecoration: "none" }}>
            ← Back to Homepage
          </a>
        </div>
        
        <div className="comments-section">
          {comments.length > 0 ? (
            comments.map((cmt, index) => (
              <div key={index} className="comment-box">
                <p>
                  <strong>{cmt.username}</strong> - {format(cmt.timestamp)}
                </p>
                <p>{cmt.text}</p>
  
                <button className="like-button" onClick={() => likeComment(cmt.timestamp)}>
                  Like {cmt.likes}
                </button>
                <button className="reply-button" onClick={() => setReplyingTo(cmt.timestamp)}>
                  Reply
                </button>
  
                {replyingTo === cmt.timestamp && (
                  <div className="reply-input">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                    />
                    <button onClick={() => replyComment(cmt.timestamp, replyText)}>Send Reply</button>
                  </div>
                )}
  
                  {cmt.replies && cmt.replies.length > 0 && renderReplies(cmt.replies, cmt.username)}

              </div>
            ))
          ) : (
            <p>No comments yet. Be the first to comment</p>
          )}
        </div>
  
        <div className="comment-input">
          <div className="input-wrapper">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={sendOnEnter}
              placeholder="Type your comment"
              className="input-bar"
            />
            <button onClick={postComment} className="icon-button send">Send</button>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="icon-button emoji">😄</button>
          </div>
  
          {showEmojiPicker && (
            <div className="emoji-picker">
              <Picker data={data} onEmojiSelect={hideEmojiSet} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
  
export default DailyForum; 