import React, { useState, useEffect } from "react";
import axios from "axios";
import "./chatAi.css";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { format } from "timeago.js";

function ChatAi() {
  const API_BASE = "http://localhost:8081";
  const username = localStorage.getItem("username");
  const profilePic = localStorage.getItem("profilePic");

  // State for the input message, loaded messages, and emoji picker visibility
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Flatten all messages and nested replies into a single list
  const getAllMessages = (msgs) => {
    let flat = [];
  
    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      flat.push(msg);
  
      if (msg.replies && msg.replies.length > 0) {
        const nestedReplies = getAllMessages(msg.replies);
        for (let j = 0; j < nestedReplies.length; j++) {
          flat.push(nestedReplies[j]);
        }
      }
    }
  
    return flat;
  };
  

  // Fetch messages from the server
  const loadMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE}/chat`);
      setChatMessages(response.data);
    } catch (error) {
      console.error("Error loading chat messages", error);
    }
  };

  // Load messages on mount and refresh every 5 seconds
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // Send a new message to the server
  const sendMessage = async () => {
    if (message.trim()) {
      try {
        const requestBody = { username, text: message, profilePic: profilePic || "" };
        const response = await axios.post(`${API_BASE}/chat`, requestBody, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 201) {
          setMessage("");
          loadMessages();
        }
      } catch (error) {
        console.error("Error sending message", error.response?.data || error.message);
      }
    }
  };

  // Allow sending message with Enter key
  const sendOnEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Add selected emoji to the message input
  const hideEmojiSet = (emoji) => {
    setMessage(message + emoji.native);
    setShowEmojiPicker(false);
  };

  // Clear chat and navigate back to the homepage
  const handleGoBack = async () => {
    try {
      await axios.post(`${API_BASE}/chat/clear`);
    } catch (error) {
      console.error("Error clearing chat", error);
    }
    window.location.href = "/";
  };

  // UI rendering
  return (
    <div className="container">
      {/* Header */}
      <div className="chat-header">Chat Bot</div>

      {/* Back to Homepage button */}
      <div style={{ backgroundColor: "#f2f2f2", padding: "10px" }}>
        <button
          onClick={handleGoBack}
          style={{
            background: "none",
            border: "none",
            color: "#4B001f",
            fontWeight: "bold",
            textDecoration: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          ← Back to Homepage
        </button>
      </div>

      {/* Message display area */}
      <div className="comments-section">
        {getAllMessages(chatMessages).map((msg, index) => {
          const isUser = msg.username === username;
          return (
            <div key={index} className={`comment-box ${isUser ? "user" : "other"}`}>
              <div className="profile-header">
                <img
                  src={msg.profilePic || "/default-avatar.png"}
                  alt="Profile"
                  className="profile-pic"
                />
                <div>
                  <strong>{msg.username}</strong> • {format(msg.timestamp)}
                </div>
              </div>
              <p>{msg.text}</p>
            </div>
          );
        })}
      </div>

      {/* Input area for sending messages */}
      <div className="comment-input">
        <div className="input-wrapper">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={sendOnEnter}
            placeholder="Type your message"
            className="input-bar"
          />
          <button onClick={sendMessage} className="icon-button send">
            Send
          </button>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="icon-button emoji"
          >
            😄
          </button>
        </div>

        {/* Emoji picker popup */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            <Picker data={data} onEmojiSelect={hideEmojiSet} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatAi;
