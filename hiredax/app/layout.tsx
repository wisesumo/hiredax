import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "../styles/design-system.css";
import "../styles/components.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HireDax — AI Estimator for Home Service Pros",
  description:
    "Dax answers your calls, sends a photo link, generates an estimate, and gets operator approval before quoting any price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
