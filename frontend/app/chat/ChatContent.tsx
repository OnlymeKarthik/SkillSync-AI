"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RotateCcw, Copy, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const STARTER_PROMPTS = [
  "What skills do I need to become a Data Scientist?",
  "Compare DevOps vs Cloud Architect career paths",
  "How long does it take to become job-ready in cybersecurity?",
  "What NSQF certifications boost my salary the most?",
  "I'm a fresher with Python skills — what career suits me?",
];

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content: `Namaste! I'm **Vidyavani AI**, your personal career advisor for the Indian job market.

I can help you with:
- **Skill gap analysis** — what you know vs. what you need
- **Career path planning** — step-by-step roadmaps
- **Salary benchmarks** — realistic expectations by role and experience
- **NSQF framework** — certifications that matter for govt & private jobs
- **Free learning resources** — SWAYAM, NPTEL, YouTube recommendations

Ask me anything about your career journey!`,
  timestamp: new Date(),
};

function formatMessage(content: string) {
  // Convert **bold** and line breaks to HTML-like JSX
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [skills] = useState<string[]>([]); // In production, loaded from session
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Assistant placeholder
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const response = await fetch("http://localhost:8000/api/v1/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          user_skills: skills,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            accumulated += line.slice(6);
            setMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
            );
          }
        }
      }
    } catch {
      // Fallback demo response when backend is not available
      const demo = `Great question! Here's what I know about **${userText.slice(0, 40)}${userText.length > 40 ? "..." : ""}**:

The Indian tech job market is evolving rapidly. Based on NSQF guidelines and current industry demand:

- **Skill priority:** Focus on practical, portfolio-building skills first
- **Free resources:** SWAYAM (swayam.gov.in) and NPTEL offer industry-recognised courses
- **Timeline:** Most roles require 6–18 months of focused learning
- **Salary range:** Entry-level ₹4L–₹8L, mid-level ₹10L–₹25L depending on domain

*Note: Connect the backend to get personalised AI responses based on your resume and skill profile.*`;
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: demo } : m)
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col">
      <Navbar />
      <div className="bg-glow-violet fixed inset-0 pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 pt-20 pb-0">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Vidyavani AI Advisor</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Online · Career expert</span>
              </div>
            </div>
          </div>
          <button
            id="reset-chat"
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New chat
          </button>
        </div>

        {/* Starter prompts (only when at initial state) */}
        {messages.length === 1 && (
          <div className="py-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 text-center">Try asking</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-sm glass border border-white/10 hover:border-violet-500/30 hover:text-violet-300 text-gray-300 rounded-full px-4 py-2 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-violet-500 to-blue-500"
                  : "bg-white/10 border border-white/10"
              }`}>
                {msg.role === "assistant" ? (
                  <Sparkles className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-gray-300" />
                )}
              </div>

              {/* Bubble */}
              <div className={`group max-w-[80%] relative ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-violet-500/20 border border-violet-500/20 text-gray-200 rounded-tr-sm"
                    : "glass border border-white/8 text-gray-300 rounded-tl-sm"
                } ${msg.id !== "init" && !msg.content && isStreaming ? "typing-cursor" : ""}`}>
                  {msg.content ? formatMessage(msg.content) : (
                    isStreaming ? <span className="text-gray-500">Thinking...</span> : null
                  )}
                </div>

                {/* Copy button for assistant messages */}
                {msg.role === "assistant" && msg.content && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-600 hover:text-gray-400"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="py-4 border-t border-white/5">
          <div className="glass border border-white/10 rounded-2xl flex items-end gap-3 p-3 focus-within:border-violet-500/40 transition-colors">
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about career paths, skill gaps, salaries..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-white placeholder-gray-500 text-sm focus:outline-none min-h-[24px] max-h-32"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              id="send-message"
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">
            Career advice is powered by Groq AI · Filtered to career topics only
          </p>
        </div>
      </main>
    </div>
  );
}
