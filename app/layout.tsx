import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/context/app-context";
import { BottomNav } from "@/components/bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PhraseChu", template: "%s · PhraseChu" },
  description: "Learn less. Say more. Turn useful expressions into active English.",
  applicationName: "PhraseChu",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PhraseChu" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <main className="app-shell">{children}<BottomNav /></main>
          <PwaRegister />
        </AppProvider>
      </body>
    </html>
  );
}
