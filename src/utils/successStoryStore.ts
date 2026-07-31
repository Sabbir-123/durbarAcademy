import { StudentSuccess, INITIAL_SUCCESS_STORIES } from "@/data/testimonials";
import { createClient } from "./supabase/client";

const STORE_KEY = "durbar_success_stories_store_v1";
const EVENT_NAME = "durbar_success_stories_updated";

export function getStoredSuccessStories(): StudentSuccess[] {
  if (typeof window === "undefined") return INITIAL_SUCCESS_STORIES;

  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(INITIAL_SUCCESS_STORIES));
      return INITIAL_SUCCESS_STORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUCCESS_STORIES;
  } catch (err) {
    console.error("Failed to load stored success stories:", err);
    return INITIAL_SUCCESS_STORIES;
  }
}

export function notifySuccessStoriesChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export function subscribeSuccessStoriesStore(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}

export async function saveSuccessStory(story: Partial<StudentSuccess>): Promise<StudentSuccess> {
  const current = getStoredSuccessStories();

  let updatedStory: StudentSuccess;
  let nextList: StudentSuccess[];

  if (story.id) {
    const existing = current.find((item) => item.id === story.id) || {
      id: story.id,
      name: "কৃতি শিক্ষার্থী",
      rank: "মেধা স্থান",
      institution: "ডিফেন্স ক্যাডেট",
      program: "প্রোগ্রাম",
      hscCollege: "কলেজ",
      quote: "উক্তি",
      score: "মার্কস",
      badgeColor: "gold",
    };
    updatedStory = { ...existing, ...story } as StudentSuccess;
    nextList = current.map((item) => (item.id === story.id ? updatedStory : item));
  } else {
    const newId = "story-" + Date.now();
    updatedStory = {
      id: newId,
      name: story.name || "নতুন কৃতি শিক্ষার্থী",
      rank: story.rank || "মেধা স্থান: সিলেক্টেড",
      institution: story.institution || "ডিফেন্স ও মিলিটারি ক্যাডেট",
      category: story.category || ("defense" as any),
      program: story.program || "ডিফেন্স অফিসিয়াল প্রোগ্রাম",
      hscCollege: story.hscCollege || "নামকরা কলেজ",
      quote: story.quote || "দুর্বার একাডেমির মেন্টরিং ও গাইডলাইন অসাধারণ!",
      score: story.score || "মার্কস: সিলেক্টেড",
      badgeColor: story.badgeColor || "gold",
      imageUrl: story.imageUrl || "",
      published: story.published !== undefined ? story.published : true,
    };
    nextList = [updatedStory, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORE_KEY, JSON.stringify(nextList));
    notifySuccessStoriesChange();
  }

  // Background Supabase Sync
  try {
    const supabase = createClient();
    await supabase.from("success_stories").upsert([
      {
        id: updatedStory.id,
        name: updatedStory.name,
        rank: updatedStory.rank,
        institution: updatedStory.institution,
        category: updatedStory.category,
        program: updatedStory.program,
        hsc_college: updatedStory.hscCollege,
        quote: updatedStory.quote,
        score: updatedStory.score,
        badge_color: updatedStory.badgeColor,
        image_url: updatedStory.imageUrl,
        published: updatedStory.published,
      },
    ]);
  } catch (supabaseErr) {
    console.log("Supabase success_stories sync skipped:", supabaseErr);
  }

  return updatedStory;
}

export async function deleteSuccessStory(id: string): Promise<boolean> {
  const current = getStoredSuccessStories();
  const nextList = current.filter((item) => item.id !== id);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORE_KEY, JSON.stringify(nextList));
    notifySuccessStoriesChange();
  }

  try {
    const supabase = createClient();
    await supabase.from("success_stories").delete().eq("id", id);
  } catch (err) {
    console.log("Supabase success_stories delete skipped:", err);
  }

  return true;
}
