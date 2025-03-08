import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dailyForum.css";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { format } from "timeago.js"; 


function DailyForum({ username }) { 
  // Store the comment input, list of comments, and emoji picker visibility
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState ("");

  // Load comments from the server
  const loadComments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/comments");
      setComments(response.data.reverse()); // Show newest comments first
    } catch (error) {
      console.error("Error loading comments", error);
    }
  };

  // Load comments when the page opens and refresh them every 5 seconds
  useEffect(() => {
    loadComments();
    const interval = setInterval(loadComments, 5000);
    return () => clearInterval(interval); // Stop refreshing when leaving the page
  }, []);

  // Send a new comment to the server
  const postComment = async () => {
    if (comment.trim()) { // Make sure it's not empty
      if (window.confirm("Are you sure you want to submit?")) {
        try {
          const requestBody = { username, text: comment };

          const response = await axios.post("http://localhost:8080/comments", requestBody, {
            headers: { "Content-Type": "application/json" },
          });

          if (response.status === 201) {
            setComment(""); // Clear input box
            loadComments(); // Reload the comments
          }
        } catch (error) {
          console.error("Error posting comment", error.response ? error.response.data : error.message);
        }
      }
    }
  };

  // Allow pressing Enter to send a comment instead of clicking the button
  const sendOnEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents adding a new line
      postComment();
    }
  };

  // Send a "like" to the server
  const likeComment = async (timestamp) => {
    try {
      const response = await axios.post("http://localhost:8080/comments/like", { timestamp });

      if (response.status === 200) {
        loadComments(); // Refresh comment list after liking
      }
    } catch (error) {
      console.error("Error liking comment", error);
    }
  };

  const replyComment = async (timestamp, replyText) => {
    if (!replyText.trim()) return;//Prevent empty replies

    try {
      const response = await axios.post("http://localhost:8080/comments/reply", {
        timestamp,
        text: replyText,
        username,
      });

      setReplyingTo(null);
      setReplyText("");
      loadComments ();//
    } catch ({response, message}) {
      console.error("Error replying to comment", response?.data || message);

    }
  };

  // Add an emoji to the comment and close the emoji picker
  const hideEmojiSet = (emoji) => {
    setComment(comment + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="container">
      <h1>Daily Forum</h1>
      <h2>Go Ahead... Spill some tea</h2>

      {/* Display comments */}
      <div className="comments-section">
        {comments.length > 0 ? (
          comments.map((cmt, index) => (
            <div key={index} className="comment-box">
              <p>
                <strong>{cmt.username} - {format(cmt.timestamp)}</strong> {/* Show "X minutes ago" */}
              </p>
              <p>{cmt.text}</p>
              <button onClick={() => likeComment(cmt.timestamp)}>Like {cmt.likes}</button>
              <button onClick={() => setReplyingTo(cmt.timestamp)}>Reply</button>

              {/* Reply Input (only visible for the selected comment) */}
              {replyingTo === cmt.timestamp && (
                <div className="reply-input">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                />
                <button onClick={() => replyComment(cmt.timestamp, replyText)}>
                  Send Reply
                </button>
              </div>
            )}
            {/* Display Replies (if available) */}
            {cmt.replies && cmt.replies.length > 0 && (
                <div className="replies">
                  {cmt.replies.map((reply, idx) => (
                    <div key={idx} className="reply-box">
                      <p><strong>{reply.username}</strong> - {format(reply.timestamp)}</p>
                      <p>{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment</p>
        )}
      </div>

      {/* Comment input */}
      <div className="comment-input">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={sendOnEnter} // Allow pressing Enter to send
          placeholder="Type your comment"
          className="input-bar"
        />
        <button onClick={postComment} className="send-button">Send</button>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-button">😄</button>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            <Picker data={data} onEmojiSelect={hideEmojiSet} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyForum;



