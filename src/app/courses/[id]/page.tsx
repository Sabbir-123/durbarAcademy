"use client";

import { use } from "react";
import CourseDetailView from "@/components/CourseDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <CourseDetailView courseId={id} />;
}
