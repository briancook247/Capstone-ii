/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * 2/01/2025
 * License: MIT
 *
 * Updated to include Sonner's Toaster.
 */

import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}