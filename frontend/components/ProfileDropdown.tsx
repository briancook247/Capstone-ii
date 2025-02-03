/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 * The ProfileDropdown component displays a user profile icon.
 * When clicked, it shows a dropdown menu with Settings and Logout options.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close the dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <FaUserCircle className="w-8 h-8 text-gray-700" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
