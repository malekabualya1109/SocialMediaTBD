import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dailyForum.css";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { format } from "timeago.js";

function DailyForum() {
  const username = localStorage.getItem("username");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});

  const extractUsernames = (commentsList) => {
    const users = new Set();

    const collect = (items) => {
      for (const item of items) {
        if (item.username) users.add(item.username);
        if (item.replies?.length > 0) collect(item.replies);
      }
    };

    collect(commentsList);
    return Array.from(users);
  };

  const extractUserInfo = (commentsList) => {
    const profiles = {};

    const collect = (items) => {
      for (const item of items) {
        if (item.username && item.profilePic) {
          profiles[item.username] = item.profilePic;
        }
        if (item.replies?.length > 0) collect(item.replies);
      }
    };

    collect(commentsList);
    return profiles;
  };

  const loadComments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/comments");
      const reversed = response.data.reverse();
      setComments(reversed);

      const users = extractUsernames(reversed);
      const profiles = extractUserInfo(reversed);

      setActiveUsers(users);
      setUserProfiles(profiles);
    } catch (error) {
      console.error("Error loading comments", error);
    }
  };

  useEffect(() => {
    loadComments();
    const interval = setInterval(loadComments, 5000);
    return () => clearInterval(interval);
  }, []);

  const postComment = async () => {
    if (comment.trim()) {
      try {
        const requestBody = {
          username,
          text: comment,
          profilePic: localStorage.getItem("profilePic") || "",
        };
        const response = await axios.post(
          "http://localhost:8080/comments",
          requestBody,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 201) {
          setComment("");
          loadComments();
        }
      } catch (error) {
        console.error("Error posting comment", error.response?.data || error.message);
      }
    }
  };

  const sendOnEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postComment();
    }
  };

  const likeComment = async (timestamp) => {
    try {
      const response = await axios.post("http://localhost:8080/comments/like", { timestamp });
      if (response.status === 200) loadComments();
    } catch (error) {
      console.error("Error liking comment", error);
    }
  };

  const replyComment = async (timestamp, replyText) => {
    if (!replyText.trim()) return;
    try {
      await axios.post("http://localhost:8080/comments/reply", {
        timestamp,
        text: replyText,
        username,
        profilePic: localStorage.getItem("profilePic") || ""
      });
      setReplyingTo(null);
      setReplyText("");
      loadComments();
    } catch ({ response, message }) {
      console.error("Error replying to comment", response?.data || message);
    }
  };

  const hideEmojiSet = (emoji) => {
    setComment(comment + emoji.native);
    setShowEmojiPicker(false);
  };

  const renderReplies = (replies) =>
    replies.map((reply, idx) => (
      <div key={idx} className="reply-box" style={{ marginLeft: "20px" }}>
        <div className="profile-header">
          <img
            src={reply.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="profile-pic"
          />
          <div className="profile-meta">
            <a href={`/profile/${reply.username}`} className="username-link">
              <strong>{reply.username}</strong>
            </a>
            <span className="timestamp">replying to - {format(reply.timestamp)}</span>
          </div>
        </div>
        <p>{reply.text}</p>
        <button className="like-button" onClick={() => likeComment(reply.timestamp)}>
          Like {reply.likes || 0}
        </button>
        <button className="reply-button" onClick={() => setReplyingTo(reply.timestamp)}>Reply</button>
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
        {reply.replies?.length > 0 && renderReplies(reply.replies)}
      </div>
    ));
  
  return (
    <div className="daily-forum-wrapper">
      <div className="daily-sidebar">
        <div className="sidebar-title">
          <img src="/tea-icon.png" alt="Tea icon" className="sidebar-image" />
        </div>
        <div className="sidebar-links">
          <a href="/">Back to Homepage</a>
          <a href="/upload-story">New Story</a>
          <a href="/">Post to Main Wall</a>
          <a href="/chat-ai">Chat with Ai</a>
        </div>
      </div>
  
      <div className="daily-main">
        <div className="container">
          <img src="/dailyforumbanner.png" alt="Daily Forum Banner" className="banner-image" />
  
          <div className="comments-section">
            {comments.length > 0 ? (
              comments.map((cmt, index) => (
                <div key={index} className="comment-box">
                  <div className="profile-header">
                    <img
                      src={cmt.profilePic || "/default-avatar.png"}
                      alt="Profile"
                      className="profile-pic"
                    />
                    <a href={`/profile/${cmt.username}`} className="username-link">
                      <strong>{cmt.username}</strong>
                    </a>
                    <span style={{ marginLeft: "8px", color: "#888" }}>{format(cmt.timestamp)}</span>
                  </div>
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
                  {cmt.replies?.length > 0 && renderReplies(cmt.replies)}
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
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="icon-button emoji"
              >
                😄
              </button>
            </div>
  
            {showEmojiPicker && (
              <div className="emoji-picker">
                <Picker data={data} onEmojiSelect={hideEmojiSet} />
              </div>
            )}
          </div>
        </div>
      </div>
  
      <div className="daily-right">
        <h3>Active Users</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {activeUsers.map((user, i) => (
            <li key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
              <img
                src={userProfiles[user] || "/default-avatar.png"}
                alt="Avatar"
                style={{ width: "24px", height: "24px", borderRadius: "50%", marginRight: "8px" }}
              />
              <a href={`/profile/${user}`} style={{ textDecoration: "none", color: "#4B001f" }}>
                {user}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
  export default DailyForum;
  
