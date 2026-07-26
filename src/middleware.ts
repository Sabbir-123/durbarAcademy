import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const nextUrl = request.nextUrl.pathname;

  // Protect Dashboard Routes
  const isStudentRoute = nextUrl.startsWith("/student");
  const isTeacherRoute = nextUrl.startsWith("/teacher");
  const isAccountantRoute = nextUrl.startsWith("/accountant");
  const isAdminRoute = nextUrl.startsWith("/admin");
  const isAuthRoute = nextUrl === "/login" || nextUrl === "/signup";

  if (isStudentRoute || isTeacherRoute || isAccountantRoute || isAdminRoute) {
    if (!user) {
      // Not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Retrieve user role from database
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = roleData?.role;

    if (!role) {
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }

    // Role-based Access Guards
    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (isTeacherRoute && role !== "teacher" && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (isAccountantRoute && role !== "accountant" && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (isStudentRoute && role !== "student" && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
  }

  // Redirect Authenticated Users Away From Login/Signup
  if (isAuthRoute && user) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = roleData?.role || "student";
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/accountant/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
