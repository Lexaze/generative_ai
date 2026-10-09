import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import axios from "axios";

const API_URL = "http://localhost:3777/api/chat/conversations";

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    // Timeout ensures DOM paint has finished before triggering scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  async function fetchConversations() {
    try {
      const { data } = await axios.get(API_URL);
      setConversations(data.data || []);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching conversations:", error.message);
    }
  }

  async function handleSubmit(question) {
    if (!question.trim()) return false;

    const tempUserMessage = {
      id: Date.now(),
      content: question.trim(),
      role: "user",
    };

    setConversations((prev) => [...prev, tempUserMessage]);
    scrollToBottom();

    try {
      setIsLoading(true);
      setSubmitError("");
      const { data } = await axios.post(API_URL, {
        question: question.trim(),
      });

      if (data?.success && data?.data) {
        const { userConversation, assistantConversation } = data.data;

        setConversations((prev) => [
          ...prev.filter((msg) => msg.id !== tempUserMessage.id),
          userConversation,
          assistantConversation,
        ]);
        return true;
      }

      throw new Error(data?.message || "The server returned an invalid response.");
    } catch (error) {
      setConversations((prev) =>
        prev.filter((msg) => msg.id !== tempUserMessage.id),
      );
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to submit your question. Please try again.";
      setSubmitError(message);
      console.error("Error submitting question:", message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);

  return (
    <div className="app">
      <Sidebar />
      <main className="chat">
        <ChatHeader />

        {/* Pass ref directly into MessageList so anchor is at the end of the scroll container */}
        <MessageList
          isLoading={isLoading}
          conversations={conversations}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          error={submitError}
        />
      </main>
    </div>
  );
}

export default App;
