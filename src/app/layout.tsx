import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FocusFlow — Pomodoro Timer & Task Manager",
  description: "A beautiful focus timer combining Pomodoro technique with ambient sound mixing. Stay focused, track your sessions, and build your streak.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
