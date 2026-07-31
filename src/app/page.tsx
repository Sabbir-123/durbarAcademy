"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CoursesSliderSection from "@/components/CoursesSliderSection";
import StudentChallenge from "@/components/StudentChallenge";
import DurbarSolution from "@/components/DurbarSolution";
import LearningProcess from "@/components/LearningProcess";
import PainPoints from "@/components/PainPoints";
import EcosystemMethodology from "@/components/EcosystemMethodology";
import InstructorsSection from "@/components/InstructorsSection";
import SuccessSection from "@/components/SuccessSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import SyllabusModal from "@/components/SyllabusModal";
import RegistrationModal from "@/components/RegistrationModal";
import { Course } from "@/data/courses";

export default function Home() {
  const [syllabusCourse, setSyllabusCourse] = useState<Course | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registerInitialCourseId, setRegisterInitialCourseId] = useState<string | undefined>(undefined);

  const handleOpenRegisterModal = (courseId?: string) => {
    setRegisterInitialCourseId(courseId);
    setIsRegisterModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#07182E] text-white font-sans selection:bg-[#F59E0B] selection:text-black">
      {/* Navigation Bar */}
      <Navbar onOpenRegisterModal={handleOpenRegisterModal} />

      {/* Hero Section */}
      <Hero onOpenRegisterModal={handleOpenRegisterModal} />

      {/* Flagship Courses Horizontal Slider - Under Hero */}
      <CoursesSliderSection onOpenRegisterModal={handleOpenRegisterModal} />

      {/* Student Challenge (Pain Points) Section - Reference Screenshot 02 */}
      <StudentChallenge />

      {/* Durbar Solution Section - Reference Screenshot 03 */}
      <DurbarSolution />

      {/* Learning Process Section - Reference Screenshot 04 */}
      <LearningProcess />

      {/* Durbar vs Traditional Comparison */}
      <PainPoints />

      {/* Durbar 3-Step Ecosystem Methodology */}
      <EcosystemMethodology />

      {/* Instructors & Mentor Panel Showcase */}
      <InstructorsSection />

      {/* Student Success Stories & Merit Roll */}
      <SuccessSection />

      {/* Frequently Asked Questions */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {syllabusCourse && (
        <SyllabusModal
          course={syllabusCourse}
          onClose={() => setSyllabusCourse(null)}
          onOpenRegisterModal={handleOpenRegisterModal}
        />
      )}

      {isRegisterModalOpen && (
        <RegistrationModal
          initialCourseId={registerInitialCourseId}
          onClose={() => setIsRegisterModalOpen(false)}
        />
      )}
    </main>
  );
}
