import { Geist, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-brand",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CityMind-AI | Next-Gen Municipal Dashboard",
  description: "Advanced Digital Twin Map and Citizen Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} ${jetbrainsMono.variable} dark`} data-theme="aurora" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
