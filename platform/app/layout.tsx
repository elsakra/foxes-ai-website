import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://foxes.ai"),
  title: "Free website build for local businesses — Foxes.ai",
  description:
    "We design and build your site before you commit. Hosting from $197/mo or take the code.",
  openGraph: {
    title: "Foxes.ai — Free website build",
    description:
      "Stunning local business sites in ~48 hours. Kickoff call within 1–2 hours of signing up.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
