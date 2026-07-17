import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/lib/locale";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Based Fishing Habitat Suitability Assessment",
  description:
    "Integrating satellite remote sensing, oceanographic data, climate reanalysis, explainable AI, and geospatial analytics for sustainable fisheries in the Gulf of Thailand and Andaman Sea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${ibmPlexSans.variable} ${notoSansThai.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={
        {
          "--font-sans": "var(--font-inter), var(--font-noto-sans-thai), sans-serif",
          "--font-heading": "var(--font-ibm-plex-sans), var(--font-noto-sans-thai), sans-serif",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
            <AuthProvider>
              <TooltipProvider>
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </TooltipProvider>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
