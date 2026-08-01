"use client";

import { Course, INITIAL_COURSES } from "@/data/courses";
import { createClient } from "@/utils/supabase/client";

const STORAGE_KEY = "durbar_courses_store_v3";
const EVENT_KEY = "durbar_courses_updated";

/**
 * Retrieves cached courses or falls back to empty array.
 */
export function getStoredCourses(): Course[] {
  if (typeof window === "undefined") return INITIAL_COURSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_COURSES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_COURSES;
  } catch (err) {
    return INITIAL_COURSES;
  }
}

/**
 * Updates in-memory/local cache and triggers real-time listeners.
 */
export function setStoredCourses(courses: Course[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (err) {
    console.error("Error setting stored courses", err);
  }
}

/**
 * Fetches all courses directly from Supabase Database.
 */
export async function fetchCoursesFromDatabase(): Promise<Course[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch courses error:", error);
      return getStoredCourses();
    }

    if (!data || data.length === 0) {
      setStoredCourses([]);
      return [];
    }

    const fetchedCourses: Course[] = data.map((item: any) => {
      let extraData: Partial<Course> = {};
      if (item.description) {
        try {
          if (item.description.startsWith("{")) {
            extraData = JSON.parse(item.description);
          }
        } catch (e) {}
      }

      return {
        id: item.slug || item.id,
        category: extraData.category || "defense",
        categoryLabel: extraData.categoryLabel || "ডিফেন্স ও মিলিটারি",
        title: item.title || extraData.title || "ডিফেন্স কোর্স",
        tagline: item.tagline || extraData.tagline || "",
        batchBadge: extraData.batchBadge || "",
        discountBadge: extraData.discountBadge,
        price: Number(item.price) || Number(extraData.price) || 0,
        originalPrice: Number(item.original_price) || Number(extraData.originalPrice) || Number(item.price) * 1.4,
        seatsRemaining: extraData.seatsRemaining || 20,
        totalSeats: extraData.totalSeats || 100,
        startDate: extraData.startDate || "১৫ আগস্ট, ২০২৬",
        duration: item.duration || extraData.duration || "৪ মাস",
        imageUrl: extraData.imageUrl || "https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=800&q=80",
        videoUrl: extraData.videoUrl,
        description: extraData.description || (item.description && !item.description.startsWith("{") ? item.description : ""),
        detailLayout: extraData.detailLayout || "standard",
        features: extraData.features || ["লাইভ ও ওএমআর এক্সাম", "পিডিএফ নোটস"],
        instructors: extraData.instructors || ["অভিজ্ঞ মেন্টর প্যানেল"],
        teacherEmails: extraData.teacherEmails || [],
        syllabus: Array.isArray(extraData.syllabus) ? extraData.syllabus : [],
        published: item.is_published ?? extraData.published ?? true,
      };
    });

    setStoredCourses(fetchedCourses);
    return fetchedCourses;
  } catch (err) {
    console.error("Error fetching courses from DB:", err);
    return getStoredCourses();
  }
}

export const syncCoursesFromSupabase = fetchCoursesFromDatabase;

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
 * Saves a course directly to Supabase Database.
 */
export async function saveCourse(courseData: Partial<Course> & { title: string; price: number }): Promise<Course> {
  const supabase = createClient();
  const courseId = courseData.id || courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const existingCourses = getStoredCourses();
  const existing = existingCourses.find((c) => c.id === courseId || (c as any).slug === courseId);

  const fullCourse: Course = {
    id: courseId,
    category: courseData.category !== undefined ? (courseData.category as any) : (existing?.category || "defense"),
    categoryLabel: courseData.categoryLabel !== undefined ? courseData.categoryLabel : (existing?.categoryLabel || "ডিফেন্স ও মিলিটারি"),
    title: courseData.title !== undefined ? courseData.title : (existing?.title || ""),
    tagline: courseData.tagline !== undefined ? courseData.tagline : (existing?.tagline || "প্রিমিয়াম ডিফেন্স ও মিলিটারি প্রোগ্রাম"),
    batchBadge: courseData.batchBadge !== undefined ? courseData.batchBadge : (existing?.batchBadge || ""),
    discountBadge: courseData.discountBadge !== undefined ? courseData.discountBadge : existing?.discountBadge,
    price: courseData.price !== undefined ? Number(courseData.price) : (existing?.price || 0),
    originalPrice: courseData.originalPrice !== undefined ? Number(courseData.originalPrice) : (existing?.originalPrice || Number(courseData.price || 0) * 1.4),
    seatsRemaining: courseData.seatsRemaining !== undefined ? Number(courseData.seatsRemaining) : (existing?.seatsRemaining || 25),
    totalSeats: courseData.totalSeats !== undefined ? Number(courseData.totalSeats) : (existing?.totalSeats || 100),
    startDate: courseData.startDate !== undefined ? courseData.startDate : (existing?.startDate || "১৫ আগস্ট, ২০২৬"),
    duration: courseData.duration !== undefined ? courseData.duration : (existing?.duration || "৪ মাস"),
    imageUrl: courseData.imageUrl !== undefined ? courseData.imageUrl : (existing?.imageUrl || "https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=800&q=80"),
    videoUrl: courseData.videoUrl !== undefined ? courseData.videoUrl : existing?.videoUrl,
    description: courseData.description !== undefined ? courseData.description : (existing?.description || ""),
    detailLayout: courseData.detailLayout !== undefined ? courseData.detailLayout : (existing?.detailLayout || "standard"),
    sections: courseData.sections !== undefined ? courseData.sections : (existing?.sections || []),
    features: courseData.features !== undefined ? courseData.features : (existing?.features || []),
    instructors: courseData.instructors !== undefined ? courseData.instructors : (existing?.instructors || ["অভিজ্ঞ মেন্টর প্যানেল"]),
    teacherEmails: courseData.teacherEmails !== undefined ? courseData.teacherEmails : (existing?.teacherEmails || []),
    syllabus: courseData.syllabus !== undefined ? courseData.syllabus : (existing?.syllabus || []),
    popular: courseData.popular !== undefined ? courseData.popular : (existing?.popular ?? false),
    published: courseData.published !== undefined ? courseData.published : (existing?.published ?? true),
  };

  let updatedList: Course[];
  const existingIdx = existingCourses.findIndex((c) => c.id === courseId || (c as any).slug === courseId);
  if (existingIdx >= 0) {
    updatedList = [...existingCourses];
    updatedList[existingIdx] = fullCourse;
  } else {
    updatedList = [fullCourse, ...existingCourses];
  }
  setStoredCourses(updatedList);

  // Direct Supabase DB Upsert using slug conflict resolution
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fullCourse.id);
    const payload: any = {
      slug: fullCourse.id,
      title: fullCourse.title,
      price: fullCourse.price,
      tagline: fullCourse.tagline,
      description: JSON.stringify(fullCourse),
      is_published: fullCourse.published ?? true,
      updated_at: new Date().toISOString(),
    };

    if (isUuid) {
      payload.id = fullCourse.id;
    }

    const { error } = await supabase.from("courses").upsert(payload, { onConflict: "slug" });

    if (error) {
      console.warn("Supabase course save info:", error.message || error.details || error);
    }
  } catch (supabaseErr) {
    console.warn("Supabase sync warning:", supabaseErr);
  }

  return fullCourse;
}

/**
 * Deletes a course directly from Supabase Database.
 */
export async function deleteCourseStore(courseId: string): Promise<void> {
  try {
    const supabase = createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);

    if (isUuid) {
      await supabase.from("courses").delete().eq("id", courseId);
    } else {
      await supabase.from("courses").delete().eq("slug", courseId);
    }
  } catch (err) {
    console.error("Supabase course delete error:", err);
  }

  // Update store cache immediately
  const remaining = getStoredCourses().filter((c) => c.id !== courseId && (c as any).slug !== courseId);
  setStoredCourses(remaining);
  await fetchCoursesFromDatabase();
}

/**
 * Resets store to INITIAL_COURSES in DB.
 */
export async function resetCoursesStore(): Promise<void> {
  for (const c of INITIAL_COURSES) {
    await saveCourse(c);
  }
}

/**
 * Subscribe to real-time store changes.
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
