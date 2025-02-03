/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 * This component displays a message to the user prompting them to confirm their email.
 * It provides options to resend the confirmation email or navigate back to sign‑in.
 */

"use client";

import React from "react";

interface ResendEmailConfirmProps {
  email?: string;
  onResendEmail: () => Promise<void>;
  onNavigateToSignIn: () => void;
}

const ResendEmailConfirm: React.FC<ResendEmailConfirmProps> = ({
  email,
  onResendEmail,
  onNavigateToSignIn,
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Please Confirm Your Email</h2>
      <p className="mb-6 text-center">
        We sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click the confirmation link.
      </p>
      <button
        onClick={onResendEmail}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Resend Confirmation Email
      </button>
      <button
        onClick={onNavigateToSignIn}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
      >
        Back to Sign In
      </button>
    </div>
  );
};

export default ResendEmailConfirm;
