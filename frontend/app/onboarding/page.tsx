import type { Metadata } from "next";
import OnboardingContent from "./OnboardingContent";

export const metadata: Metadata = {
  title: "Upload Resume | Vidyavani",
  description: "Upload your resume and let AI extract your skills, analyse gaps, and recommend career paths tailored for you.",
};

export default function OnboardingPage() {
  return <OnboardingContent />;
}
