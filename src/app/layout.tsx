import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "@/styles/globals.css";
import { SessionProvider } from "@/lib/auth/session";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { themeInitScript } from "@/lib/theme";

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
    <html lang="nl" className={onest.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Naar hoofdinhoud
        </a>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
