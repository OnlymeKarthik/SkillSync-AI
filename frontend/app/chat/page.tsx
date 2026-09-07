import type { Metadata } from "next";
import ChatContent from "./ChatContent";

export const metadata: Metadata = {
  title: "AI Career Advisor | Vidyavani",
  description: "Chat with Vidyavani's AI career advisor. Get personalized career guidance, skill recommendations, and learning paths.",
};

export default function ChatPage() {
  return <ChatContent />;
}
