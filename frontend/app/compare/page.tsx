import type { Metadata } from "next";
import CompareContent from "./CompareContent";

export const metadata: Metadata = {
  title: "Compare Careers | Vidyavani",
  description: "Side-by-side career comparison. Compare salaries, growth rates, skills required, and job market demand.",
};

export default function ComparePage() {
  return <CompareContent />;
}
