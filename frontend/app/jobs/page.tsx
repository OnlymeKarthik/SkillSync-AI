import type { Metadata } from "next";
import JobsContent from "./JobsContent";

export const metadata: Metadata = {
  title: "Job Board | Vidyavani",
  description: "Browse live private sector and government job postings aligned with your skill profile. Filter by type, location, and salary.",
};

export default function JobsPage() {
  return <JobsContent />;
}
