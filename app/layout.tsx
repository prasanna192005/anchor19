import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ContextMenuProvider } from "@/context/ContextMenuContext";
import { ContextMenu } from "@/components/ContextMenu";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ToastProvider } from "@/context/ToastContext";
import { LinkingProvider } from "@/context/LinkingContext";
import CommandPalette from "@/components/CommandPalette";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anchor19 | keeps everything grounded",
  description: "A minimalist, high-performance workspace for your links, tasks, and notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="font-sans min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <LinkingProvider>
                <ContextMenuProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                  <ContextMenu />
                  <CommandPalette />
                </ContextMenuProvider>
              </LinkingProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
