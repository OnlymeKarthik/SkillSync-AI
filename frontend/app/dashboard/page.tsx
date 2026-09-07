// Server Component — metadata lives here
import type { Metadata } from "next";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: "Skill Gap Dashboard | Vidyavani",
  description: "Real-time skill gap analysis comparing NSQF curriculum coverage against industry demand.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
