import React, { useState } from "react";
import { User, Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Zap } from "lucide-react";

// === INTERFACE DEFINITIONS for Type Safety ===

interface FormData {
  email: string;
  password: string;
}

interface SuccessUser {
  name: string;
  family: string;
  email: string;
  token?: string; // API returns token, though we don't display it in the success view
}

// === SEO Note for Next.js App Router ===
// In a full Next.js App Router setup, you would export a metadata object
// from this file for SEO purposes (e.g., title, description).
// Example:
/*
export const metadata = {
  title: 'Secure Login - My App',
  description: 'Access your account securely with your email and password.',
};
*/

export default function Login() {
  // State Management with Types
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  });

  // successUser can be SuccessUser object or null
  const [successUser, setSuccessUser] = useState<SuccessUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // API call to the specified endpoint: /api/Account/Login
      const response = await fetch("/api/Account/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data: SuccessUser & { message?: string } = await response.json();

      if (!response.ok) {
        // Server-side error handling
        throw new Error(data.message || "A server error occurred.");
      }

      // Success handling
      // 1. Store token
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // 2. Set success state
      setSuccessUser({
        name: data.name,
        family: data.family,
        email: data.email
      });

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }

      // *** Demo Code for Preview ***
      /*
      // Uncomment this block and use email="demo" and password="demo" to see the success state
      if (formData.email === "demo" && formData.password === "demo") {
         setTimeout(() => {
            setSuccessUser({ name: "John", family: "Doe", email: "demo@example.com", token: "fake-token" });
            setIsLoading(false);
            setError(null);
         }, 1500);
         return;
      }
      */
      // ****************************

    } finally {
      setIsLoading(false);
    }
  };

  // Success View (Flat Style)
  if (successUser) {
    return (
      <div dir="ltr" className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center space-y-6 border border-gray-200">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
            <p className="text-gray-600 mt-2">You have logged in successfully.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2 border border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Name:</span>
              <span className="font-medium text-gray-800">{successUser.name} {successUser.family}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Email:</span>
              <span className="font-medium text-gray-800">{successUser.email}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setSuccessUser(null);
              setFormData({ email: "", password: "" });
              localStorage.removeItem("authToken");
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="ltr" className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">

      {/* Main Card with Split Layout (Flat Style) */}
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden flex flex-row border border-gray-200">

        {/* 1. Promotional Side (Left - Solid Blue Flat) - Good for SEO description content */}
        <div
          className="hidden md:flex flex-col justify-center items-center w-1/2 p-10 bg-blue-600 text-white space-y-4">
          <Zap className="w-16 h-16 text-white" strokeWidth={1.5} />
          {/* Use H1 for the main page title for good SEO */}
          <h1 className="text-4xl font-extrabold tracking-tight">
            Fast & Secure Access
          </h1>
          <p className="text-blue-200 text-center max-w-xs">
            Log in to manage your account, view analytics, and interact with all our services seamlessly.
          </p>
          {/* Placeholder for an actual illustration or image */}
          <div
            className="mt-8 w-full h-40 bg-blue-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-400">
            <span className="text-blue-300">Placeholder Illustration</span>
          </div>
        </div>

        {/* 2. Login Form Side (Right - Full width on mobile, half width on desktop) */}
        <div className="w-full md:w-1/2 p-8 md:p-10">
          <div className="text-center mb-10">
            {/* Simple blue circle for the icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white mb-4">
              <User size={24} />
            </div>
            {/* Use H2 for the section title within the page */}
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2 text-sm">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block" htmlFor="email">
                Email or Username
              </label>
              <div className="relative group">
                {/* Icon on Left for LTR */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  // Flat input style: border and focus ring
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                {/* Lock Icon on Left */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  // Flat input style: border and focus ring
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                {/* Eye Icon on Right */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button (Flat Style) */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-md text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors duration-300
                ${isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700" // No shadow or transform
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}