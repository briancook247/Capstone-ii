/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * 2/01/2025
 * License: MIT
 *
 *  */

// SignupPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UserInfo from "@/components/signup/UserInfo";
import ResendEmailConfirm from "@/components/signup/ResendEmailConfirm";

// Import shadcn UI pieces (adjust the import path as needed)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import styles from "./SignupPage.module.css";

type SignupStage = "userInfo" | "resendEmailConfirm";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [signupStage, setSignupStage] = useState<SignupStage>("userInfo");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async ({
    email,
    password,
    firstName,
    lastName,
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData?.user) {
        setEmail(email);
        setSignupStage("resendEmailConfirm");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error("Google sign-up error:", err);
      setError("Failed to sign up with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error: resendError } = await supabase.auth.signUp({
        email,
        password: "dummyResendPassword",
      });
      if (resendError) {
        throw resendError;
      }
      alert("Verification email resent successfully.");
    } catch (err: any) {
      console.error("Error resending email:", err);
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSignIn = () => {
    router.push("/auth/signin");
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.title}>Create Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          {signupStage === "userInfo" && (
            <UserInfo
              onSignupComplete={handleSignup}
              onGoogleSignUp={handleGoogleSignUp}
              isLoading={isLoading}
              error={error}
            />
          )}
          {signupStage === "resendEmailConfirm" && (
            <ResendEmailConfirm
              email={email}
              onResendEmail={handleResendEmail}
              onNavigateToSignIn={handleNavigateToSignIn}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
