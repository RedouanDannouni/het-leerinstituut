import type { Metadata } from "next";
import "@/styles/globals.css";
import { SessionProvider } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Het Leerinstituut",
  description: "Rolgestuurd platform voor observaties, rapportage en schoolgesprekken.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        <a href="#main" className="skip-link">
          Naar hoofdinhoud
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
