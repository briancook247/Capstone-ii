/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */

"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, just go home:
    if (user) {
      router.push("/");
      return;
    }

    // If this was an OAuth flow, Supabase might pass ?token=...
    if (token) {
      // After a short delay or immediately, push home
      router.push("/");
      return;
    }

    // If there's an error param in the URL
    if (error) {
      console.error("Authentication error:", error);
      router.push("/auth/signin");
      return;
    }

    // If none of the above, show a "processing" state
  }, [token, error, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md w-full text-center">
        {user && <p>Redirecting...</p>}
        {!user && !error && !token && <p>Processing OAuth Callback...</p>}
        {error && (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              Authentication Error
            </h1>
            <p className="mt-4 text-gray-600">
              There was an issue with your login. Redirecting you to sign in...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
