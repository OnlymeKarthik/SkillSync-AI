import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Vidyavani — AI Career Intelligence Platform",
  description:
    "Bridge the gap between NSQF curricula and industry demand. Get AI-powered career roadmaps, skill gap analysis, and job market insights tailored for the Indian workforce.",
  keywords:
    "NSQF, skill gap analysis, career roadmap, AI career advisor, India jobs, government jobs, private sector",
  openGraph: {
    title: "Vidyavani — AI Career Intelligence Platform",
    description:
      "AI-powered career guidance bridging NSQF curriculum with real industry demand.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
