import type { Metadata } from "next";
import GraphContent from "./GraphContent";

export const metadata: Metadata = {
  title: "Knowledge Graph Explorer | Vidyavani",
  description: "Interactive Neo4j knowledge graph visualizing skill ontologies, prerequisites, and NSQF curricula coverage.",
};

export default function GraphPage() {
  return <GraphContent />;
}
