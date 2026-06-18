import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "@/styles/globals.css";
import { SessionProvider } from "@/lib/auth/session";

const onest = Onest({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: "Het Leerinstituut",
  description: "Rolgestuurd platform voor observaties, rapportage en schoolgesprekken.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={onest.variable}>
      <body>
        <a href="#main" className="skip-link">
          Naar hoofdinhoud
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
