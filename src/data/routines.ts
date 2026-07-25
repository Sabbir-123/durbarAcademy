export interface RoutineItem {
  id: string;
  program: "engineering" | "medical" | "varsity" | "hsc";
  date: string;
  day: string;
  subject: string;
  topic: string;
  type: "Live Class" | "OMR Exam" | "Doubt Solve" | "Grand Test";
  time: string;
  instructor: string;
  roomLink?: string;
  pdfSyllabus?: string;
}

export const ROUTINES: RoutineItem[] = [
  {
    id: "r1",
    program: "engineering",
    date: "২৭ জুলাই, ২০২৬",
    day: "রবিবার",
    subject: "উচ্চতর গণিত ১ম পত্র",
    topic: "ক্যালকুলাস: অন্তরীকরণ ও এর প্রয়োগ (স্পেশাল ট্রিকস)",
    type: "Live Class",
    time: "সন্ধ্যা ০৭:৩০ মি.",
    instructor: "ইঞ্জি. তাসনিম আহমেদ",
  },
  {
    id: "r2",
    program: "engineering",
    date: "২৮ জুলাই, ২০২৬",
    day: "সোমবার",
    subject: "উচ্চতর গণিত",
    topic: "ক্যালকুলাস ও ভেক্টর ডেইলি OMR পরীক্ষা (৫০ মার্কস)",
    type: "OMR Exam",
    time: "বিকাল ০৫:০০ মি. - রাত ১০:০০ মি.",
    instructor: "অটোমেটেড ওএমআর সিস্টেম",
  },
  {
    id: "r3",
    program: "medical",
    date: "২৭ জুলাই, ২০২৬",
    day: "রবিবার",
    subject: "প্রাণিবিজ্ঞান",
    topic: "মানব শারীরতত্ত্ব: রক্ত ও সংবহন (মেডিকেল স্পেশাল)",
    type: "Live Class",
    time: "রাত ০৯:০০ মি.",
    instructor: "ড্যা. সাব্বির আহমেদ",
  },
  {
    id: "r4",
    program: "medical",
    date: "২৯ জুলাই, ২০২৬",
    day: "মঙ্গলবার",
    subject: "রসায়ন ১ম পত্র",
    topic: "গুণগত রসায়ন ও দ্রাব্যতা মেগা কুইজ",
    type: "Grand Test",
    time: "রাত ০৮:০০ মি.",
    instructor: "মেডিকেল এক্সাম বোর্ড",
  },
  {
    id: "r5",
    program: "varsity",
    date: "২৮ জুলাই, ২০২৬",
    day: "সোমবার",
    subject: "পদার্থবিজ্ঞান",
    topic: "নিউটনীয় বলবিদ্যা ও কাজ শক্তি ক্ষমতা",
    type: "Live Class",
    time: "সন্ধ্যা ০৭:৩০ মি.",
    instructor: "মেহেদী হাসান",
  },
  {
    id: "r6",
    program: "hsc",
    date: "৩০ জুলাই, ২০২৬",
    day: "বৃহস্পতিবার",
    subject: "রসায়ন ২য় পত্র",
    topic: "পরিবেশ রসায়ন ও গাণিতিক সমীকরণ",
    type: "Live Class",
    time: "বিকাল ০৪:৩০ মি.",
    instructor: "ইঞ্জি. তানভীর হাসান",
  },
];
