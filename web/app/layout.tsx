import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusClarity",
  description:
    "CampusClarity helps future students understand their professors based on reviews from actual students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} w-screen min-h-screen overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
