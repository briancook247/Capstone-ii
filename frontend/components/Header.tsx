/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */

// /app/components/Header.tsx
"use client";

import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import ProfileDropdown from "../components/ProfileDropdown";
import styles from "./Header.module.css";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div>
        <Link href="/" className={styles.logo}>
          API Doc Assistant
        </Link>
      </div>
      <nav className={styles.nav}>
        {!user ? (
          <>
            <Link href="/auth/signin" className={styles.navLink}>
              Sign In
            </Link>
            <Link href="/auth/signup" className={styles.navLink}>
              Sign Up
            </Link>
          </>
        ) : (
          <ProfileDropdown />
        )}
      </nav>
    </header>
  );
}
