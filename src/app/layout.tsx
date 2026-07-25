import type { Metadata } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
  title: "দুর্বার একাডেমি | জ্ঞান • শৃঙ্খলা • সাফল্য | সেরা অ্যাডমিশন ও একাডেমি কোচিং",
  description:
    "বুয়েট, মেডিকেল ও ভার্সিটি কাইন্ড্রেড ভর্তি যুদ্ধে তোমার অপ্রতিরোধ্য সঙ্গী — দুর্বার একাডেমি। লাইভ ক্লাস, ডেইলি OMR পরীক্ষা, পার্সোনালাইজড ডাউট সলভ এবং সেরা মেন্টরদের সেরা দিকনির্দেশনা।",
  keywords: [
    "দুর্বার একাডেমি",
    "Durbar Academy",
    "BUET Admission Coaching",
    "Medical Admission Bangladesh",
    "Varsity Admission Prep",
    "HSC Coaching Bangladesh",
    "Bengali Educational Academy",
  ],
  authors: [{ name: "দুর্বার একাডেমি" }],
  openGraph: {
    title: "দুর্বার একাডেমি | জ্ঞান • শৃঙ্খলা • সাফল্য",
    description: "বুয়েট, মেডিকেল ও ভার্সিটি কাইন্ড্রেড ভর্তি যুদ্ধে তোমার অপ্রতিরোধ্য সঙ্গী।",
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
      className={`${hindSiliguri.variable} ${plusJakartaSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#07182E] text-white selection:bg-[#F59E0B] selection:text-black flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
