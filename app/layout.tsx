import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react"; // Import SessionProvider
import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

import { Mulish } from "next/font/google";

//👇 Configure our font object
const openSans = Mulish({
  subsets: ["latin"],
  display: "swap",
}); 

export const metadata: Metadata = {
  metadataBase: new URL("https://affortable.ai"), // https://chat.vercel.ai
  title: "Affortable AI",
  description:
    "No more pricey subscriptions! Access GPT-4o, o1, and more for just $1. Pay per message, no credit expiry. All-in-one chat AI to supercharge your productivity.",
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)"; 
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={openSans.className}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/images/logo/favicon.png" />
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ADS_ID}`}
        />
        <Script id="google-ads">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.GOOGLE_ADS_ID}');
          `}
        </Script>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
        />
        <Script id="google-analytics">
          {`
           window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <SessionProvider> {/* Wrap the app with SessionProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            {children} {/* Your children content goes here */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
