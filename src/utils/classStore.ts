// ─────────────────────────────────────────────────────────────────────────────
// Durbar Academy — Class Content Store
// Provides localStorage CRUD for: Batch, Milestone, Module, Class, TestItem
// ─────────────────────────────────────────────────────────────────────────────

export interface TestItem {
  id: string;
  type: "mcq" | "true_false";
  question: string;
  options?: string[]; // MCQ only (4 options)
  correctAnswer: string; // MCQ: option text | true_false: "true" | "false"
}

export interface ClassLesson {
  id: string;
  moduleId: string;
  milestoneId: string;
  batchId?: string;
  courseId?: string;
  title: string;
  description: string;
  youtubeUrl: string; // unlisted YouTube URL or embed URL
  youtubeVideoId?: string;
  isPublished?: boolean;
  durationMin: number;
  order: number;
  tests: TestItem[];
  createdAt: string;
}

// ── YouTube Video ID Extractor & Embed URL Converter ─────────────────────────
export function extractYouTubeVideoId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];

  return "";
}

export function toYouTubeEmbedUrl(urlOrId: string): string {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  return urlOrId || "";
}

export interface CourseModule {
  id: string;
  milestoneId: string;
  batchId?: string;
  courseId?: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  batchId?: string;
  courseId?: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

export interface Batch {
  id: string;
  courseId?: string;
  title: string;
  description: string;
  startDate: string;
  status: "active" | "upcoming" | "ended";
  createdAt: string;
}

// ── Storage Keys ──────────────────────────────────────────────────────────────
const KEYS = {
  batches: "durbar_batches_v1",
  milestones: "durbar_milestones_v1",
  modules: "durbar_modules_v1",
  classes: "durbar_classes_v1",
};

const EVENT = "durbar_class_store_updated";

function dispatch() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(EVENT));
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
  dispatch();
}

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── BATCHES ───────────────────────────────────────────────────────────────────
export function getBatches(courseId?: string): Batch[] {
  const all = read<Batch>(KEYS.batches);
  if (!courseId) return all;
  return all.filter((b) => !b.courseId || b.courseId === courseId);
}

export function saveBatch(data: Omit<Batch, "id" | "createdAt"> & { id?: string }): Batch {
  const list = getBatches();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = list.findIndex((b) => b.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data } as Batch;
      write(KEYS.batches, list);
      return list[idx];
    }
  }
  const newBatch: Batch = { id: uid(), createdAt: now, ...data } as Batch;
  write(KEYS.batches, [newBatch, ...list]);
  return newBatch;
}

export function deleteBatch(id: string): void {
  write(KEYS.batches, getBatches().filter((b) => b.id !== id));
  // Cascade delete
  write(KEYS.milestones, getMilestones().filter((m) => m.batchId !== id));
  write(KEYS.modules, getModules().filter((m) => m.batchId !== id));
  write(KEYS.classes, getClasses().filter((c) => c.batchId !== id));
}

// ── DATABASE SYNC ─────────────────────────────────────────────────────────────
export async function syncClassesFromDatabase(): Promise<{
  milestones: Milestone[];
  modules: CourseModule[];
  classes: ClassLesson[];
}> {
  try {
    const res = await fetch("/api/classes", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.milestones && data.milestones.length > 0) write(KEYS.milestones, data.milestones);
      if (data.modules && data.modules.length > 0) write(KEYS.modules, data.modules);
      if (data.classes && data.classes.length > 0) write(KEYS.classes, data.classes);
      return data;
    }
  } catch {
    // Ignore fetch errors
  }
  return {
    milestones: getMilestones(),
    modules: getModules(),
    classes: getClasses(),
  };
}

async function postApi(action: string, payload: any) {
  try {
    await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
  } catch {
    // Ignore offline errors
  }
}

// ── MILESTONES ────────────────────────────────────────────────────────────────
export function getMilestones(targetId?: string): Milestone[] {
  const all = read<Milestone>(KEYS.milestones);
  if (!targetId) return all;
  const norm = (s?: string) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");
  return all.filter(
    (m) =>
      !m.courseId ||
      norm(m.courseId) === norm(targetId) ||
      m.batchId === targetId
  );
}

export function saveMilestone(
  data: Omit<Milestone, "id" | "createdAt"> & { id?: string }
): Milestone {
  const list = getMilestones();
  const now = new Date().toISOString();
  let item: Milestone;
  if (data.id) {
    const idx = list.findIndex((m) => m.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data } as Milestone;
      item = list[idx];
      write(KEYS.milestones, list);
      postApi("save_milestone", item);
      return item;
    }
  }
  item = { id: uid(), createdAt: now, ...data } as Milestone;
  write(KEYS.milestones, [...list, item]);
  postApi("save_milestone", item);
  return item;
}

export function deleteMilestone(id: string): void {
  write(KEYS.milestones, getMilestones().filter((m) => m.id !== id));
  write(KEYS.modules, getModules().filter((m) => m.milestoneId !== id));
  write(KEYS.classes, getClasses().filter((c) => c.milestoneId !== id));
  postApi("delete_milestone", { id });
}

// ── MODULES ───────────────────────────────────────────────────────────────────
export function getModules(milestoneId?: string): CourseModule[] {
  const all = read<CourseModule>(KEYS.modules);
  return milestoneId ? all.filter((m) => m.milestoneId === milestoneId) : all;
}

export function saveModule(
  data: Omit<CourseModule, "id" | "createdAt"> & { id?: string }
): CourseModule {
  const list = getModules();
  const now = new Date().toISOString();
  let item: CourseModule;
  if (data.id) {
    const idx = list.findIndex((m) => m.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data } as CourseModule;
      item = list[idx];
      write(KEYS.modules, list);
      postApi("save_module", item);
      return item;
    }
  }
  item = { id: uid(), createdAt: now, ...data } as CourseModule;
  write(KEYS.modules, [...list, item]);
  postApi("save_module", item);
  return item;
}

export function deleteModule(id: string): void {
  write(KEYS.modules, getModules().filter((m) => m.id !== id));
  write(KEYS.classes, getClasses().filter((c) => c.moduleId !== id));
  postApi("delete_module", { id });
}

// ── CLASSES ───────────────────────────────────────────────────────────────────
export function getClasses(moduleId?: string): ClassLesson[] {
  const all = read<ClassLesson>(KEYS.classes);
  return moduleId ? all.filter((c) => c.moduleId === moduleId) : all;
}

export function saveClass(
  data: Omit<ClassLesson, "id" | "createdAt"> & { id?: string }
): ClassLesson {
  const list = getClasses();
  const now = new Date().toISOString();
  const videoId = extractYouTubeVideoId(data.youtubeUrl || "");
  const payloadData = {
    ...data,
    youtubeVideoId: videoId || data.youtubeVideoId || "",
    isPublished: data.isPublished ?? true,
  };
  let item: ClassLesson;
  if (data.id) {
    const idx = list.findIndex((c) => c.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...payloadData } as ClassLesson;
      item = list[idx];
      write(KEYS.classes, list);
      postApi("save_class", item);
      return item;
    }
  }
  item = { id: uid(), createdAt: now, ...payloadData } as ClassLesson;
  write(KEYS.classes, [...list, item]);
  postApi("save_class", item);
  return item;
}

export function deleteClass(id: string): void {
  write(KEYS.classes, getClasses().filter((c) => c.id !== id));
  postApi("delete_class", { id });
}

export function togglePublishClass(id: string, isPublished: boolean): void {
  const list = getClasses();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx].isPublished = isPublished;
    write(KEYS.classes, list);
    postApi("toggle_publish_class", { id, isPublished });
  }
}

// ── LESSON PROGRESS ───────────────────────────────────────────────────────────
const PROGRESS_KEY = "durbar_lesson_progress_v1";

export function getCompletedLessonIds(studentId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const list: any[] = raw ? JSON.parse(raw) : [];
    if (!studentId) return list.map((p) => p.lessonId);
    return list.filter((p) => p.studentId === studentId).map((p) => p.lessonId);
  } catch {
    return [];
  }
}

export async function recordLessonProgress(
  studentId: string,
  lessonId: string,
  courseId?: string
): Promise<string[]> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const exists = list.some((p) => p.studentId === studentId && p.lessonId === lessonId);
    if (!exists) {
      list.push({ studentId, lessonId, courseId, completedAt: new Date().toISOString() });
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event(EVENT));
    }
  } catch {}

  postApi("record_progress", { studentId, lessonId, courseId });
  return getCompletedLessonIds(studentId);
}

// ── Subscribe ─────────────────────────────────────────────────────────────────
export function subscribeClassStore(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  window.addEventListener("focus", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
    window.removeEventListener("focus", cb);
  };
}
