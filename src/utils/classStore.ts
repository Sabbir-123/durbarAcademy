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
  batchId: string;
  title: string;
  description: string;
  youtubeUrl: string; // unlisted YouTube URL or embed URL
  durationMin: number;
  order: number;
  tests: TestItem[];
  createdAt: string;
}

export interface CourseModule {
  id: string;
  milestoneId: string;
  batchId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  batchId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

export interface Batch {
  id: string;
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
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── BATCHES ───────────────────────────────────────────────────────────────────
export function getBatches(): Batch[] {
  return read<Batch>(KEYS.batches);
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

// ── MILESTONES ────────────────────────────────────────────────────────────────
export function getMilestones(batchId?: string): Milestone[] {
  const all = read<Milestone>(KEYS.milestones);
  return batchId ? all.filter((m) => m.batchId === batchId) : all;
}

export function saveMilestone(
  data: Omit<Milestone, "id" | "createdAt"> & { id?: string }
): Milestone {
  const list = getMilestones();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = list.findIndex((m) => m.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data } as Milestone;
      write(KEYS.milestones, list);
      return list[idx];
    }
  }
  const item: Milestone = { id: uid(), createdAt: now, ...data } as Milestone;
  write(KEYS.milestones, [...list, item]);
  return item;
}

export function deleteMilestone(id: string): void {
  write(KEYS.milestones, getMilestones().filter((m) => m.id !== id));
  write(KEYS.modules, getModules().filter((m) => m.milestoneId !== id));
  write(KEYS.classes, getClasses().filter((c) => c.milestoneId !== id));
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
  if (data.id) {
    const idx = list.findIndex((m) => m.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data } as CourseModule;
      write(KEYS.modules, list);
      return list[idx];
    }
  }
  const item: CourseModule = { id: uid(), createdAt: now, ...data } as CourseModule;
  write(KEYS.modules, [...list, item]);
  return item;
}

export function deleteModule(id: string): void {
  write(KEYS.modules, getModules().filter((m) => m.id !== id));
  write(KEYS.classes, getClasses().filter((c) => c.moduleId !== id));
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
  if (data.id) {
    const idx = list.findIndex((c) => c.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data } as ClassLesson;
      write(KEYS.classes, list);
      return list[idx];
    }
  }
  const item: ClassLesson = { id: uid(), createdAt: now, ...data } as ClassLesson;
  write(KEYS.classes, [...list, item]);
  return item;
}

export function deleteClass(id: string): void {
  write(KEYS.classes, getClasses().filter((c) => c.id !== id));
}

// ── YouTube URL → embed URL converter ─────────────────────────────────────────
export function toYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  // Already embed format
  if (url.includes("youtube.com/embed/")) return url;
  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // youtube.com/watch?v=VIDEO_ID
  const longMatch = url.match(/[?&]v=([^&]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  return url;
}

// ── Subscribe ─────────────────────────────────────────────────────────────────
export function subscribeClassStore(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
