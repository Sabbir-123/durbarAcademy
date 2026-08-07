"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentTicketsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/courses#tickets");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex items-center justify-center p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-lg font-bold text-white">সহায়তা টিকিট ডেস্কে রিডাইরেক্ট করা হচ্ছে...</h1>
        <p className="text-xs text-slate-400">আপনার কোর্স পেজের ১-অন-১ মেন্টর হেল্পডেস্কে নিয়ে যাওয়া হচ্ছে।</p>
      </div>
    </div>
  );
}
