import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vidyavani — Bridge the Skill Gap",
  description:
    "AI-powered career intelligence platform. Discover skill gaps between NSQF curricula and real industry demand. Get personalized roadmaps and find both private and government job opportunities.",
  keywords: ["NSQF", "skill gap", "career", "upskill", "India jobs", "government jobs"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-gray-950 text-gray-100 min-h-screen antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
