export interface SyllabusChapter {
  title: string;
  lectures: number;
  exams: number;
}

export interface CourseSection {
  id: string;
  type: "overview" | "features" | "syllabus" | "instructors" | "video" | "custom_text" | "faq";
  title: string;
  content?: string;
  items?: string[];
}

export interface Course {
  id: string;
  category: "defense" | "hsc" | "bcs";
  categoryLabel: string;
  title: string;
  tagline: string;
  batchBadge?: string;
  discountBadge?: string;
  price: number;
  originalPrice: number;
  seatsRemaining: number;
  totalSeats: number;
  startDate: string;
  duration: string;
  imageUrl?: string;
  videoUrl?: string; // Optional preview video (YouTube, Vimeo, MP4)
  description?: string; // Detailed course overview
  detailLayout?: "standard" | "video_hero" | "modern_split"; // Customizable layout format
  courseMode?: "online" | "offline" | "both"; // Course delivery mode
  sections?: CourseSection[];
  features: string[];
  instructors: string[];
  teacherEmails?: string[]; // Array of assigned teacher account emails
  syllabus: SyllabusChapter[];
  popular?: boolean;
  published?: boolean;
}

export const INITIAL_COURSES: Course[] = [
  {
    id: "bafa-preliminary-course",
    category: "defense",
    categoryLabel: "ডিফেন্স ও মিলিটারি",
    title: "BAFA Preliminary Course",
    tagline: "বাংলাদেশ বিমান বাহিনী অফিসার ক্যাডেট লিখিত ও প্রিলিমিনারি মেধা পরীক্ষা প্রিপারেশন",
    discountBadge: "৪০% ছাড়",
    courseMode: "both",
    price: 8500,
    originalPrice: 14000,
    seatsRemaining: 15,
    totalSeats: 100,
    startDate: "১০ আগস্ট, ২০২৬",
    duration: "৪ মাস (পরীক্ষার আগের দিন পর্যন্ত)",
    imageUrl: "https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    description: "বাংলাদেশ বিমান বাহিনীর (BAFA) অফিসার ক্যাডেট পদে যোগদানের জন্য পদার্থবিজ্ঞান, গণিত, ইংরেজি ও আইকিউ পরীক্ষার শতভাগ নিখুঁত প্রস্তুতি নিয়ে তৈরি বিশেষ কোর্স। এতে রয়েছে প্রতিদিনের স্পেশাল ওএমআর এক্সাম এবং সাইকোলজিক্যাল টিপস।",
    detailLayout: "video_hero",
    popular: true,
    published: true,
    features: [
      "পদার্থবিজ্ঞান ও উচ্চতর গণিত শর্টকাট টেকনিক ক্লাস",
      "আইকিউ (Non-Verbal & Verbal) এবং সার্ভিস রুলস ড্রিল",
      "প্রিন্টেড বিএএফএ স্পেশাল প্রিপারেশন বুকলেট",
      "সাপ্তাহিক রিয়েল-টাইম বিএএফএ মডেল টেস্ট",
      "সাবেক বিমান বাহিনী অফিসারদের ডাইরেক্ট গাইডেন্স",
    ],
    instructors: ["স্কোয়াড্রন লিডার (অব.) মোস্তফা আহমেদ", "ইঞ্জি. তাসনিম আহমেদ (বুয়েট)"],
    syllabus: [
      { title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র (বিএএফএ স্ট্যান্ডার্ড লিখিত)", lectures: 25, exams: 12 },
      { title: "উচ্চতর গণিত ও আইকিউ শর্টকাট টেস্ট", lectures: 25, exams: 12 },
      { title: "ইংরেজি গ্রামার, কম্পোজিশন ও ভাইভা অরিয়েন্টেশন", lectures: 20, exams: 10 },
    ],
    sections: [
      {
        id: "s1",
        type: "overview",
        title: "কোর্স ওভারভিউ",
        content: "বিমান বাহিনী অফিসার ক্যাডেট পরীক্ষায় সফল হতে লিখিত পরীক্ষা ও প্রাথমিক মেডিকেলে সর্বোচ্চ প্রস্তুতি জরুরি। আমাদের এই কোর্সে পদার্থ ও গণিতের গভীরে সমাধান দেওয়ার পাশাপাশি আইকিউ পরীক্ষায় দ্রুত উত্তর দেওয়ার কৌশল শেখানো হয়।"
      },
      {
        id: "s2",
        type: "features",
        title: "বিশেষ সুবিধাসমূহ",
        items: [
          "প্রতিটি লাইভ ক্লাসের রেকর্ডেড ভিডিও ফুল এইচডি কোয়ালিটিতে",
          "দৈনিক OMR এক্সাম এবং তাৎক্ষণিক রেজাল্ট উইথ র‍্যাঙ্ক",
          "ডিফেন্স অফিসারদের বিশেষ ভাইভা ও পার্সোনালিটি সেশন"
        ]
      }
    ]
  },
  {
    id: "bma-preliminary-course",
    category: "defense",
    categoryLabel: "ডিফেন্স ও মিলিটারি",
    title: "BMA Preliminary Course",
    tagline: "বাংলাদেশ মিলিটারি একাডেমি দীর্ঘমেয়াদী কোর্স প্রিলিমিনারি ও লিখিত প্রস্তুতি",
    discountBadge: "৩৫% ছাড়",
    price: 8900,
    originalPrice: 13500,
    seatsRemaining: 20,
    totalSeats: 120,
    startDate: "১৫ আগস্ট, ২০২৬",
    duration: "৪.৫ মাস",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    description: "বিএমএ দীর্ঘমেয়াদী কোর্সের প্রিলিমিনারি লিখিত পরীক্ষা (বাংলা, ইংরেজি, সাধারণ গণিত ও সাধারণ জ্ঞান) এবং প্রাথমিক স্বাস্থ্য পরীক্ষার প্রস্তুতির পূর্ণাঙ্গ দিকনির্দেশনা।",
    detailLayout: "standard",
    popular: true,
    published: true,
    features: [
      "বিএমএ স্ট্যান্ডার্ড লিখিত পরীক্ষার চার বিষয়ভিত্তিক কভারেজ",
      "আইকিউ এবং সাধারণ জ্ঞান সাম্প্রতিক তথ্য কভারেজ",
      "মিলিটারি ফিটনেস ও স্বাস্থ্যবিধি গাইডেন্স",
      "৫০+ ডেইলি ও সাপ্তাহিক মডেল টেস্ট",
    ],
    instructors: ["মেজর (অব.) সাজ্জাদ হোসেন", "মেহেদী হাসান (ঢাবি)"],
    syllabus: [
      { title: "সাধারণ গণিত ও বীজগণিত শর্টকাট", lectures: 20, exams: 10 },
      { title: "ইংরেজি ভাষা ও ব্যাকরণ রিটেন মাস্টারি", lectures: 25, exams: 12 },
      { title: "সাধারণ জ্ঞান ও সাম্প্রতিক আন্তর্জাতিক বিষয়াবলী", lectures: 20, exams: 10 },
    ],
  },
  {
    id: "bn-preliminary-course",
    category: "defense",
    categoryLabel: "ডিফেন্স ও মিলিটারি",
    title: "BN Preliminary Course",
    tagline: "বাংলাদেশ নৌবাহিনী অফিসার ক্যাডেট লিখিত ও মেধা পরীক্ষা মাস্টারক্লাস",
    discountBadge: "৩০% ছাড়",
    price: 8200,
    originalPrice: 12000,
    seatsRemaining: 18,
    totalSeats: 90,
    startDate: "১২ আগস্ট, ২০২৬",
    duration: "৪ মাস",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    description: "বাংলাদেশ নৌবাহিনীতে নেভাল অফিসার ক্যাডেট পদের জন্য গণিত, পদার্থবিজ্ঞান, ইংরেজি ও আইকিউ পরীক্ষার শতভাগ কার্যকরী গাইডলাইন।",
    detailLayout: "modern_split",
    popular: false,
    published: true,
    features: [
      "পদার্থ ও গণিতের টপিকভিত্তিক গাণিতিক সমাধান",
      "আইকিউ টেস্ট স্পিড আপ ড্রিলস",
      "নেভাল মেডিকেল ও ভাইভা বিশেষ টিপস",
      "সাপ্তাহিক রিয়েল-টাইম অনলাইন টেস্ট",
    ],
    instructors: ["লেফটেন্যান্ট কমান্ডার (অব.) তারেক রহমান", "ইঞ্জি. তানভীর হাসান (বুয়েট)"],
    syllabus: [
      { title: "পদার্থবিজ্ঞান ও নৌবাহিনী স্পেশাল রিটেন", lectures: 22, exams: 10 },
      { title: "উচ্চতর গণিত ও শর্টকাট লজিক", lectures: 22, exams: 10 },
      { title: "ইংরেজি ও মনস্তাত্ত্বিক কুইজ", lectures: 18, exams: 8 },
    ],
  },
  {
    id: "issb-course",
    category: "defense",
    categoryLabel: "ডিফেন্স ও মিলিটারি",
    title: "ISSB Course",
    tagline: "আইএসএসবি ৪ দিনের সাইকোলজিক্যাল, জিটিও ও ভাইভা সম্পূর্ণ মাস্টার প্রোগ্রাম",
    discountBadge: "৪৫% ছাড়",
    price: 10500,
    originalPrice: 19000,
    seatsRemaining: 12,
    totalSeats: 60,
    startDate: "১৮ আগস্ট, ২০২৬",
    duration: "২ মাস (নিবিড় প্রশিক্ষণ)",
    imageUrl: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    description: "আইএসএসবি (Inter Services Selection Board) পরীক্ষায় গ্রীন কার্ড অর্জনের লক্ষ্যে সাইকোলজি টেস্ট (TAT, WAT, SRT), GTO টাস্ক (Group Discussion, Lecturette, PGT, HGT) এবং ভাইভার রিয়েল-লাইফ সিমুলেশন ট্রেনিং।",
    detailLayout: "video_hero",
    popular: true,
    published: true,
    features: [
      "সাইকোলজিস্ট অফিসার দ্বারা স্ক্রিনিং ও পিকচার পারসেপশন গ্রোথ",
      "জিটিও (GTO) আউটডোর ও ইনডোর টাস্ক রিয়েল স্ট্র্যাটেজি",
      "ডেপথ পার্সোনাল ভাইভা মক সেশন উইথ ফিডব্যাক",
      "লিডারশিপ ও বডি ল্যাঙ্গুয়েজ ডেভেলপমেন্ট",
    ],
    instructors: ["লেফটেন্যান্ট কর্নেল (অব.) সাইফ উল্লাহ", "সাইকোলজিস্ট ড. তানজিন আহমেদ"],
    syllabus: [
      { title: "ডে ১: স্ক্রিনিং, PPDT ও সাইকোলজিক্যাল টেস্ট (TAT, WAT, SRT)", lectures: 15, exams: 8 },
      { title: "ডে ২ ও ৩: GTO টাস্ক, গ্রুপ ডিসকাশন, PGT ও ইন্ডিভিজুয়াল অবস্ট্যাকল", lectures: 20, exams: 10 },
      { title: "ডে ৪: প্রেসিডেন্সিয়াল ভাইভা ও ফাইনাল কনফারেন্স কৌশল", lectures: 10, exams: 5 },
    ],
  },
  {
    id: "issb-rapid-course",
    category: "defense",
    categoryLabel: "ডিফেন্স ও মিলিটারি",
    title: "ISSB Rapid Course",
    tagline: "স্বল্প সময়ে আইএসএসবি পরীক্ষায় নিজেকে প্রস্তুত করার ২ সপ্তাহের র‍্যাপিড বুটক্যাম্প",
    discountBadge: "৫০% ছাড়",
    price: 6500,
    originalPrice: 13000,
    seatsRemaining: 8,
    totalSeats: 40,
    startDate: "০৫ আগস্ট, ২০২৬",
    duration: "২ সপ্তাহ (ইনটেনসিভ)",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    description: "যাদের আইএসএসবি পরীক্ষার ডেট চলে এসেছে তাদের জন্য ২ সপ্তাহের জরুরি প্রস্তুতি কোর্স। এতে TAT, WAT, SRT প্র্যাকটিস বুক এবং ১-অন-১ সাইকোলজিক্যাল ফিডব্যাক দেওয়া হয়।",
    detailLayout: "modern_split",
    popular: false,
    published: true,
    features: [
      "জরুরি সাইকোলজিক্যাল পেপার রিভিউ",
      "মক জিটিও গাইডলাইন ও কুইক টিপস",
      "১-অন-১ ভাইভা ফিডব্যাক সেশন",
      "আইএসএসবি ডাইরেক্ট হ্যান্ডবুক পিডিএফ",
    ],
    instructors: ["মেজর (অব.) সাজ্জাদ হোসেন", "সাইকোলজিস্ট ড. তানজিন আহমেদ"],
    syllabus: [
      { title: "সাইকোলজিক্যাল ফাস্ট ট্র্যাক প্র্যাকটিস", lectures: 8, exams: 4 },
      { title: "জিটিও ও ভাইভা হাইলাইটস সেশন", lectures: 8, exams: 4 },
    ],
  },
];

export const COURSES: Course[] = INITIAL_COURSES;
