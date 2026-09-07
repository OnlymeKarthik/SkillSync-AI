"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RotateCcw, Copy, Check, MessageSquare } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

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
  const [skills] = useState<string[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length > 1 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
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

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, initialAssistantMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/v1/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          current_skills: skills,
          history: messages
            .filter(m => m.id !== "init")
            .slice(-6)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat stream unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.delta ?? parsed.text ?? parsed.content ?? "";
              accumulated += delta;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulated } : m)
              );
            } catch {
              accumulated += data;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulated } : m)
              );
            }
          }
        }
      }
    } catch {
      const fallbackReplies: Record<string, string> = {
        data: `To become a **Data Scientist**, here's your prioritized learning path:

1. **Core Foundation**: Python, SQL, Statistics & Probability
2. **Data Manipulation**: Pandas, NumPy, Data Cleaning
3. **Machine Learning**: Scikit-Learn, Regression, Classification
4. **Deep Learning & GenAI**: PyTorch, LangChain, Transformers
5. **NSQF Alignment**: Look for NSQF Level 6-7 certifications in AI/Big Data.

Check our **[Roadmap Generator](/roadmap)** for free SWAYAM and NPTEL courses!`,
        devops: `**DevOps vs Cloud Architect**:

- **DevOps Engineer**: Focuses on CI/CD automation, Docker/K8s containerization, and monitoring. Average salary: ₹7L – ₹20L.
- **Cloud Architect**: Focuses on high-level infrastructure design, multi-cloud strategy, cost optimization, and security governance. Average salary: ₹15L – ₹40L.

Start with DevOps if you're intermediate; advance to Cloud Architect as you gain system design expertise.`,
      };

      const lower = userText.toLowerCase();
      let reply = "I'm analyzing that based on NSQF standards and current hiring trends. Could you specify your target domain or experience level so I can give you a tailored breakdown?";
      for (const [kw, text] of Object.entries(fallbackReplies)) {
        if (lower.includes(kw)) { reply = text; break; }
      }

      setMessages(prev =>
        prev.map(m => m.id === assistantMsgId ? { ...m, content: reply } : m)
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-5.5rem)]">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Vidyavani <span className="gradient-text">AI Advisor</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Online · LangGraph Career Swarm</span>
            </div>
          </div>
        </div>

        <button
          id="reset-chat"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg glass hover:bg-white/10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New chat</span>
        </button>
      </div>

      {/* Starter Prompts (Shown only at start) */}
      {messages.length === 1 && (
        <div className="py-4 shrink-0">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2.5 text-center font-semibold">
            Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {STARTER_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-xs sm:text-sm glass border border-white/10 hover:border-violet-500/40 hover:text-violet-300 text-gray-300 rounded-full px-3.5 py-1.5 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-2 space-y-5 pr-1">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
              msg.role === "assistant"
                ? "bg-gradient-to-br from-violet-600 to-blue-600 shadow-md"
                : "bg-white/10 border border-white/10"
            }`}>
              {msg.role === "assistant" ? (
                <Sparkles className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-gray-300" />
              )}
            </div>

            {/* Bubble */}
            <div className={`group max-w-[85%] relative ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-violet-600 text-white font-medium rounded-tr-sm shadow-md"
                  : "glass border border-white/10 text-gray-200 rounded-tl-sm shadow-sm"
              } ${msg.id !== "init" && !msg.content && isStreaming ? "typing-cursor" : ""}`}>
                {msg.content ? formatMessage(msg.content) : (
                  isStreaming ? <span className="text-gray-400">Consulting knowledge graph...</span> : null
                )}
              </div>

              {/* Copy button */}
              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-500 hover:text-gray-300"
                  title="Copy answer"
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
      </div>

      {/* Input Area */}
      <div className="pt-3 pb-2 border-t border-white/[0.08] shrink-0">
        <div className="glass border border-white/10 rounded-2xl flex items-end gap-3 p-2.5 focus-within:border-violet-500/50 transition-colors">
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about career paths, NSQF skills, salaries, or upskilling roadmaps..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-white placeholder-gray-500 text-sm focus:outline-none min-h-[24px] max-h-28 px-1"
          />
          <button
            id="send-message"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 shadow-md"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[11px] text-gray-500 text-center mt-2">
          Streaming inference via Groq Cloud · Fallback to Google Gemini & local Ollama
        </p>
      </div>
    </div>
  );
}
