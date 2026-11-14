import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nori Robotics",
  description: "Advanced autonomous systems for the physical world.",
  icons: {
    icon: [
      { url: "/mark.webp", type: "image/webp" },
      { url: "/favicon-mark.webp", type: "image/webp" },
    ],
    shortcut: ["/mark.webp"],
    apple: [
      { url: "/mark.webp" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
