import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

// Using a fallback monospace font for pixel operator
const pixelOperator = {
  variable: "--font-pixel-operator",
};

export const metadata: Metadata = {
  title: "Heroes of Horizon - Guild War Tracker",
  description:
    "Track and analyze your guild's performance in Heroes of Horizon guild wars. Monitor win rates, daily stats, and weekly comparisons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${pixelOperator.variable} antialiased bg-[#0D0D0D] text-gold`}>
        {children}
      </body>
    </html>
  );
}
