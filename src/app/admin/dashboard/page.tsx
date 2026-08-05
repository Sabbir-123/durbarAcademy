"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { Course } from "@/data/courses";
import {
  getStoredCourses,
  saveCourse,
  deleteCourseStore,
  subscribeCoursesStore,
  syncCoursesFromSupabase,
} from "@/utils/courseStore";
import { StudentSuccess } from "@/data/testimonials";
import {
  getStoredSuccessStories,
  saveSuccessStory,
  deleteSuccessStory,
  subscribeSuccessStoriesStore,
} from "@/utils/successStoryStore";
import {
  getStoredAuditLogs,
  logAuditAction,
  AuditLogItem,
} from "@/utils/auditLogger";
import {
  getStoredUsers,
  saveUserStore,
  updateUserRoleStore,
  updateUserStore,
  deleteUserStore,
  subscribeUserStore,
  isSuperAdminEmail,
  isUserDeleted,
} from "@/utils/userStore";
import {
  getStoredPaymentDetails,
  savePaymentDetailStore,
  deletePaymentDetailStore,
  togglePaymentDetailStatusStore,
  subscribePaymentDetailsStore,
  syncPaymentDetailsFromSupabase,
  PaymentDetail,
} from "@/utils/paymentDetailStore";
import {
  Users,
  ShieldCheck,
  Trash2,
  Edit,
  BookOpen,
  Plus,
  Eye,
  EyeOff,
  X,
  Trophy,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Key,
  GraduationCap,
  TrendingUp,
  Wallet,
  PieChart,
  Receipt,
  PlusCircle,
  Coins,
  LayoutDashboard,
  ArrowRight,
  UserCheck,
  CreditCard,
  Building2,
  Phone,
  MapPin,
  Landmark,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [successStories, setSuccessStories] = useState<StudentSuccess[]>([]);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "courses" | "stories" | "finance" | "payment" | "audit"
  >("dashboard");

  // Payment Details Management State
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<PaymentDetail | null>(null);

  const [paymentForm, setPaymentForm] = useState<{
    id?: string;
    method_type: "bkash" | "nagad" | "rocket" | "bank" | "other";
    title: string;
    account_type: "personal" | "agent" | "merchant" | "bank_account";
    mobile_number: string;
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    branch_name: string;
    district: string;
    routing_number: string;
    instructions: string;
    is_active: boolean;
  }>({
    method_type: "bkash",
    title: "",
    account_type: "personal",
    mobile_number: "",
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    branch_name: "",
    district: "",
    routing_number: "",
    instructions: "",
    is_active: true,
  });

  // User Filter & Search State
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Auto Password Generator State
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [showGeneratedPassword, setShowGeneratedPassword] = useState<boolean>(false);
  const [passwordCopied, setPasswordCopied] = useState<boolean>(false);

  // Granular Permission Access Controls for New Admin
  const [adminPermissions, setAdminPermissions] = useState({
    courses: true,
    stories: true,
    users: true,
    audit: true,
  });

  // Expense & Salary Ledger State (Initially Empty for Initial Launch)
  const [expenseLedger, setExpenseLedger] = useState<any[]>([]);

  const [ledgerSearch, setLedgerSearch] = useState("");
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    recipient: "",
    role: "শিক্ষক/মেন্টর",
    purpose: "",
    amount: "",
  });

  // Dynamic Finance Calculations
  const totalExpense = expenseLedger.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const totalSalaryGiven = expenseLedger
    .filter(
      (item) =>
        item.role.includes("শিক্ষক") ||
        item.role.includes("অ্যাডমিন") ||
        item.role.includes("একাউন্ট্যান্ট")
    )
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalSales = expenseLedger
    .filter(
      (item) =>
        item.role.includes("ইনকাম") || item.role.includes("সেলস")
    )
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // User Role Statistics
  const adminCount = usersList.filter((u) => u.role.toLowerCase().includes("admin")).length;
  const teacherCount = usersList.filter((u) => u.role.toLowerCase() === "teacher").length;
  const accountantCount = usersList.filter((u) => u.role.toLowerCase() === "accountant").length;
  const studentCount = usersList.filter((u) => u.role.toLowerCase() === "student").length;

  // Audit Log Pagination State (15 logs per page)
  const [auditCurrentPage, setAuditCurrentPage] = useState<number>(1);
  const logsPerPage = 15;

  // New User / Admin Form State (Only Admin, Teacher, Accountant)
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "admin",
  });

  // Helper function to generate an 8-character secure password
  const generate8CharPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pass);
    setPasswordCopied(false);
  };

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2500);
  };

  // New Course Form State
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    category: "defense",
    categoryLabel: "ডিফেন্স ও মিলিটারি",
    title: "",
    tagline: "",
    batchBadge: "",
    discountBadge: "",
    price: 8500,
    originalPrice: 12000,
    seatsRemaining: 20,
    totalSeats: 100,
    startDate: "১৫ আগস্ট, ২০২৬",
    duration: "৪ মাস",
    imageUrl: "",
    videoUrl: "",
    detailLayout: "standard",
    courseMode: "both",
    description: "",
    features: [],
    instructors: [],
  });

  const [featuresInput, setFeaturesInput] = useState("");
  const [instructorsInput, setInstructorsInput] = useState("");
  const [newCourseTeacherEmails, setNewCourseTeacherEmails] = useState<string[]>([]);

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editFeaturesInput, setEditFeaturesInput] = useState("");
  const [editInstructorsInput, setEditInstructorsInput] = useState("");
  const [editCourseTeacherEmails, setEditCourseTeacherEmails] = useState<string[]>([]);

  // New Success Story State
  const [newStory, setNewStory] = useState<Partial<StudentSuccess>>({
    name: "",
    rank: "মেধা স্থান: ০১",
    institution: "বাংলাদেশ বিমান বাহিনী (BAFA)",
    category: "bafa",
    program: "BAFA Officer Cadet Course",
    hscCollege: "নটর ডেম কলেজ, ঢাকা",
    quote: "",
    score: "মার্কস: ১৮৫/২০০",
    badgeColor: "gold",
    imageUrl: "",
  });

  // Edit Success Story Modal State
  const [editingStory, setEditingStory] = useState<StudentSuccess | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["dashboard", "users", "courses", "stories", "finance", "payment", "audit"].includes(hash)) {
        setActiveTab(hash as any);
      }
    }

    // Sync local stored users, courses, success stories, payment details, and audit logs
    setUsersList(getStoredUsers());
    const unsubUsers = subscribeUserStore(() => {
      setUsersList(getStoredUsers());
    });

    setCourses(getStoredCourses());
    const unsubCourses = subscribeCoursesStore(() => {
      setCourses(getStoredCourses());
    });

    setSuccessStories(getStoredSuccessStories());
    const unsubStories = subscribeSuccessStoriesStore(() => {
      setSuccessStories(getStoredSuccessStories());
    });

    setPaymentDetails(getStoredPaymentDetails());
    const unsubPayment = subscribePaymentDetailsStore(() => {
      setPaymentDetails(getStoredPaymentDetails());
    });

    setAuditLogs(getStoredAuditLogs());

    async function loadData() {
      const synced = await syncCoursesFromSupabase();
      setCourses(synced);

      const syncedPayments = await syncPaymentDetailsFromSupabase();
      if (syncedPayments && syncedPayments.length > 0) {
        setPaymentDetails(syncedPayments);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(prof);

      // Fetch users — skip any that were permanently deleted by admin
      const { data: dbUsers } = await supabase.from("profiles").select(`
          id,
          full_name,
          email,
          user_roles (role)
        `);
      if (dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((u) => {
          // Skip if this user's id OR email is in the deleted blocklist
          if (isUserDeleted(u.id)) return;
          saveUserStore({
            id: u.id,
            full_name: u.full_name || u.email,
            email: u.email,
            role: (u as any).user_roles?.role || "student",
          });
        });
        setUsersList(getStoredUsers());
      }
    }
    loadData();

    return () => {
      unsubUsers();
      unsubCourses();
      unsubStories();
    };
  }, []);

  // USER CRUD: ROLE REASSIGNMENT WITH AUTOMATIC SEQUENTIAL ADMIN COUNTER (Admin 2, Admin 3, Admin 4...)
  const handleRoleReassignment = async (userId: string, newRoleInput: string) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (targetUser && (targetUser.role.toLowerCase() === "super admin" || isSuperAdminEmail(targetUser.email))) {
      alert("Super Admin (ahmedsabbir2013@gmail.com) অ্যাকাউন্টের রোল পরিবর্তন করা সম্ভব নয়।");
      return;
    }
    const targetName = targetUser ? targetUser.full_name : userId;

    let finalRole = newRoleInput;

    if (newRoleInput.toLowerCase().includes("admin")) {
      const existingAdminsCount = usersList.filter(
        (u) => u.role.toLowerCase().includes("admin") && u.id !== userId
      ).length;
      finalRole = existingAdminsCount === 0 ? "Super Admin" : `Admin ${existingAdminsCount + 1}`;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: finalRole });

      if (error) console.log("Supabase update error (fallback active):", error);

      await logAuditAction(
        "ইউজার রোল প্রমোশন/পরিবর্তন",
        `ইউজার ${targetName}-এর রোল পরিবর্তন করে ${finalRole} করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert(`ইউজারের রোল পরিবর্তন করে ${finalRole} করা হয়েছে।`);
      updateUserRoleStore(userId, finalRole);
      setUsersList(getStoredUsers());
    } catch (err: any) {
      console.error(err);
      alert("রোল পরিবর্তন করতে সমস্যা: " + err.message);
    }
  };

  // USER CRUD: CREATE NEW USER / ADMIN / TEACHER / ACCOUNTANT
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.email) {
      alert("অনুগ্রহ করে ইউজারের নাম ও ইমেল ঠিকানা প্রদান করুন।");
      return;
    }

    if (newUser.role === "student") {
      alert("শিক্ষার্থীদের অ্যাকাউন্ট সুপার অ্যাডমিন প্যানেল থেকে তৈরি করা যাবে না। শিক্ষার্থীরা সাধারণ রেজিস্ট্রেশন পেজ (/signup) থেকে অ্যাকাউন্ট তৈরি করবে।");
      return;
    }

    if (!generatedPassword) {
      alert("অনুগ্রহ করে 'পাসওয়ার্ড জেনারেট করুন' বোতাম চেপে ৮ অক্ষরের পাসওয়ার্ড তৈরি করুন।");
      return;
    }

    let assignedRole = newUser.role;

    if (newUser.role === "admin") {
      const existingAdminsCount = usersList.filter((u) =>
        u.role.toLowerCase().includes("admin")
      ).length;
      assignedRole = existingAdminsCount === 0 ? "Super Admin" : `Admin ${existingAdminsCount + 1}`;
    }

    const created = {
      id: "u-" + Date.now(),
      full_name: newUser.full_name,
      email: newUser.email,
      role: assignedRole,
      permissions: assignedRole.toLowerCase().includes("admin") ? adminPermissions : undefined,
      temp_password: generatedPassword,
    };

    saveUserStore(created);
    setUsersList(getStoredUsers());

    await logAuditAction(
      "নতুন ইউজার অ্যাকাউন্ট তৈরি (Create)",
      `নতুন ${assignedRole} "${newUser.full_name}" (${newUser.email}) অ্যাকাউন্ট পারমিশনসহ তৈরি করা হয়েছে।`
    );
    setAuditLogs(getStoredAuditLogs());

    try {
      const { data: authData } = await supabase.auth.signUp({
        email: newUser.email.trim().toLowerCase(),
        password: generatedPassword,
        options: {
          data: {
            full_name: newUser.full_name,
          },
        },
      });

      const userId = authData?.user?.id || created.id;
      created.id = userId;
      saveUserStore(created);

      await supabase.from("profiles").upsert([
        { id: userId, full_name: created.full_name, email: created.email },
      ]);
      await supabase.from("user_roles").upsert([
        { user_id: userId, role: created.role },
      ]);
    } catch (err) {
      console.log("Supabase insert/auth sync fallback:", err);
    }

    alert(`নতুন ${assignedRole} "${newUser.full_name}" সফলভাবে তৈরি করা হয়েছে!\nজেনারেটেড পাসওয়ার্ড: ${generatedPassword}`);
    setNewUser({ full_name: "", email: "", role: "admin" });
    setGeneratedPassword("");
    setPasswordCopied(false);
    setIsAddUserModalOpen(false);
  };

  // USER CRUD: EDIT USER DETAILS
  const handleOpenEditUserModal = (u: any) => {
    if (u.role.toLowerCase() === "super admin" || isSuperAdminEmail(u.email)) {
      alert("Super Admin (ahmedsabbir2013@gmail.com) অ্যাকাউন্ট সম্পাদনা করা সম্ভব নয় (Protected Master Account)।");
      return;
    }
    setEditingUser({ ...u, password: u.password || u.temp_password || "" });
    if (u.permissions) {
      setAdminPermissions({ ...u.permissions });
    }
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      updateUserStore(editingUser.id, {
        full_name: editingUser.full_name,
        email: editingUser.email,
        role: editingUser.role,
        password: editingUser.password,
        permissions: editingUser.role.toLowerCase().includes("admin") ? adminPermissions : undefined,
      });

      await logAuditAction(
        "ইউজার তথ্য সম্পাদনা (Update)",
        `ইউজার "${editingUser.full_name}" (${editingUser.email})-এর তথ্য ও পাসওয়ার্ড আপডেট করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());
      setUsersList(getStoredUsers());

      alert(`ইউজার "${editingUser.full_name}"-এর তথ্য সফলভাবে আপডেট করা হয়েছে!`);
      setEditingUser(null);
    } catch (err: any) {
      alert("ইউজার আপডেট করতে ব্যর্থ: " + err.message);
    }
  };

  // USER CRUD: DELETE USER
  const handleDeleteUser = async (userId: string, userName: string) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (targetUser && (targetUser.role.toLowerCase() === "super admin" || isSuperAdminEmail(targetUser.email))) {
      alert("Super Admin (ahmedsabbir2013@gmail.com) অ্যাকাউন্ট সিস্টেম থেকে মুছে ফেলা সম্ভব নয় (Protected Master Account)।");
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিতভাবে ইউজার "${userName}" সিস্টেম থেকে সম্পূর্ণ ডিলিট করতে চান?`)) return;

    try {
      // 1. Delete from Supabase permanently (so reload does not bring them back)
      await supabase.from("user_roles").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);

      // 2. Delete from local store
      deleteUserStore(userId);
      await logAuditAction(
        "ইউজার ডিলিট করা (Delete)",
        `ইউজার "${userName}" (ID: ${userId}) সফলভাবে ডিলিট করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());
      setUsersList(getStoredUsers());

      alert(`ইউজার "${userName}" সফলভাবে ডিলিট করা হয়েছে।`);
    } catch (err: any) {
      alert("ডিলিট করতে ব্যর্থ: " + err.message);
    }
  };

  // ADD NEW EXPENSE PAYOUT ENTRY
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.recipient || !newExpense.amount) {
      alert("অনুগ্রহ করে প্রাপকের নাম ও অর্থ প্রদানের পরিমাণ উল্লেখ করুন।");
      return;
    }

    const entry = {
      id: "exp-" + Date.now(),
      recipient: newExpense.recipient,
      role: newExpense.role,
      purpose: newExpense.purpose || "সম্মানী ও পরিচালনা ব্যয়",
      amount: Number(newExpense.amount),
      date: new Date().toLocaleDateString("bn-BD", { month: "long", day: "numeric", year: "numeric" }),
      status: "পরিশোধিত",
    };

    setExpenseLedger((prev) => [entry, ...prev]);

    await logAuditAction(
      "নতুন আর্থিক এন্ট্রি",
      `প্রাপক ${entry.recipient} (${entry.role})-কে ৳${entry.amount.toLocaleString("bn-BD")} পরিমাণের এন্ট্রি যুক্ত করা হয়েছে।`
    );
    setAuditLogs(getStoredAuditLogs());

    alert(`আর্থিক এন্ট্রি সফলভাবে যুক্ত করা হয়েছে!`);
    setNewExpense({ recipient: "", role: "শিক্ষক/মেন্টর", purpose: "", amount: "" });
    setIsAddExpenseModalOpen(false);
  };

  // Filtered User List
  const filteredUsers = usersList.filter((u) => {
    const matchesRole =
      roleFilter === "all"
        ? true
        : roleFilter === "admin"
        ? u.role.toLowerCase().includes("admin")
        : u.role.toLowerCase() === roleFilter.toLowerCase();

    const matchesSearch =
      u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filtered Expense Ledger
  const filteredExpenses = expenseLedger.filter((e) =>
    e.recipient.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
    e.purpose.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
    e.role.toLowerCase().includes(ledgerSearch.toLowerCase())
  );

  // COURSE CRUD HANDLERS WITH AUDIT LOGGING
  const handleAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || newCourse.price === undefined) {
      alert("অনুগ্রহ করে কোর্সের শিরোনাম এবং মূল্য প্রদান করুন।");
      return;
    }

    const feats = featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const insts = instructorsInput
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      const saved = await saveCourse({
        ...newCourse,
        title: newCourse.title,
        price: Number(newCourse.price),
        categoryLabel: "ডিফেন্স ও মিলিটারি",
        features: feats.length > 0 ? feats : ["লাইভ ও ওএমআর এক্সাম", "পিডিএফ নোটস"],
        instructors: insts.length > 0 ? insts : ["অভিজ্ঞ মেন্টর প্যানেল"],
        teacherEmails: newCourseTeacherEmails,
      });

      await logAuditAction(
        "নতুন কোর্স তৈরি",
        `নতুন কোর্স "${saved.title}" (ফি: ৳${saved.price}) সফলভাবে সিস্টেমে যুক্ত করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert(`কোর্স "${saved.title}" সফলভাবে যোগ করা হয়েছে!`);
      setNewCourse({
        category: "defense",
        categoryLabel: "ডিফেন্স ও মিলিটারি",
        title: "",
        tagline: "",
        batchBadge: "",
        discountBadge: "",
        price: 8500,
        originalPrice: 12000,
        seatsRemaining: 20,
        totalSeats: 100,
        startDate: "১৫ আগস্ট, ২০২৬",
        duration: "৪ মাস",
        imageUrl: "",
        videoUrl: "",
        detailLayout: "standard",
        courseMode: "both",
        description: "",
        features: [],
        instructors: [],
      });
      setFeaturesInput("");
      setInstructorsInput("");
      setNewCourseTeacherEmails([]);
    } catch (err: any) {
      alert("কোর্স তৈরি করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleOpenEditCourseModal = (course: Course) => {
    setEditingCourse({ ...course });
    setEditFeaturesInput((course.features || []).join("\n"));
    setEditInstructorsInput((course.instructors || []).join(", "));
    setEditCourseTeacherEmails(course.teacherEmails || []);
  };

  const handleSaveEditedCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const feats = editFeaturesInput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const insts = editInstructorsInput
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      const updated = await saveCourse({
        ...editingCourse,
        title: editingCourse.title,
        price: Number(editingCourse.price),
        categoryLabel: "ডিফেন্স ও মিলিটারি",
        features: feats,
        instructors: insts,
        teacherEmails: editCourseTeacherEmails,
      });

      await logAuditAction(
        "কোর্স সম্পাদনা (Update)",
        `কোর্স "${updated.title}" তথ্য ও কারিকুলাম আপডেট করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert(`কোর্স "${updated.title}" আপডেট করা হয়েছে!`);
      setEditingCourse(null);
    } catch (err: any) {
      alert("কোর্স আপডেট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${title}" কোর্সটি ডিলিট করতে চান?`)) return;

    try {
      await deleteCourseStore(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId && (c as any).slug !== courseId));
      await logAuditAction(
        "কোর্স মুছে ফেলা (Delete)",
        `কোর্স "${title}" (ID: ${courseId}) সিস্টেম থেকে মুছে ফেলা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert("কোর্সটি সফলভাবে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      alert("কোর্স ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleToggleCoursePublish = async (course: Course) => {
    try {
      const updated = await saveCourse({
        ...course,
        title: course.title,
        price: Number(course.price),
        published: !course.published,
      });

      await logAuditAction(
        "কোর্স পাবলিশ স্ট্যাটাস পরিবর্তন",
        `কোর্স "${updated.title}"-এর স্ট্যাটাস ${
          updated.published ? "পাবলিশড (দৃশ্যমান)" : "আনপাবলিশড (লুকানো)"
        } করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert(
        `কোর্সটি ${
          updated.published ? "পাবলিশড (দৃশ্যমান)" : "আনপাবলিশড (লুকানো)"
        } করা হয়েছে।`
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  // SUCCESS STORY CRUD HANDLERS WITH AUDIT LOGGING
  const handleAddStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.name || !newStory.institution) {
      alert("অনুগ্রহ করে কৃতি শিক্ষার্থীর নাম ও প্রতিষ্ঠানের নাম প্রদান করুন।");
      return;
    }

    try {
      const saved = await saveSuccessStory(newStory);
      await logAuditAction(
        "সাকসেস স্টোরি যুক্ত",
        `কৃতি শিক্ষার্থী "${saved.name}" (${saved.institution}) সাফল্য তথ্য যুক্ত করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert(`সাকসেস স্টোরি "${saved.name}" সফলভাবে যুক্ত করা হয়েছে!`);
      setNewStory({
        name: "",
        rank: "মেধা স্থান: ০১",
        institution: "বাংলাদেশ বিমান বাহিনী (BAFA)",
        category: "bafa",
        program: "BAFA Officer Cadet Course",
        hscCollege: "নটর ডেম কলেজ, ঢাকা",
        quote: "",
        score: "মার্কস: ১৮৫/২০০",
        badgeColor: "gold",
        imageUrl: "",
      });
    } catch (err: any) {
      alert("সাকসেস স্টোরি যুক্ত করতে ব্যর্থ: " + err.message);
    }
  };

  const handleSaveEditedStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    try {
      await saveSuccessStory(editingStory);
      await logAuditAction(
        "সাকসেস স্টোরি সম্পাদনা",
        `কৃতি শিক্ষার্থী "${editingStory.name}"-এর টেস্টামেন্ট এডিট করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert(`সাকসেস স্টোরি "${editingStory.name}" আপডেট করা হয়েছে!`);
      setEditingStory(null);
    } catch (err: any) {
      alert("আপডেট করতে ব্যর্থ: " + err.message);
    }
  };

  const handleDeleteStory = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${name}"-এর স্টোরিটি ডিলিট করতে চান?`)) return;

    try {
      await deleteSuccessStory(id);
      await logAuditAction(
        "সাকসেস স্টোরি মুছে ফেলা",
        `কৃতি শিক্ষার্থী "${name}"-এর সাকসেস স্টোরি ডিলিট করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert("সাকসেস স্টোরিটি সফলভাবে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      alert("ডিলিট করতে ব্যর্থ: " + err.message);
    }
  };

  const handleToggleStoryPublish = async (story: StudentSuccess) => {
    try {
      const updated = await saveSuccessStory({
        ...story,
        published: !story.published,
      });
      await logAuditAction(
        "স্টোরি পাবলিশ স্ট্যাটাস পরিবর্তন",
        `সাকসেস স্টোরি "${story.name}" ${
          updated.published ? "পাবলিশড (দৃশ্যমান)" : "আনপাবলিশড (লুকানো)"
        } করা হয়েছে।`
      );
      setAuditLogs(getStoredAuditLogs());

      alert(
        `স্টোরিটি ${
          updated.published ? "পাবলিশড (দৃশ্যমান)" : "আনপাবলিশড (লুকানো)"
        } করা হয়েছে।`
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  // PAYMENT DETAILS CRUD HANDLERS
  const handleOpenAddPaymentModal = () => {
    setEditingPayment(null);
    setPaymentForm({
      method_type: "bkash",
      title: "",
      account_type: "personal",
      mobile_number: "",
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      branch_name: "",
      district: "",
      routing_number: "",
      instructions: "",
      is_active: true,
    });
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditPaymentModal = (item: PaymentDetail) => {
    setEditingPayment(item);
    setPaymentForm({
      id: item.id,
      method_type: item.method_type,
      title: item.title,
      account_type: item.account_type || "personal",
      mobile_number: item.mobile_number || "",
      bank_name: item.bank_name || "",
      account_holder_name: item.account_holder_name || "",
      account_number: item.account_number || "",
      branch_name: item.branch_name || "",
      district: item.district || "",
      routing_number: item.routing_number || "",
      instructions: item.instructions || "",
      is_active: item.is_active,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.title.trim()) {
      alert("অনুগ্রহ করে পেমেন্ট অ্যাকাউন্টের বিষয়/শিরোনাম প্রদান করুন।");
      return;
    }

    if (paymentForm.method_type === "bank") {
      if (!paymentForm.bank_name || !paymentForm.account_number) {
        alert("অনুগ্রহ করে ব্যাংকের নাম এবং হিসাব নম্বর প্রদান করুন।");
        return;
      }
    } else {
      if (!paymentForm.mobile_number) {
        alert("অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন।");
        return;
      }
    }

    const updated = await savePaymentDetailStore(paymentForm);
    setPaymentDetails(updated);
    setIsPaymentModalOpen(false);

    const actor = profile?.full_name || "Ahmed Sabbir (Super Admin)";
    const actionText = editingPayment ? "পেমেন্ট তথ্য আপডেট" : "নতুন পেমেন্ট তথ্য সংযোজন";
    const detailText = `${paymentForm.title} (${paymentForm.method_type.toUpperCase()}) - ${paymentForm.account_number || paymentForm.mobile_number}`;
    await logAuditAction(actor, "admin", actionText, detailText);
    setAuditLogs(getStoredAuditLogs());
  };

  const handleDeletePayment = async (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${title}" পেমেন্ট অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
      const updated = await deletePaymentDetailStore(id);
      setPaymentDetails(updated);
      const actor = profile?.full_name || "Ahmed Sabbir (Super Admin)";
      await logAuditAction(actor, "admin", "পেমেন্ট তথ্য ডিলিট", `পেমেন্ট অ্যাকাউন্ট ${title} মুছে ফেলা হয়েছে।`);
      setAuditLogs(getStoredAuditLogs());
    }
  };

  const handleTogglePaymentStatus = async (id: string, currentStatus: boolean, title: string) => {
    const updated = await togglePaymentDetailStatusStore(id);
    setPaymentDetails(updated);
    const actor = profile?.full_name || "Ahmed Sabbir (Super Admin)";
    const statusText = !currentStatus ? "সক্রিয় (Active)" : "নিষ্ক্রিয় (Inactive)";
    await logAuditAction(actor, "admin", "পেমেন্ট স্ট্যাটাস পরিবর্তন", `পেমেন্ট অ্যাকাউন্ট ${title}-এর স্ট্যাটাস ${statusText} করা হয়েছে।`);
    setAuditLogs(getStoredAuditLogs());
  };

  // PAYMENT DETAILS FILTER & SEARCH
  const filteredPaymentDetails = paymentDetails.filter((item) => {
    const matchesMethod = paymentMethodFilter === "all" || item.method_type === paymentMethodFilter;
    const q = paymentSearchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.mobile_number && item.mobile_number.includes(q)) ||
      (item.bank_name && item.bank_name.toLowerCase().includes(q)) ||
      (item.account_number && item.account_number.toLowerCase().includes(q)) ||
      (item.district && item.district.toLowerCase().includes(q));

    return matchesMethod && matchesQuery;
  });

  const activePaymentCount = paymentDetails.filter((p) => p.is_active).length;
  const bkashPaymentCount = paymentDetails.filter((p) => p.method_type === "bkash").length;
  const nagadPaymentCount = paymentDetails.filter((p) => p.method_type === "nagad").length;
  const bankPaymentCount = paymentDetails.filter((p) => p.method_type === "bank").length;

  // AUDIT LOG PAGINATION LOGIC (15 LOGS PER PAGE)
  const totalAuditPages = Math.ceil(auditLogs.length / logsPerPage) || 1;
  const paginatedAuditLogs = auditLogs.slice(
    (auditCurrentPage - 1) * logsPerPage,
    auditCurrentPage * logsPerPage
  );

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      <DashboardSidebar
        role="admin"
        activeTab={activeTab}
        userName={profile?.full_name || "Ahmed Sabbir"}
        onTabChange={(tab) => {
          setActiveTab(tab as any);
          setAuditCurrentPage(1);
        }}
      />

      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">


        {/* TAB: OVERVIEW DASHBOARD (SUMMARY OF EVERYTHING) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <LayoutDashboard className="w-6 h-6 text-[#F59E0B]" />
                  <span>সামগ্রিক ড্যাশবোর্ড সামারি (Overview of Everything)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  সিস্টেমের সকল ইউজার, ডিফেন্স কোর্স, কৃতি শিক্ষার্থী ও আর্থিক হিসাবের রিয়েল-টাইম সারসংক্ষেপ।
                </p>
              </div>
              <DashboardHeader role="admin" />
            </div>

            {/* 5 EXECUTIVE SUMMARY STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                onClick={() => setActiveTab("users")}
                className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 cursor-pointer hover:border-[#F59E0B]/40 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">মোট ইউজার</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white">{usersList.length} জন</p>
                <span className="text-[10px] text-blue-400 font-bold block">
                  {studentCount} শিক্ষার্থী • {teacherCount} শিক্ষক • {adminCount} অ্যাডমিন
                </span>
              </div>

              <div
                onClick={() => setActiveTab("courses")}
                className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 cursor-pointer hover:border-[#F59E0B]/40 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">সক্রিয় কোর্সসমূহ</span>
                  <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#F59E0B]">{courses.length}টি</p>
                <span className="text-[10px] text-[#F59E0B] font-bold block">
                  BAFA, BMA, BN ও ISSB কোর্স
                </span>
              </div>

              <div
                onClick={() => setActiveTab("stories")}
                className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 cursor-pointer hover:border-[#F59E0B]/40 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">সাকসেস স্টোরি</span>
                  <div className="p-2 rounded-xl bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20 group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#FACC15]">{successStories.length}টি</p>
                <span className="text-[10px] text-[#FACC15] font-bold block">
                  ১ম স্থান ও গ্রিন কার্ড সাফল্যসমূহ
                </span>
              </div>

              <div
                onClick={() => setActiveTab("finance")}
                className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 cursor-pointer hover:border-[#F59E0B]/40 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ফাইনান্সিয়াল স্থিতি</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-400">৳{totalSales.toLocaleString("bn-BD")}</p>
                <span className="text-[10px] text-emerald-400 font-bold block">
                  সর্বমোট ইনকাম ও সেলস ব্যালেন্স
                </span>
              </div>

              <div
                onClick={() => setActiveTab("audit")}
                className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 cursor-pointer hover:border-[#F59E0B]/40 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">অডিট ট্রেইল লগ</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-purple-300">{auditLogs.length}টি</p>
                <span className="text-[10px] text-purple-400 font-bold block">
                  ৩০ দিনের সিকিউর ট্র্যাকিং লগস
                </span>
              </div>
            </div>

            {/* QUICK PREVIEWS & MANAGEMENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Recent Users & Recent Audit Activity */}
              <div className="lg:col-span-7 space-y-6">
                {/* Users Summary Widget */}
                <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#F59E0B]" />
                      <span>ইউজার রোল বন্টন ও সাম্প্রতিক তালিকা</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-xs text-[#F59E0B] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>সকল ইউজার দেখুন ({usersList.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5">
                      <span className="text-slate-400 block text-[10px]">অ্যাডমিন</span>
                      <strong className="text-[#F59E0B] text-base">{adminCount}</strong>
                    </div>
                    <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5">
                      <span className="text-slate-400 block text-[10px]">শিক্ষক</span>
                      <strong className="text-amber-300 text-base">{teacherCount}</strong>
                    </div>
                    <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5">
                      <span className="text-slate-400 block text-[10px]">একাউন্ট্যান্ট</span>
                      <strong className="text-emerald-400 text-base">{accountantCount}</strong>
                    </div>
                    <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5">
                      <span className="text-slate-400 block text-[10px]">শিক্ষার্থী</span>
                      <strong className="text-blue-400 text-base">{studentCount}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {usersList.slice(0, 4).map((u) => (
                      <div key={u.id} className="p-3 bg-[#07182E] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#163255] border border-white/10 flex items-center justify-center font-bold text-[#F59E0B] text-[10px]">
                            {u.full_name ? u.full_name[0] : "U"}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{u.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-[#F59E0B]">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Activity Widget */}
                <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                      <span>সাম্প্রতিক অডিট লগ ও ট্র্যাকিং</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("audit")}
                      className="text-xs text-[#F59E0B] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>সকল লগ দেখুন ({auditLogs.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {auditLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="p-3 bg-[#07182E] rounded-xl border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{log.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString("bn-BD", { timeStyle: "short" })}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Active Courses & Success Stories Quick Widget */}
              <div className="lg:col-span-5 space-y-6">
                {/* Active Courses Summary Widget */}
                <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#F59E0B]" />
                      <span>বর্তমান কোর্সসমূহ ({courses.length})</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="text-xs text-[#F59E0B] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>কোর্স পরিচালনা</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {courses.slice(0, 3).map((c) => (
                      <div key={c.id} className="p-3 bg-[#07182E] rounded-xl border border-white/5 text-xs flex items-center justify-between">
                        <div>
                          <strong className="text-white block font-bold">{c.title}</strong>
                          <span className="text-[10px] text-[#F59E0B] font-bold">৳{c.price.toLocaleString("bn-BD")}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          পাবলিশড
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Stories Summary Widget */}
                <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#F59E0B]" />
                      <span>কৃতি শিক্ষার্থী স্টোরিস ({successStories.length})</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("stories")}
                      className="text-xs text-[#F59E0B] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>স্টোরি ম্যানেজ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {successStories.slice(0, 3).map((s) => (
                      <div key={s.id} className="p-3 bg-[#07182E] rounded-xl border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-white font-bold">{s.name}</strong>
                          <span className="text-[9px] px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] font-bold rounded">
                            {s.rank}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400">{s.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FINANCE & ACCOUNTING (DEDICATED FINANCIAL DASHBOARD) */}
        {activeTab === "finance" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Coins className="w-6 h-6 text-[#F59E0B]" />
                  <span>ফাইনান্সিয়াল ওভারভিউ ও আর্থিক বিবরণী</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  প্রতিষ্ঠানের মোট এনরোল্ড শিক্ষার্থী, আয়-ব্যয়, শিক্ষক সম্মানী ও সর্বমোট আর্থিক হিসাব।
                </p>
              </div>

              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="px-4 py-2.5 bg-[#F59E0B] text-black text-xs font-bold rounded-xl hover:brightness-110 transition flex items-center gap-2 shadow-lg w-fit"
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন বেতন / খরচ এন্ট্রি যোগ করুন</span>
              </button>
            </div>

            {/* EXECUTIVE STAT CARDS (ZERO INITIAL STATE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 shadow-md hover:border-[#F59E0B]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">মোট এনরোল্ড শিক্ষার্থী</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white">{studentCount} জন</p>
                <span className="text-[10px] text-slate-400 font-bold block">
                  সিস্টেমে মোট রেজিস্টার্ড শিক্ষার্থী
                </span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 shadow-md hover:border-[#F59E0B]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">মোট সেলস / ইনকাম (Total Sales)</span>
                  <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#F59E0B]">৳{totalSales.toLocaleString("bn-BD")}</p>
                <span className="text-[10px] text-slate-400 font-bold block">
                  কোর্স ফি ও ভর্তি বাবদ মোট আয়
                </span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 shadow-md hover:border-[#F59E0B]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">মোট প্রদেয় বেতন (Salary Given)</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-400">৳{totalSalaryGiven.toLocaleString("bn-BD")}</p>
                <span className="text-[10px] text-slate-400 font-bold block">
                  শিক্ষক সম্মানী ও স্টাফ সর্বমোট বেতন
                </span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2 shadow-md hover:border-[#F59E0B]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">মোট খরচ / ব্যয় (Total Expense)</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <PieChart className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-purple-300">৳{totalExpense.toLocaleString("bn-BD")}</p>
                <span className="text-[10px] text-purple-400 font-bold block">
                  বিজ্ঞাপন, ভেন্যু ও অবকাঠামো খরচ
                </span>
              </div>
            </div>

            {/* REVENUE BREAKDOWN BY CATEGORY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-3">
                <span className="text-xs font-bold text-slate-400 block">অনলাইন কোর্স বিক্রয় আয়</span>
                <p className="text-xl font-extrabold text-white">৳০</p>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#F59E0B] h-full w-0" />
                </div>
                <span className="text-[10px] text-slate-500 block">প্রাথমিক অবস্থা (০%)</span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-3">
                <span className="text-xs font-bold text-slate-400 block">ওএমআর সেন্ট্রাল মক টেস্ট ফি</span>
                <p className="text-xl font-extrabold text-white">৳০</p>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-0" />
                </div>
                <span className="text-[10px] text-slate-500 block">প্রাথমিক অবস্থা (০%)</span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-3">
                <span className="text-xs font-bold text-slate-400 block">ডিফেন্স গাইড বই ও নোট বুক</span>
                <p className="text-xl font-extrabold text-white">৳০</p>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full w-0" />
                </div>
                <span className="text-[10px] text-slate-500 block">প্রাথমিক অবস্থা (০%)</span>
              </div>
            </div>

            {/* EXPENSE & SALARY LEDGER TABLE (WHOM TO GIVEN) */}
            <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#F59E0B]" />
                  <span>কাকে কত বেতন ও সম্মানী প্রদান করা হয়েছে (Salary & Expense Ledger)</span>
                </h3>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="প্রাপক বা খাতের বিবরণ খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 bg-[#07182E] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-slate-400 pb-2">
                      <th className="pb-3">প্রাপকের নাম (Recipient)</th>
                      <th className="pb-3">ভূমিকা/পদবী</th>
                      <th className="pb-3">খাত / খরচের বিবরণ</th>
                      <th className="pb-3">পরিমাণ (৳)</th>
                      <th className="pb-3">তারিখ</th>
                      <th className="pb-3 text-right">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#163255] border border-white/10 flex items-center justify-center font-bold text-[#F59E0B] text-xs">
                              {item.recipient[0]}
                            </div>
                            <span>{item.recipient}</span>
                          </td>

                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                              {item.role}
                            </span>
                          </td>

                          <td className="py-3 text-slate-300">{item.purpose}</td>

                          <td className="py-3 font-bold text-[#F59E0B] font-mono text-sm">
                            ৳{item.amount.toLocaleString("bn-BD")}
                          </td>

                          <td className="py-3 text-slate-400 font-mono">{item.date}</td>

                          <td className="py-3 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 space-y-2">
                          <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                          <p className="font-bold text-slate-300">প্রাথমিকভাবে কোনো আর্থিক লেনদেন বা খরচের এন্ট্রি নেই।</p>
                          <p className="text-[11px] text-slate-500">
                            'নতুন বেতন / খরচ এন্ট্রি যোগ করুন' বোতাম চেপে নতুন পরিশোধ হিসেব এন্ট্রি করুন।
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB: USER ROLES MANAGEMENT (FULL USER CRUD: CREATE, READ, UPDATE, DELETE) */}
        {activeTab === "users" && (
          <section id="users" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F59E0B]" />
                <span>ইউজার রোল ম্যানেজমেন্ট ও সিকিউর অ্যাক্সেস পারমিশন</span>
              </h3>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: "all", label: `সকল ইউজার (${usersList.length})` },
                  { id: "admin", label: `অ্যাডমিন (${usersList.filter(u => u.role.toLowerCase().includes("admin")).length})` },
                  { id: "teacher", label: `শিক্ষক (${usersList.filter(u => u.role.toLowerCase() === "teacher").length})` },
                  { id: "accountant", label: `একাউন্ট্যান্ট (${usersList.filter(u => u.role.toLowerCase() === "accountant").length})` },
                  { id: "student", label: `শিক্ষার্থী (${usersList.filter(u => u.role.toLowerCase() === "student").length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRoleFilter(f.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      roleFilter === f.id
                        ? "bg-[#F59E0B] text-black shadow-md"
                        : "bg-[#07182E] text-slate-300 hover:text-white border border-white/10"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="নাম বা ইমেল দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-[#07182E] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* User List Table with FULL CRUD (Role select, Edit, Delete) */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 pb-2 text-left text-slate-400">
                    <th className="pb-3">ইউজার নাম</th>
                    <th className="pb-3">ইমেল ঠিকানা</th>
                    <th className="pb-3">বর্তমান রোল ও অ্যাক্সেস পারমিশন</th>
                    <th className="pb-3 text-right">আকশন / কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#163255] border border-white/10 flex items-center justify-center font-bold text-[#F59E0B] text-xs">
                            {u.full_name ? u.full_name[0] : "U"}
                          </div>
                          <span>{u.full_name}</span>
                        </td>

                        <td className="py-3 font-mono text-slate-300">{u.email}</td>

                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider border inline-block ${
                              u.role.toLowerCase().includes("admin")
                                ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40"
                                : u.role.toLowerCase() === "teacher"
                                ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                                : u.role.toLowerCase() === "accountant"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {u.role}
                          </span>

                          {/* Access Badge List */}
                          {u.role.toLowerCase().includes("admin") && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap text-[9px] text-slate-400 font-medium">
                              <span className="bg-[#07182E] px-1.5 py-0.5 rounded border border-white/10 text-emerald-400">কোর্স অ্যাক্সেস</span>
                              <span className="bg-[#07182E] px-1.5 py-0.5 rounded border border-white/10 text-emerald-400">সাকসেস স্টোরি</span>
                              <span className="bg-[#07182E] px-1.5 py-0.5 rounded border border-white/10 text-emerald-400">অডিট ট্রেইল</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role.toLowerCase() === "super admin" || isSuperAdminEmail(u.email) ? (
                              <span className="px-3 py-1.5 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] font-extrabold border border-[#F59E0B]/40 text-xs inline-flex items-center gap-1.5 shadow-sm">
                                <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                                <span>Super Admin (প্রধান অ্যাডমিন - সুরক্ষিত)</span>
                              </span>
                            ) : (
                              <>
                                {/* Role Select Dropdown (Update Role) */}
                                <select
                                  value={u.role.toLowerCase().includes("admin") ? "admin" : u.role}
                                  onChange={(e) => handleRoleReassignment(u.id, e.target.value)}
                                  className="bg-[#07182E] border border-[#F59E0B]/40 text-[#F59E0B] font-bold text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-[#F59E0B] cursor-pointer shadow-sm hover:bg-[#0E2038] transition-all"
                                >
                                  <option value="admin" className="bg-[#0E2038] text-white">Admin (অ্যাডমিন)</option>
                                  <option value="teacher" className="bg-[#0E2038] text-white">Teacher (শিক্ষক)</option>
                                  <option value="accountant" className="bg-[#0E2038] text-white">Accountant (একাউন্ট্যান্ট)</option>
                                  <option value="student" className="bg-[#0E2038] text-white">Student (শিক্ষার্থী)</option>
                                </select>

                                {/* Edit User Button */}
                                <button
                                  onClick={() => handleOpenEditUserModal(u)}
                                  title="ইউজার তথ্য সম্পাদনা করুন"
                                  className="p-2 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 rounded-xl text-[#F59E0B] transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete User Button */}
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.full_name)}
                                  title="ইউজার ডিলিট করুন"
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        কোনো ইউজার পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB: COURSES MANAGEMENT */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#F59E0B]" />
                  <span>বর্তমান ডিফেন্স কোর্সসমূহ (মোট {courses.length}টি)</span>
                </h3>

                <a
                  href="/courses"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#F59E0B] hover:underline font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                </a>
              </div>

              <div className="space-y-4">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#07182E] p-4 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 text-xs shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">
                            {c.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/30">
                            {c.categoryLabel}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1">{c.tagline}</p>
                      </div>

                      <button
                        onClick={() => handleToggleCoursePublish(c)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 ${
                          c.published !== false
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {c.published !== false ? "পাবলিশড" : "আনপাবলিশড"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-slate-400 block">মূল্য:</span>
                        <strong className="text-[#F59E0B]">৳{c.price.toLocaleString("bn-BD")}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">ফরম্যাট:</span>
                        <strong className="text-white capitalize">{c.detailLayout || "standard"}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">কোর্সের মাধ্যম:</span>
                        <strong className="text-amber-400">
                          {c.courseMode === "online"
                            ? "🌐 অনলাইন"
                            : c.courseMode === "offline"
                            ? "🏫 অফলাইন"
                            : "🌐 অনলাইন ও 🏫 অফলাইন"}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">ভিডিও প্রিভিউ:</span>
                        <strong className={c.videoUrl ? "text-emerald-400" : "text-slate-500"}>
                          {c.videoUrl ? "যুক্ত আছে" : "নেই"}
                        </strong>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <a
                          href={`/courses/${c.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="কোর্স পেজ প্রিভিউ"
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEditCourseModal(c)}
                          title="সম্পাদনা করুন (Update)"
                          className="p-1.5 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 rounded-lg text-[#F59E0B]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          title="ডিলিট করুন (Delete)"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Assigned Teachers Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5 text-[10px]">
                      <span className="text-slate-400 font-bold">দায়িত্বপ্রাপ্ত শিক্ষক:</span>
                      {c.teacherEmails && c.teacherEmails.length > 0 ? (
                        c.teacherEmails.map((email, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 font-mono"
                          >
                            {email}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">সকল শিক্ষক (সকলের জন্য উন্মুক্ত)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F59E0B]" />
                <span>নতুন ডিফেন্স কোর্স যোগ করুন</span>
              </h3>

              <form onSubmit={handleAddCourseSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">ক্যাটাগরি:*</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  >
                    <option value="defense">ডিফেন্স ও মিলিটারি (BAFA, BMA, BN, ISSB)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্সের নাম (Title):*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: BAFA Preliminary Course"
                    value={newCourse.title || ""}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্স ট্যাগলাইন/সাবটাইটেল:</label>
                  <input
                    type="text"
                    placeholder="যেমন: বিমান বাহিনী লিখিত ও মেধা পরীক্ষা কভারেজ"
                    value={newCourse.tagline || ""}
                    onChange={(e) => setNewCourse({ ...newCourse, tagline: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">নির্ধারিত ফি (৳):*</label>
                    <input
                      type="number"
                      required
                      placeholder="8500"
                      value={newCourse.price || ""}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })
                      }
                      className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">আসল মূল্য (৳):</label>
                    <input
                      type="number"
                      placeholder="14000"
                      value={newCourse.originalPrice || ""}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          originalPrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">ডিটেইল পেজ ফরম্যাট / লেআউট:*</label>
                  <select
                    value={newCourse.detailLayout || "standard"}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        detailLayout: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  >
                    <option value="standard">Standard Split Layout</option>
                    <option value="video_hero">Video-Focused Hero Layout</option>
                    <option value="modern_split">Modern Tabbed Layout</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্সের মাধ্যম / ফরম্যাট (Mode):*</label>
                  <select
                    value={newCourse.courseMode || "both"}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        courseMode: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  >
                    <option value="both">🌐 + 🏫 অনলাইন ও অফলাইন (উভয়ই)</option>
                    <option value="online">🌐 শুধুমাত্র অনলাইন (Online Only)</option>
                    <option value="offline">🏫 শুধুমাত্র অফলাইন (Offline Only)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">ভিডিও লিংক (ইউটিউব/ভিমিও - ঐচ্ছিক):</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newCourse.videoUrl || ""}
                    onChange={(e) => setNewCourse({ ...newCourse, videoUrl: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">ছবি URL (Image Link):</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newCourse.imageUrl || ""}
                    onChange={(e) => setNewCourse({ ...newCourse, imageUrl: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্স বিস্তারিত বিবরণ:</label>
                  <textarea
                    rows={3}
                    placeholder="কোর্সের পূর্ণাঙ্গ বিস্তারিত তথ্য লিখুন..."
                    value={newCourse.description || ""}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, description: e.target.value })
                    }
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্স ফিচারসমূহ (প্রতি লাইনে একটি):</label>
                  <textarea
                    rows={3}
                    placeholder="১০০+ লাইভ ক্লাস&#10;৫০+ ডেইলি ওএমআর এক্সাম&#10;১-অন-১ ডাউট সলভ"
                    value={featuresInput}
                    onChange={(e) => setFeaturesInput(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">মেন্টরদের নাম (কমা দিয়ে আলাদা করুন):</label>
                  <input
                    type="text"
                    placeholder="মেজর (অব.) সাজ্জাদ, ইঞ্জি. তাসনিম আহমেদ"
                    value={instructorsInput}
                    onChange={(e) => setInstructorsInput(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                {/* Multi-Select Teacher Assignment */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-[#F59E0B] flex items-center justify-between">
                    <span>দায়িত্বপ্রাপ্ত শিক্ষক অ্যাকাউন্টসমূহ (Assign Teachers):</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({newCourseTeacherEmails.length} জন নির্বাচিত)
                    </span>
                  </label>

                  <div className="bg-[#07182E] border border-white/10 rounded-xl p-3 space-y-1.5 max-h-36 overflow-y-auto">
                    {usersList.filter(
                      (u) =>
                        u.role.toLowerCase().includes("teacher") ||
                        u.role.toLowerCase().includes("instructor")
                    ).length > 0 ? (
                      usersList
                        .filter(
                          (u) =>
                            u.role.toLowerCase().includes("teacher") ||
                            u.role.toLowerCase().includes("instructor")
                        )
                        .map((t) => {
                          const isSelected = newCourseTeacherEmails.includes(t.email.toLowerCase());
                          return (
                            <div
                              key={t.id || t.email}
                              onClick={() => {
                                const emailLower = t.email.toLowerCase();
                                if (isSelected) {
                                  setNewCourseTeacherEmails(
                                    newCourseTeacherEmails.filter((e) => e !== emailLower)
                                  );
                                } else {
                                  setNewCourseTeacherEmails([...newCourseTeacherEmails, emailLower]);
                                }
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                                isSelected
                                  ? "bg-[#F59E0B]/20 border-[#F59E0B]/50 text-white"
                                  : "bg-[#0D2038] border-white/5 text-slate-300 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="accent-[#F59E0B] rounded pointer-events-none"
                                />
                                <span className="font-bold text-xs">{t.full_name}</span>
                                <span className="text-[10px] text-slate-400">({t.email})</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-slate-400 text-xs py-1">কোনো নিবন্ধিত শিক্ষক অ্যাকাউন্ট পাওয়া যায়নি।</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-black bg-[#F59E0B] rounded-xl hover:brightness-110 transition shadow-lg mt-2"
                >
                  নতুন কোর্স সেভ করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: STUDENT SUCCESS STORIES */}
        {activeTab === "stories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  <span>কৃতি শিক্ষার্থী সাকসেস স্টোরিস (মোট {successStories.length}টি)</span>
                </h3>

                <a
                  href="/success-stories"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#F59E0B] hover:underline font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                </a>
              </div>

              <div className="space-y-4">
                {successStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-[#07182E] p-4 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 text-xs shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">
                            {story.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/30">
                            {story.rank}
                          </span>
                        </div>
                        <p className="text-emerald-400 text-[11px] font-semibold">
                          {story.institution}
                        </p>
                        <p className="text-slate-400 text-[11px] italic line-clamp-1">
                          "{story.quote}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleStoryPublish(story)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 ${
                          story.published !== false
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {story.published !== false ? "পাবলিশড" : "আনপাবলিশড"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-slate-400">কলেজ: </span>
                        <strong>{story.hscCollege}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingStory(story)}
                          title="সম্পাদনা করুন"
                          className="p-1.5 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 rounded-lg text-[#F59E0B]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id, story.name)}
                          title="ডিলিট করুন"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F59E0B]" />
                <span>নতুন কৃতি শিক্ষার্থী যোগ করুন</span>
              </h3>

              <form onSubmit={handleAddStorySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">ক্যাটাগরি:*</label>
                  <select
                    value={newStory.category || "bafa"}
                    onChange={(e) => setNewStory({ ...newStory, category: e.target.value as any })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  >
                    <option value="bafa">BAFA (বিমান বাহিনী)</option>
                    <option value="bma">BMA (সেনাবাহিনী)</option>
                    <option value="bn">BN (নৌবাহিনী)</option>
                    <option value="issb">ISSB (গ্রিন কার্ড)</option>
                    <option value="general">সাধারণ মেধা</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর নাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ক্যাডেট ফাহিম রেজওয়ান"
                    value={newStory.name || ""}
                    onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">মেধা স্থান/র‍্যাংক:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মেধা স্থান: ০১ (ফ্লাইট ক্যাডেট)"
                    value={newStory.rank || ""}
                    onChange={(e) => setNewStory({ ...newStory, rank: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">প্রতিষ্ঠানের নাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বাংলাদেশ বিমান বাহিনী (BAFA 88th Officer)"
                    value={newStory.institution || ""}
                    onChange={(e) => setNewStory({ ...newStory, institution: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">এইচএসসি কলেজ/শিক্ষা প্রতিষ্ঠান:</label>
                  <input
                    type="text"
                    placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                    value={newStory.hscCollege || ""}
                    onChange={(e) => setNewStory({ ...newStory, hscCollege: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">প্রোগ্রাম/কোর্সের নাম:</label>
                  <input
                    type="text"
                    placeholder="যেমন: BAFA Officer Cadet Course"
                    value={newStory.program || ""}
                    onChange={(e) => setNewStory({ ...newStory, program: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">স্কোর/মার্কস:</label>
                  <input
                    type="text"
                    placeholder="যেমন: আইকিউ স্কোর: ৯৮/১০০"
                    value={newStory.score || ""}
                    onChange={(e) => setNewStory({ ...newStory, score: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">ছবি URL (Image Link):</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newStory.imageUrl || ""}
                    onChange={(e) => setNewStory({ ...newStory, imageUrl: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর উক্তি / রিভিউ (Quote):</label>
                  <textarea
                    rows={3}
                    placeholder="দুর্বার একাডেমির স্পেশাল গাইডলাইন আমার স্বপ্নের মূল ভিত্তি ছিল..."
                    value={newStory.quote || ""}
                    onChange={(e) => setNewStory({ ...newStory, quote: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-black bg-[#F59E0B] rounded-xl hover:brightness-110 transition shadow-lg mt-2"
                >
                  সাকসেস স্টোরি সেভ করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: AUDIT LOGS WITH 15-LOG PAGINATION & AUTOMATIC 30-DAY RETENTION */}
        {activeTab === "audit" && (
          <section id="audit" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
                  <span>অডিট ট্রেইল ও সর্বজনীন সিস্টেম লগস</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  সিস্টেমের সমস্ত অ্যাডমিন, শিক্ষক ও ইউজার অ্যাক্টিভিটি অটোমেটিক ট্র্যাক হয়।
                </p>
              </div>

              {/* 30-Day Retention Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>৩০ দিনের স্বয়ংক্রিয় রিটেনশন পলিসি (Auto Purge)</span>
              </div>
            </div>

            {/* Log Items Grid List */}
            <div className="space-y-3">
              {paginatedAuditLogs.length > 0 ? (
                paginatedAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-[#07182E] rounded-2xl border border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-[#F59E0B]/30 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{log.action}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.role.toLowerCase().includes("admin")
                              ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                              : log.role === "teacher"
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              : log.role === "system"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {log.role}
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed">{log.details}</p>

                      <span className="text-[11px] text-slate-400 block font-medium">
                        সম্পাদনকারী: <strong className="text-white">{log.actor}</strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono shrink-0 bg-[#0D2038] px-3 py-1.5 rounded-xl border border-white/5 h-fit">
                      {new Date(log.timestamp).toLocaleString("bn-BD", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-[#07182E] rounded-2xl border border-white/10 text-slate-400">
                  কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।
                </div>
              )}
            </div>

            {/* Pagination Controls (15 Logs per page) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs">
              <span className="text-slate-400">
                মোট <strong className="text-white">{auditLogs.length}</strong> টি ট্র্যাকিং লগের মধ্যে{" "}
                <strong className="text-[#F59E0B]">
                  {(auditCurrentPage - 1) * logsPerPage + 1} -{" "}
                  {Math.min(auditCurrentPage * logsPerPage, auditLogs.length)}
                </strong>{" "}
                প্রদর্শিত হচ্ছে।
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={auditCurrentPage === 1}
                  onClick={() => setAuditCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1 ${
                    auditCurrentPage === 1
                      ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
                      : "bg-[#07182E] text-slate-300 hover:text-white border-white/10 hover:border-[#F59E0B]"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>

                <span className="px-3 py-1.5 bg-[#07182E] border border-white/10 rounded-xl font-extrabold text-[#F59E0B]">
                  পৃষ্ঠা {auditCurrentPage} / {totalAuditPages}
                </span>

                <button
                  disabled={auditCurrentPage === totalAuditPages}
                  onClick={() => setAuditCurrentPage((prev) => Math.min(prev + 1, totalAuditPages))}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1 ${
                    auditCurrentPage === totalAuditPages
                      ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
                      : "bg-[#07182E] text-slate-300 hover:text-white border-white/10 hover:border-[#F59E0B]"
                  }`}
                >
                  <span>পরবর্তী</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PAYMENT DETAILS MANAGEMENT TAB */}
        {activeTab === "payment" && (
          <section className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-[#F59E0B]" />
                  <span>শিক্ষার্থীদের পেমেন্ট অ্যাকাউন্ট ও নম্বর পরিচালনা (Payment Details)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  bKash (Personal/Agent/Merchant), Nagad, Rocket এবং ব্যাংকের বিস্তারিত তথ্য (ব্যাংক নাম, অ্যাকাউন্ট নাম, অ্যাকাউন্ট নম্বর, শাখা, জেলা ও রাউটিং নম্বর) নিয়ন্ত্রণ করুন।
                </p>
              </div>
              <DashboardHeader role="admin" />
            </div>

            {/* SUMMARY STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">সক্রিয় পেমেন্ট অ্যাকাউন্ট</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-400">{activePaymentCount}টি</p>
                <span className="text-[10px] text-slate-400 font-bold block">শিক্ষার্থীরা ভর্তি পোর্টালে দেখবে</span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">bKash (বিকাশ) অ্যাকাউন্ট</span>
                  <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <Phone className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-pink-400">{bkashPaymentCount}টি</p>
                <span className="text-[10px] text-pink-300 font-bold block">পার্সোনাল, এজেন্ট ও মার্চেন্ট</span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Nagad (নগদ) অ্যাকাউন্ট</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Phone className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-amber-400">{nagadPaymentCount}টি</p>
                <span className="text-[10px] text-amber-300 font-bold block">পার্সোনাল ও মার্চেন্ট নম্বর</span>
              </div>

              <div className="bg-[#0D2038] border border-white/10 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ব্যাংক অ্যাকাউন্ট তথ্য</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Landmark className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-400">{bankPaymentCount}টি</p>
                <span className="text-[10px] text-blue-300 font-bold block">EFT/NPSB ব্যাংক ট্রান্সফার</span>
              </div>
            </div>

            {/* FILTER BAR & ADD ACTION */}
            <div className="bg-[#0D2038] border border-white/10 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {[
                  { id: "all", label: "সকল অ্যাকাউন্ট" },
                  { id: "bkash", label: "bKash (বিকাশ)" },
                  { id: "nagad", label: "Nagad (নগদ)" },
                  { id: "bank", label: "কার্ড / ব্যাংক" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPaymentMethodFilter(f.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      paymentMethodFilter === f.id
                        ? "bg-[#F59E0B] text-black shadow-lg"
                        : "bg-[#07182E] text-slate-300 hover:text-white border border-white/10"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search & Add Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="নম্বর, ব্যাংক বা শিরোনাম খুঁজুন..."
                    value={paymentSearchQuery}
                    onChange={(e) => setPaymentSearchQuery(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <button
                  onClick={handleOpenAddPaymentModal}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#FACC15] text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন পেমেন্ট অ্যাকাউন্ট যুক্ত করুন</span>
                </button>
              </div>
            </div>

            {/* PAYMENT CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPaymentDetails.length > 0 ? (
                filteredPaymentDetails.map((item) => {
                  const isBkash = item.method_type === "bkash";
                  const isNagad = item.method_type === "nagad";
                  const isBank = item.method_type === "bank";

                  return (
                    <div
                      key={item.id}
                      className={`bg-[#0D2038] border rounded-3xl p-6 space-y-5 shadow-xl relative transition-all ${
                        item.is_active ? "border-white/10 hover:border-[#F59E0B]/50" : "border-red-500/20 opacity-70"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Method Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isBkash
                                  ? "bg-pink-500/10 text-pink-400 border-pink-500/30"
                                  : isNagad
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : isBank
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              }`}
                            >
                              {item.method_type}
                            </span>

                            {/* Account Category Badge */}
                            {item.account_type && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10 capitalize">
                                {item.account_type === "personal"
                                  ? "পার্সোনাল (Personal)"
                                  : item.account_type === "agent"
                                  ? "এজেন্ট (Agent)"
                                  : item.account_type === "merchant"
                                  ? "মার্চেন্ট / পেমেন্ট"
                                  : "ব্যাংক অ্যাকাউন্ট"}
                              </span>
                            )}

                            {/* Active/Inactive Status */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                item.is_active
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                              <span>{item.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white pt-1">{item.title}</h3>
                        </div>
                      </div>

                      {/* Details Section */}
                      {isBank ? (
                        /* BANK DETAILS DISPLAY */
                        <div className="bg-[#07182E] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                          <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-slate-400 font-medium">ব্যাংকের নাম:</span>
                            <span className="text-white font-bold">{item.bank_name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-slate-400 font-medium">হিসাবধারীর নাম (Account Name):</span>
                            <span className="text-[#F59E0B] font-bold">{item.account_holder_name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-slate-400 font-medium">অ্যাকাউন্ট নম্বর:</span>
                            <span className="text-white font-mono font-extrabold text-sm">{item.account_number || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-slate-400 font-medium">শাখা (Branch) ও জেলা:</span>
                            <span className="text-slate-300 font-medium">
                              {item.branch_name ? `${item.branch_name}, ${item.district || ""}` : item.district || "N/A"}
                            </span>
                          </div>
                          {item.routing_number && (
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">রাউটিং নম্বর (Routing No):</span>
                              <span className="text-emerald-400 font-mono font-bold">{item.routing_number}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* MOBILE BANKING DETAILS DISPLAY */
                        <div className="bg-[#07182E] p-4 rounded-2xl border border-white/5 space-y-2">
                          <span className="text-[11px] text-slate-400 block font-medium">
                            পেমেন্ট / ক্যাশ আউট / সেন্ড মানি নম্বর:
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-black font-mono text-[#F59E0B] tracking-wider">
                              {item.mobile_number || "নম্বর প্রদান করা হয়নি"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      {item.instructions && (
                        <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider block">
                            শিক্ষার্থীদের জন্য নির্দেশনা:
                          </span>
                          <p className="leading-relaxed">{item.instructions}</p>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleTogglePaymentStatus(item.id, item.is_active, item.title)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                            item.is_active
                              ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          }`}
                        >
                          {item.is_active ? <ToggleRight className="w-4 h-4 text-amber-400" /> : <ToggleLeft className="w-4 h-4 text-emerald-400" />}
                          <span>{item.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditPaymentModal(item)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                            title="এডিট করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(item.id, item.title)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16 bg-[#0D2038] rounded-3xl border border-white/10 space-y-3">
                  <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm font-medium">
                    কোনো পেমেন্ট অ্যাকাউন্ট পাওয়া যায়নি। "+ নতুন পেমেন্ট অ্যাকাউন্ট যুক্ত করুন" বাটনে ক্লিক করে তথ্য যোগ করুন।
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ADD NEW EXPENSE PAYOUT MODAL */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0F2644] to-[#08182D] border border-[#F59E0B]/30 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] relative transform transition-all duration-300 my-auto">
            <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent shadow-[0_0_10px_#F59E0B]" />
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-inner">
                  <Coins className="w-5 h-5" />
                </div>
                <span>নতুন আয় / বেতন / খরচ এন্ট্রি যুক্ত করুন</span>
              </h3>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">প্রাপক বা উৎসের নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ড. সাজ্জাদ বা কোর্স সেলস ইনকাম"
                  value={newExpense.recipient}
                  onChange={(e) => setNewExpense({ ...newExpense, recipient: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ভূমিকা / পদবী / খাত টাইপ:*</label>
                <select
                  value={newExpense.role}
                  onChange={(e) => setNewExpense({ ...newExpense, role: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                >
                  <option value="কোর্স সেলস ইনকাম">কোর্স সেলস ইনকাম (Income)</option>
                  <option value="শিক্ষক/মেন্টর">শিক্ষক/মেন্টর (Teacher Salary)</option>
                  <option value="অ্যাডমিন ২">অ্যাডমিন ২ / সহকারী অ্যাডমিন (Admin Salary)</option>
                  <option value="একাউন্ট্যান্ট">একাউন্ট্যান্ট (Accountant Salary)</option>
                  <option value="মার্কেটিং এজেন্সি">মার্কেটিং ও বিজ্ঞাপন (Marketing)</option>
                  <option value="ভেন্যু পার্টনার">ভেন্যু পার্টনার (Venue Expense)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">পরিমাণ (৳):*</label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: 50000"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">খাত / বিবরণ:</label>
                <textarea
                  rows={3}
                  placeholder="যেমন: কোর্স ভর্তি ফি বা মক টেস্ট ভেন্যু খরচ..."
                  value={newExpense.purpose}
                  onChange={(e) => setNewExpense({ ...newExpense, purpose: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:brightness-110 shadow-lg"
                >
                  এন্ট্রি সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* EDIT USER DETAILS MODAL (USER UPDATE) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0F2644] to-[#08182D] border border-[#F59E0B]/30 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] relative transform transition-all duration-300 my-auto">
            <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent shadow-[0_0_10px_#F59E0B]" />
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-inner">
                  <Edit className="w-5 h-5" />
                </div>
                <span>ইউজার তথ্য সম্পাদনা করুন</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">ইউজারের নাম:*</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ইমেল ঠিকানা:*</label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">নির্ধারিত রোল (User Role):*</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                >
                  <option value="Admin 2">Admin (অ্যাডমিন)</option>
                  <option value="teacher">Teacher (শিক্ষক / মেন্টর)</option>
                  <option value="accountant">Accountant (একাউন্ট্যান্ট)</option>
                  <option value="student">Student (শিক্ষার্থী)</option>
                </select>
              </div>



              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:brightness-110 shadow-lg"
                >
                  পরিবর্তন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0F2644] to-[#08182D] border border-[#F59E0B]/30 rounded-3xl p-6 sm:p-7 max-w-2xl w-full space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] relative transform transition-all duration-300 my-auto">
            <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent shadow-[0_0_10px_#F59E0B]" />
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-inner">
                  <Edit className="w-5 h-5" />
                </div>
                <span>কোর্স সম্পাদনা করুন: {editingCourse.title}</span>
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCourse} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-2">
              <div>
                <label className="font-bold text-slate-300 block mb-1">ক্যাটাগরি:</label>
                <select
                  value={editingCourse.category}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                >
                  <option value="defense">ডিফেন্স ও মিলিটারি (BAFA, BMA, BN, ISSB)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">কোর্সের নাম:</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, title: e.target.value })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ট্যাগলাইন:</label>
                <input
                  type="text"
                  value={editingCourse.tagline}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, tagline: e.target.value })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-[#F59E0B] block mb-1">মূল্য (৳):</label>
                  <input
                    type="number"
                    required
                    value={editingCourse.price}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">আসল মূল্য (৳):</label>
                  <input
                    type="number"
                    value={editingCourse.originalPrice}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        originalPrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ডিটেইল পেজ ফরম্যাট:</label>
                <select
                  value={editingCourse.detailLayout || "standard"}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      detailLayout: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                >
                  <option value="standard">Standard Split Layout</option>
                  <option value="video_hero">Video-Focused Hero Layout</option>
                  <option value="modern_split">Modern Tabbed Layout</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">কোর্সের মাধ্যম / ফরম্যাট (Mode):*</label>
                <select
                  value={editingCourse.courseMode || "both"}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      courseMode: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                >
                  <option value="both">🌐 + 🏫 অনলাইন ও অফলাইন (উভয়ই)</option>
                  <option value="online">🌐 শুধুমাত্র অনলাইন (Online Only)</option>
                  <option value="offline">🏫 শুধুমাত্র অফলাইন (Offline Only)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ভিডিও লিংক (YouTube / Vimeo):</label>
                <input
                  type="url"
                  value={editingCourse.videoUrl || ""}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, videoUrl: e.target.value })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ছবি URL:</label>
                <input
                  type="text"
                  value={editingCourse.imageUrl || ""}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, imageUrl: e.target.value })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">বিবরণ (Description):</label>
                <textarea
                  rows={4}
                  value={editingCourse.description || ""}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, description: e.target.value })
                  }
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ফিচারসমূহ (প্রতি লাইনে একটি):</label>
                <textarea
                  rows={3}
                  value={editFeaturesInput}
                  onChange={(e) => setEditFeaturesInput(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">মেন্টরদের নাম (কমা দিয়ে পৃথক):</label>
                <input
                  type="text"
                  value={editInstructorsInput}
                  onChange={(e) => setEditInstructorsInput(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              {/* Multi-Select Teacher Assignment for Edit Modal */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-[#F59E0B] flex items-center justify-between">
                  <span>দায়িত্বপ্রাপ্ত শিক্ষক অ্যাকাউন্টসমূহ (Assign Teachers):</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({editCourseTeacherEmails.length} জন নির্বাচিত)
                  </span>
                </label>

                <div className="bg-[#07182E] border border-white/10 rounded-xl p-3 space-y-1.5 max-h-36 overflow-y-auto">
                  {usersList.filter(
                    (u) =>
                      u.role.toLowerCase().includes("teacher") ||
                      u.role.toLowerCase().includes("instructor")
                  ).length > 0 ? (
                    usersList
                      .filter(
                        (u) =>
                          u.role.toLowerCase().includes("teacher") ||
                          u.role.toLowerCase().includes("instructor")
                      )
                      .map((t) => {
                        const isSelected = editCourseTeacherEmails.includes(t.email.toLowerCase());
                        return (
                          <div
                            key={t.id || t.email}
                            onClick={() => {
                              const emailLower = t.email.toLowerCase();
                              if (isSelected) {
                                setEditCourseTeacherEmails(
                                  editCourseTeacherEmails.filter((e) => e !== emailLower)
                                );
                              } else {
                                setEditCourseTeacherEmails([...editCourseTeacherEmails, emailLower]);
                              }
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                              isSelected
                                ? "bg-[#F59E0B]/20 border-[#F59E0B]/50 text-white"
                                : "bg-[#0D2038] border-white/5 text-slate-300 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="accent-[#F59E0B] rounded pointer-events-none"
                              />
                              <span className="font-bold text-xs">{t.full_name}</span>
                              <span className="text-[10px] text-slate-400">({t.email})</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-slate-400 text-xs py-1">কোনো নিবন্ধিত শিক্ষক অ্যাকাউন্ট পাওয়া যায়নি।</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:brightness-110"
                >
                  পরিবর্তন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STORY MODAL */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0F2644] to-[#08182D] border border-[#F59E0B]/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] relative transform transition-all duration-300 my-auto">
            <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent shadow-[0_0_10px_#F59E0B]" />
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-inner">
                  <Edit className="w-5 h-5" />
                </div>
                <span>সাকসেস স্টোরি সম্পাদনা: {editingStory.name}</span>
              </h3>
              <button
                onClick={() => setEditingStory(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedStory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">ক্যাটাগরি:</label>
                <select
                  value={editingStory.category || "bafa"}
                  onChange={(e) => setEditingStory({ ...editingStory, category: e.target.value as any })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                >
                  <option value="bafa">BAFA (বিমান বাহিনী)</option>
                  <option value="bma">BMA (সেনাবাহিনী)</option>
                  <option value="bn">BN (নৌবাহিনী)</option>
                  <option value="issb">ISSB (গ্রিন কার্ড)</option>
                  <option value="general">সাধারণ মেধা</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  required
                  value={editingStory.name}
                  onChange={(e) => setEditingStory({ ...editingStory, name: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">মেধা স্থান/র‍্যাংক:</label>
                <input
                  type="text"
                  required
                  value={editingStory.rank}
                  onChange={(e) => setEditingStory({ ...editingStory, rank: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">প্রতিষ্ঠানের নাম:</label>
                <input
                  type="text"
                  required
                  value={editingStory.institution}
                  onChange={(e) => setEditingStory({ ...editingStory, institution: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">উক্তি (Quote):</label>
                <textarea
                  rows={3}
                  value={editingStory.quote}
                  onChange={(e) => setEditingStory({ ...editingStory, quote: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#F59E0B] text-[#000000] font-bold rounded-xl hover:brightness-110"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PAYMENT DETAIL MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0D2038] border border-white/15 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>পেমেন্ট অ্যাকাউন্ট ম্যানেজার</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {editingPayment ? "পেমেন্ট অ্যাকাউন্টের তথ্য এডিট করুন" : "নতুন পেমেন্ট অ্যাকাউন্ট যুক্ত করুন"}
              </h3>
              <p className="text-xs text-slate-300">
                ভর্তি ফর্মে শিক্ষার্থীদের দেখানোর জন্য মোবাইল ব্যাংকিং অথবা ব্যাংক ডিপোজিটের সঠিক তথ্য পূরণ করুন।
              </p>
            </div>

            <form onSubmit={handleSavePaymentForm} className="space-y-4 text-xs">
              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">পেমেন্ট মেথড টাইপ:*</label>
                <select
                  value={paymentForm.method_type}
                  onChange={(e) => {
                    const method = e.target.value as any;
                    setPaymentForm((prev) => ({
                      ...prev,
                      method_type: method,
                      account_type: method === "bank" ? "bank_account" : prev.account_type === "bank_account" ? "personal" : prev.account_type,
                      title: prev.title || (method === "bkash" ? "bKash (বিকাশ) পার্সোনাল" : method === "nagad" ? "Nagad (নগদ) পার্সোনাল" : method === "bank" ? "ডাচ-বাংলা ব্যাংক লিমিটেড" : "পেমেন্ট নম্বর"),
                    }));
                  }}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                >
                  <option value="bkash">bKash (বিকাশ)</option>
                  <option value="nagad">Nagad (নগদ)</option>
                  <option value="rocket">Rocket (রকেট)</option>
                  <option value="bank">কার্ড / ব্যাংক (Bank Deposit / EFT)</option>
                  <option value="other">অন্যান্য (Other Method)</option>
                </select>
              </div>

              {/* Title / Label */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">পেমেন্ট অ্যাকাউন্ট শিরোনাম (Title):*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: bKash Personal 01 অথবা DBBL Bank Account"
                  value={paymentForm.title}
                  onChange={(e) => setPaymentForm({ ...paymentForm, title: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                />
              </div>

              {/* Dynamic Fields for Mobile Banking vs Bank */}
              {paymentForm.method_type !== "bank" ? (
                <>
                  {/* Account Category (Personal / Agent / Merchant) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">নম্বরের ধরণ (Category):*</label>
                      <select
                        value={paymentForm.account_type}
                        onChange={(e) => setPaymentForm({ ...paymentForm, account_type: e.target.value as any })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                      >
                        <option value="personal">পার্সোনাল (Personal)</option>
                        <option value="agent">এজেন্ট (Agent)</option>
                        <option value="merchant">মার্চেন্ট / পেমেন্ট (Merchant/Payment)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">মোবাইল পেমেন্ট নম্বর:*</label>
                      <input
                        type="tel"
                        required
                        placeholder="যেমন: ০১৭xxxxxxxx"
                        value={paymentForm.mobile_number}
                        onChange={(e) => setPaymentForm({ ...paymentForm, mobile_number: e.target.value })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white font-mono placeholder-slate-500 focus:border-[#F59E0B] outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* BANK DETAILS FIELDS */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">ব্যাংকের নাম (Bank Name):*</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: Dutch-Bangla Bank PLC"
                        value={paymentForm.bank_name}
                        onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">হিসাবধারীর নাম (Account Holder Name):*</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: Durbar Academy Ltd."
                        value={paymentForm.account_holder_name}
                        onChange={(e) => setPaymentForm({ ...paymentForm, account_holder_name: e.target.value })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">ব্যাংক অ্যাকাউন্ট নম্বর:*</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: 164.110.9876543"
                        value={paymentForm.account_number}
                        onChange={(e) => setPaymentForm({ ...paymentForm, account_number: e.target.value })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white font-mono focus:border-[#F59E0B] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">শাখার নাম (Branch Name):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Dhanmondi Branch"
                        value={paymentForm.branch_name}
                        onChange={(e) => setPaymentForm({ ...paymentForm, branch_name: e.target.value })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">জেলা (District):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Dhaka"
                        value={paymentForm.district}
                        onChange={(e) => setPaymentForm({ ...paymentForm, district: e.target.value })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-300">রাউটিং নম্বর (Routing No):</label>
                        <span className="text-[10px] text-[#FACC15] font-semibold">(ঐচ্ছিক / Optional)</span>
                      </div>
                      <input
                        type="text"
                        placeholder="যেমন: 090261111"
                        value={paymentForm.routing_number}
                        onChange={(e) => setPaymentForm({ ...paymentForm, routing_number: e.target.value })}
                        className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white font-mono focus:border-[#F59E0B] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions / Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">শিক্ষার্থীদের জন্য নির্দেশনাবলী / নোট:</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: সেন্ড মানি বা ক্যাশ আউট সম্পন্ন করার পর প্রাপ্ত TrxID ইনপুট বক্সে প্রদান করুন।"
                  value={paymentForm.instructions}
                  onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:border-[#F59E0B] outline-none"
                />
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="payment_active_toggle"
                  checked={paymentForm.is_active}
                  onChange={(e) => setPaymentForm({ ...paymentForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#F59E0B]"
                />
                <label htmlFor="payment_active_toggle" className="font-bold text-white cursor-pointer select-none">
                  ভর্তি ফর্মে এই পেমেন্ট নম্বর/অ্যাকাউন্টটি সক্রিয় (Active) রাখুন
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl font-bold transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-gradient-to-r from-[#F59E0B] to-[#FACC15] text-black font-black rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg"
                >
                  {editingPayment ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
