import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
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
  title: "CityMind AI — Sustainable Smart City Intelligence & Digital Twin",
  description: "Predictive municipal intelligence, real-time digital twin simulations, and civic ecosystem orchestration for future-ready sustainable cities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
