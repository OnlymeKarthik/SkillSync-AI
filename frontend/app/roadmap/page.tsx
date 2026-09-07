import type { Metadata } from "next";
import RoadmapContent from "./RoadmapContent";

export const metadata: Metadata = {
  title: "AI Roadmap Generator | Vidyavani",
  description: "Generate a personalized multi-stage learning roadmap powered by AI. Free and paid resource tracks included.",
};

export default function RoadmapPage() {
  return <RoadmapContent />;
}
