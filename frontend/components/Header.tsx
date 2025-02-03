/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";
import Link from "next/link";

export default function Header({ user }: { user: any }) {
  return (
    <header className="p-4 bg-gray-100 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-xl font-bold">API Doc Assistant</h1>
      </Link>
      <nav>
        {user ? (
          <span>Welcome, {user.email}</span>
        ) : (
          <>
            <Link href="/auth/signin" className="mr-4">Sign In</Link>
            <Link href="/auth/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
