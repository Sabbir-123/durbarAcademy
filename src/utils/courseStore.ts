"use client";

import { Course, INITIAL_COURSES } from "@/data/courses";
import { createClient } from "@/utils/supabase/client";

const STORAGE_KEY = "durbar_courses_store_v3";
const EVENT_KEY = "durbar_courses_updated";

/**
 * Retrieves all courses from localStorage or falls back to INITIAL_COURSES.
 */
export function getStoredCourses(): Course[] {
  if (typeof window === "undefined") return INITIAL_COURSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_COURSES;
  } catch (err) {
    console.error("Error reading courses from localStorage", err);
    return INITIAL_COURSES;
  }
}

/**
 * Saves courses list to localStorage and triggers real-time event listener.
 */
export function setStoredCourses(courses: Course[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (err) {
    console.error("Error saving courses to localStorage", err);
  }
}

/**
 * Gets a single course by ID or slug.
 */
export function getCourseById(idOrSlug: string): Course | undefined {
  const courses = getStoredCourses();
  return courses.find(
    (c) => c.id === idOrSlug || c.id.toLowerCase() === idOrSlug.toLowerCase()
  );
}

/**
 * Adds or Updates a course in the local store and syncs with Supabase if online.
 */
export async function saveCourse(courseData: Partial<Course> & { title: string; price: number }): Promise<Course> {
  const existingCourses = getStoredCourses();
  
  const courseId = courseData.id || courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  const existingIndex = existingCourses.findIndex((c) => c.id === courseId);

  const fullCourse: Course = {
    id: courseId,
    category: (courseData.category as any) || "defense",
    categoryLabel: courseData.categoryLabel || "ডিফেন্স ও মিলিটারি",
    title: courseData.title,
    tagline: courseData.tagline || "প্রিমিয়াম ডিফেন্স ও মিলিটারি প্রোগ্রাম",
    batchBadge: courseData.batchBadge || "",
    discountBadge: courseData.discountBadge,
    price: Number(courseData.price) || 0,
    originalPrice: Number(courseData.originalPrice) || Number(courseData.price) * 1.4,
    seatsRemaining: Number(courseData.seatsRemaining) || 25,
    totalSeats: Number(courseData.totalSeats) || 100,
    startDate: courseData.startDate || "১৫ আগস্ট, ২০২৬",
    duration: courseData.duration || "৪ মাস",
    imageUrl: courseData.imageUrl || "https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=800&q=80",
    videoUrl: courseData.videoUrl,
    description: courseData.description || "এই কোর্সের মাধ্যমে শিক্ষার্থীরা বিষয়ভিত্তিক নিখুঁত প্রস্তুতি নিশ্চিত করতে পারবে।",
    detailLayout: courseData.detailLayout || "standard",
    sections: courseData.sections || [
      {
        id: "s_overview",
        type: "overview",
        title: "কোর্স পরিচিতি",
        content: courseData.description || "কোর্সের বিস্তারিত তথ্য শিগগিরই হালনাগাদ করা হবে।"
      }
    ],
    features: courseData.features && courseData.features.length > 0 ? courseData.features : [
      "দৈনিক ওএমআর ও সিবিটি এক্সাম",
      "১-অন-১ মেন্টরশিপ ও ডাউট ক্লিয়ারিং",
      "পিডিএফ নোটস ও প্র্যাকটিস শিট"
    ],
    instructors: courseData.instructors && courseData.instructors.length > 0 ? courseData.instructors : ["অভিজ্ঞ মেন্টর প্যানেল"],
    teacherEmails: courseData.teacherEmails || (existingIndex >= 0 ? existingCourses[existingIndex].teacherEmails || [] : []),
    syllabus: courseData.syllabus && courseData.syllabus.length > 0 ? courseData.syllabus : [
      { title: "সম্পূর্ণ কোর্স বিষয়ভিত্তিক কভারেজ", lectures: 30, exams: 15 }
    ],
    popular: courseData.popular ?? false,
    published: courseData.published ?? true,
  };

  let updatedList: Course[];
  if (existingIndex >= 0) {
    updatedList = [...existingCourses];
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...fullCourse };
  } else {
    updatedList = [fullCourse, ...existingCourses];
  }

  setStoredCourses(updatedList);

  // Sync to Supabase in background if client is ready
  try {
    const supabase = createClient();
    await supabase.from("courses").upsert({
      id: fullCourse.id,
      title: fullCourse.title,
      price: fullCourse.price,
      slug: fullCourse.id,
      is_published: fullCourse.published ?? true
    });
  } catch (supabaseErr) {
    console.warn("Supabase sync warning (will rely on local storage):", supabaseErr);
  }

  return fullCourse;
}

/**
 * Deletes a course from local store and Supabase.
 */
export async function deleteCourseStore(courseId: string): Promise<void> {
  const existingCourses = getStoredCourses();
  const filtered = existingCourses.filter((c) => c.id !== courseId);
  setStoredCourses(filtered);

  try {
    const supabase = createClient();
    await supabase.from("courses").delete().eq("id", courseId);
  } catch (err) {
    console.warn("Supabase course delete warning:", err);
  }
}

/**
 * Resets local store to INITIAL_COURSES.
 */
export function resetCoursesStore(): void {
  setStoredCourses(INITIAL_COURSES);
}

/**
 * Subscribe to store changes.
 */
export function subscribeCoursesStore(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_KEY, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_KEY, callback);
    window.removeEventListener("storage", callback);
  };
}
