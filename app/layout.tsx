import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Sports Simulator",
  description: "A simple multi-sport match simulator MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
