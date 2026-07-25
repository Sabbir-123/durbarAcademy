export interface Instructor {
  id: string;
  name: string;
  institution: string;
  department: string;
  experience: string;
  subject: string;
  quote: string;
  rating: number;
  studentsTaught: string;
  badge: string;
}

export const INSTRUCTORS: Instructor[] = [
  {
    id: "tasnim-buet",
    name: "ইঞ্জি. তাসনিম আহমেদ",
    institution: "বুয়েট (BUET)",
    department: "কম্পিউটার সায়েন্স এন্ড ইঞ্জিনিয়ারিং (CSE)",
    experience: "৮+ বছর",
    subject: "উচ্চতর গণিত ও পদার্থবিজ্ঞান",
    quote: "কঠিন ম্যাথ সমাধান করা কঠিন নয়, যদি বেসিক ধারণা পরিষ্কার থাকে। দুর্বারে আমরা শর্টকাটের চেয়ে কনসেপ্টে জোর দিই।",
    rating: 4.9,
    studentsTaught: "২৫,০০০+",
    badge: "BUET Merit Rank #14",
  },
  {
    id: "sabbir-dmc",
    name: "ড্যা. সাব্বির আহমেদ",
    institution: "ঢাকা মেডিকেল কলেজ (DMC)",
    department: "এমবিবিএস (MBBS)",
    experience: "৭+ বছর",
    subject: "উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান",
    quote: "মেডিকেল ভর্তি পরীক্ষায় সাফল্য আসে নিয়মিত প্র্যাকটিস ও ওএমআর রিভিশনের মাধ্যমে। প্রতিটি তথ্যকে আত্মস্থ করো।",
    rating: 4.9,
    studentsTaught: "২০,০০০+",
    badge: "Medical Admission Merit #03",
  },
  {
    id: "mehedi-du",
    name: "মেহেদী হাসান",
    institution: "ঢাকা বিশ্ববিদ্যালয় (DU)",
    department: "পদার্থবিজ্ঞান বিভাগ",
    experience: "৬+ বছর",
    subject: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র",
    quote: "ফিজিক্সের সূত্র মুখস্থ করে লাভ নেই, বাস্তব উদাহরণের সাথে ইকুয়েশনগুলো মেলাতে শিখলে অ্যাডমিশন জয় করা সম্ভব।",
    rating: 4.8,
    studentsTaught: "১৮,০০০+",
    badge: "DU A-Unit Rank #08",
  },
  {
    id: "tanveer-buet",
    name: "ইঞ্জি. তানভীর হাসান",
    institution: "বুয়েট (BUET)",
    department: "ইলেকট্রিক্যাল এন্ড ইলেকট্রনিক্স (EEE)",
    experience: "৫+ বছর",
    subject: "রসায়ন (অর্গানিক ও ফিজিক্যাল)",
    quote: "অর্গানিক কেমিস্ট্রির বিক্রিয়াগুলো ভয় পাওয়ার কিছু নেই। প্রতিটি রিঅ্যাকশনের পেছনের মেকানিজম আমরা ভিজ্যুয়ালি শিখাই।",
    rating: 4.9,
    studentsTaught: "১৫,০০০+",
    badge: "BUET Merit Rank #29",
  },
];
