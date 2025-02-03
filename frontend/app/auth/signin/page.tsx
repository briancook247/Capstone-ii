/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import ResendEmailConfirm from "@/components/signup/ResendEmailConfirm";

export default function SignInPage({ emailConfirm = false }) {
  const { user, session } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailConfirm, setIsEmailConfirm] = useState(emailConfirm);

  // If user is already logged in, bounce them home.
  useEffect(() => {
    if (user && user.email_confirmed_at != null) {
      router.push("/");
    } else if (user && user.email_confirmed_at == null) {
      setIsEmailConfirm(true);
    }
  }, [user, session, router]);

  /** Handle password sign-in */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      if (signInError.message === "Email not confirmed") {
        setIsEmailConfirm(true);
      } else {
        setError(signInError.message);
      }
    } else {
      // Successful sign-in => go straight to "/"
      router.push("/");
    }
  };

  /** Handle Google OAuth sign-in */
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  /** Called by child to show sign-in form again */
  const handleNavigateToSignIn = () => {
    setIsEmailConfirm(false);
  };

  /** Optional: resend email confirmation if user is present */
  const handleResendEmail = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user?.email ?? "",
      });
      if (error) throw error;
      console.log("Confirmation email resent!");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // If user’s email isn’t confirmed, show special screen
  if (isEmailConfirm) {
    return (
      <ResendEmailConfirm
        email={user?.email}
        onNavigateToSignIn={handleNavigateToSignIn}
        onResendEmail={handleResendEmail}
      />
    );
  }

  return (
    <div className="bg-mesh-gradient flex justify-center items-center min-h-screen p-3 sm:p-6">
      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-4xl font-extrabold mb-2 text-center text-gray-900">
          Welcome back
        </h1>
        <h2 className="text-md mb-8 text-center text-gray-500 font-light">
          Enter your credentials to access your account
        </h2>
        <button
          className="w-full relative flex items-center justify-center bg-white border border-gray-300 rounded p-3 text-gray-700 hover:bg-blue-50 mb-6"
          onClick={handleGoogleSignIn}
        >
          <span className="absolute left-3">
            <FontAwesomeIcon icon={faGoogle} />
          </span>
          <span>Sign in with Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative text-center">
            <span className="bg-white px-2 text-sm text-gray-500">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        <form onSubmit={handleSignIn}>
          <div className="mb-4 relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center mb-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300 ease-in-out"></div>
              <span className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 peer-checked:translate-x-5 transition-transform duration-300 ease-in-out"></span>
              <span className="ml-2 text-sm font-light text-gray-400 peer-checked:text-gray-500 transition-colors duration-300 ease-in-out">
                Remember me
              </span>
            </label>
            <div className="flex-grow"></div>
            <Link
              href="/forgot-password"
              className="text-blue-400 text-sm hover:text-blue-500 font-light"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary mb-6"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {error && <p className="text-red-500 my-4 text-center">{error}</p>}

        <p className="text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-400 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
