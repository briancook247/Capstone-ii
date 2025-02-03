/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 * This component renders the sign‑up form to collect basic user information.
 */

"use client";

import React, { useState } from "react";

interface UserInfoProps {
  onSignupComplete: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  onGoogleSignUp: () => Promise<void>;
  isLoading: boolean;
  error: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
  onSignupComplete,
  onGoogleSignUp,
  isLoading,
  error,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignupComplete({ email, password, firstName, lastName });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="max-w-lg w-full p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-blue-500 text-white rounded mb-4"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <button
          onClick={onGoogleSignUp}
          className="w-full p-3 bg-white border border-gray-300 text-gray-700 rounded hover:bg-blue-50"
        >
          Sign up with Google
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
