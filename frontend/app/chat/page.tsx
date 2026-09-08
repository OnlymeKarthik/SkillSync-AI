"use client";

import { useState, useRef, useEffect } from "react";
import { useSkillsStore } from "@/lib/store/skillsStore";
import { streamChat } from "@/lib/api";
import { TagInput } from "@/components/ui/TagInput";
import { Spinner } from "@/components/ui/Loaders";
import type { ChatMessage } from "@/lib/types";
import { Bot, Send, User, Trash2, Settings } from "lucide-react";

const SUGGESTIONS = [
  "What skills do I need to become a Data Engineer?",
  "Compare government vs private sector opportunities in India",
  "How do I transition from IT support to cloud computing?",
  "What NSQF certification should I get for cybersecurity?",
  "Recommend free resources on SWAYAM for ML",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const { skills, setSkills } = useSkillsStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isStreaming) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: userText,
      timestamp: Date.now(),
    };

    const history = [...messages];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Add placeholder assistant message
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      let fullText = "";
      for await (const token of streamChat(
        userText,
        history.map((m) => ({ role: m.role, content: m.content })),
        skills
      )) {
        fullText += token;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...assistantMsg,
            content: fullText,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...assistantMsg,
          content:
            "Sorry, I couldn't connect to the AI advisor. Please make sure the backend is running.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "1rem" }}>
              AI Career Advisor
            </h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Powered by Groq LLM · Indian job market specialist
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
          {skills.length > 0 && (
            <span
              className="badge badge-indigo"
              style={{ fontSize: "0.72rem" }}
            >
              {skills.length} skill{skills.length !== 1 ? "s" : ""} set
            </span>
          )}
          <button
            className="btn-secondary"
            onClick={() => setShowSkills((v) => !v)}
            style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem" }}
          >
            <Settings size={13} />
            Skills
          </button>
          {messages.length > 0 && (
            <button
              className="btn-secondary"
              onClick={clearChat}
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem" }}
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Skills panel */}
      {showSkills && (
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "1rem 1.5rem",
            background: "rgba(13,148,136,0.05)",
            flexShrink: 0,
          }}
        >
          <label
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Your Skills (shared with AI for personalized advice)
          </label>
          <TagInput
            tags={skills}
            onChange={setSkills}
            placeholder="Add skills e.g. Python, SQL..."
          />
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "1.5rem",
              padding: "2rem",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={28} color="white" />
            </div>
            <div>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  marginBottom: "0.5rem",
                }}
              >
                Career Advisor Ready
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  maxWidth: 420,
                }}
              >
                Ask me anything about careers, skill development, NSQF
                qualifications, or the Indian job market.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                width: "100%",
                maxWidth: 520,
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.25rem",
                }}
              >
                Try asking:
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    padding: "0.625rem 0.875rem",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(13,148,136,0.4)";
                    (e.currentTarget as HTMLElement).style.color = "#5eead4";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection:
                    msg.role === "user" ? "row-reverse" : "row",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #0d9488, #14b8a6)"
                        : "rgba(255,255,255,0.08)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {msg.role === "user" ? (
                    <User size={14} color="white" />
                  ) : (
                    <Bot size={14} color="#5eead4" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={
                    msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                  }
                >
                  {msg.content ? (
                    <p
                      style={{
                        fontSize: "0.9rem",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                        color: "var(--text-primary)",
                      }}
                    >
                      {msg.content}
                      {isStreaming &&
                        idx === messages.length - 1 &&
                        msg.role === "assistant" &&
                        !msg.content.endsWith("\n") && (
                          <span className="streaming-cursor" />
                        )}
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Spinner size={14} />
                      <span style={{ fontSize: "0.85rem" }}>
                        Thinking...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1rem 1.5rem",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-end",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about careers, skills, NSQF levels... (Enter to send, Shift+Enter for newline)"
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              padding: "0.75rem 1rem",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              transition: "border-color 0.2s",
              minHeight: 44,
              maxHeight: 120,
              overflowY: "auto",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(13,148,136,0.5)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
            }}
          />
          <button
            className="btn-primary"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            style={{
              padding: "0.75rem",
              borderRadius: 12,
              flexShrink: 0,
            }}
          >
            {isStreaming ? <Spinner size={18} /> : <Send size={18} />}
          </button>
        </div>
        <p
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            textAlign: "center",
            marginTop: "0.5rem",
          }}
        >
          AI advisor is restricted to career & skill topics · Indian job market
          context
        </p>
      </div>
    </div>
  );
}
