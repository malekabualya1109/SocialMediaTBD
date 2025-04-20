import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./directMessage.css";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { format } from "timeago.js";

function DirectMessage() {
  const { username: receiverParam } = useParams();
  const navigate = useNavigate();
  const sender = localStorage.getItem("username");
  const profilePic = localStorage.getItem("profilePic");
  const scrollRef = useRef(null);

  const [receiver, setReceiver] = useState(receiverParam || "");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversations, setConversations] = useState([]);

  const API_BASE = "http://localhost:8082";

  useEffect(() => {
    setReceiver(receiverParam || "");
  }, [receiverParam]);

  useEffect(() => {
    if (receiver) loadMessages();
    const interval = setInterval(() => {
      if (receiver) loadMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [receiver]);

  useEffect(() => {
    loadFriendListAsConversations(); //pulls from localStorage
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations from friend list
  const loadFriendListAsConversations = async () => {
    const allFriends = JSON.parse(localStorage.getItem("friends") || "{}");
    const myFriends = allFriends[sender] || [];
  
    const list = await Promise.all(
      myFriends.map(async (friend) => {
        try {
          const response = await axios.get(`${API_BASE}/direct`, {
            params: { sender, receiver: friend },
          });
          const lastMessage = response.data[response.data.length - 1] || {};
          return {
            username: friend,
            profilePic: lastMessage.profilePic || localStorage.getItem(`profilePic:${friend}`) || "/default-avatar.png",
          };
        } catch (err) {
          console.error("Error loading data for", friend);
          return {
            username: friend,
            profilePic: localStorage.getItem(`profilePic:${friend}`) || "/default-avatar.png",
          };
        }
      })
    );
  
    setConversations(list);
  };
  
  const loadMessages = async () => {
    if (!sender || !receiver) return;
    try {
      const response = await axios.get(`${API_BASE}/direct`, {
        params: { sender, receiver },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error loading direct messages", error);
    }
  };

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        const requestBody = { sender, receiver, text: message, profilePic };
        const response = await axios.post(`${API_BASE}/direct`, requestBody);
        if (response.status === 201) {
          setMessage("");
          loadMessages();
          loadFriendListAsConversations(); // refresh in case this is a new convo
        }
      } catch (error) {
        console.error("Error sending message", error.response?.data || error.message);
      }
    }
  };

  const sendOnEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hideEmojiSet = (emoji) => {
    setMessage(message + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="direct-message-wrapper">
      <div className="conversation-list">
        <h3>Your Conversations</h3>
        <ul>
          {conversations.map((c, index) => (
            <li
            key={index}
            className={c.username === receiver ? "active" : ""}
            onClick={() => {
              navigate(`/direct/${c.username}`);
              setReceiver(c.username);
            }}
          >
            <img
              src={c.profilePic || "/default-avatar.png"}
              alt="Profile"
              className="friend-avatar"
          />
            <span className="conversation-name">{c.username}</span>
          </li>
          
          ))}
        </ul>
      </div>

      <div className="chat-container">
        {receiver ? (
          <>
            <div className="chat-header">Chat with {receiver}</div>
            <div className="comments-section" ref={scrollRef}>
              {messages.map((msg, index) => {
                const isUser = msg.username === sender;
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
                <button onClick={sendMessage} className="icon-button send">Send</button>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="icon-button emoji"
                >
                  +
                </button>
              </div>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <Picker data={data} onEmojiSelect={hideEmojiSet} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="chat-header">Select a conversation to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default DirectMessage;
