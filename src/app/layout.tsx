import type { Metadata } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import MotionGraphicsCanvas from "@/components/MotionGraphicsCanvas";
import FloatingThemeToggler from "@/components/FloatingThemeToggler";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-english",
  display: "swap",
});

export const metadata: Metadata = {
  title: "দুর্বার একাডেমি | জ্ঞান • শৃঙ্খলা • সাফল্য | সেরা ডিফেন্স ও মিলিটারি কোচিং",
  description:
    "বাংলাদেশ বিমান বাহিনী, নৌবাহিনী, সেনাবাহিনী (BAFA, BMA, BN, ISSB) ভর্তি পরীক্ষায় তোমার অপ্রতিরোধ্য সঙ্গী — দুর্বার একাডেমি। লাইভ ক্লাস, ডেইলি OMR পরীক্ষা, পার্সোনালাইজড ডাউট সলভ এবং সাবেক ডিফেন্স অফিসার মেন্টরদের দিকনির্দেশনা।",
  keywords: [
    "দুর্বার একাডেমি",
    "Durbar Academy",
    "BAFA Preliminary Course",
    "BMA Preliminary Course",
    "BN Preliminary Course",
    "ISSB Course",
    "ISSB Rapid Course",
    "Defense Officer Coaching Bangladesh",
  ],
  authors: [{ name: "দুর্বার একাডেমি" }],
  openGraph: {
    title: "দুর্বার একাডেমি | জ্ঞান • শৃঙ্খলা • সাফল্য",
    description: "ডিফেন্স ও মিলিটারি ভর্তি পরীক্ষায় তোমার অপ্রতিরোধ্য সঙ্গী।",
    siteName: "দুর্বার একাডেমি",
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${hindSiliguri.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-[#07182E] text-white selection:bg-[#F59E0B] selection:text-black flex flex-col font-sans relative">
        <MotionGraphicsCanvas />
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
        <FloatingThemeToggler />
      </body>
    </html>
  );
}
