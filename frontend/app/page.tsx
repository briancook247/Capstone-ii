/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */

"use client";

import { useAuth } from "@/components/AuthProvider";
import Home from "@/components/Home";
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";

export default function Page() {
  const { user } = useAuth();

  return (
    <div>
      <Header />
      {user ? <Home /> : <LandingPage />}
    </div>
  );
}
