import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vidyavani — Bridge the Skill Gap",
  description:
    "AI-powered career intelligence platform. Discover skill gaps between NSQF curricula and real industry demand. Get personalized roadmaps and find both private and government job opportunities.",
  keywords: ["NSQF", "skill gap", "career", "upskill", "India jobs", "government jobs", "Smart India Hackathon"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#030712] text-gray-100 min-h-screen flex flex-col antialiased bg-grid relative selection:bg-violet-500/30 selection:text-white noise-overlay`}>
        <div className="bg-glow-violet fixed inset-0 pointer-events-none z-0" />
        <Navbar />
        <main className="app-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
