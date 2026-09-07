import type { Metadata } from "next";
import DiscoverContent from "./DiscoverContent";

export const metadata: Metadata = {
  title: "Discover Careers | Vidyavani",
  description: "Browse and filter careers by domain, difficulty, growth rate, and skills. Find your perfect career path.",
};

export default function DiscoverPage() {
  return <DiscoverContent />;
}
