// src/components/AuthForm.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function AuthForm({ redirectTo = "/" }) {
  const [email, setEmail] = useState("");
  const [step] = useState("email"); // kept for compatibility with your original code shape
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'success'|'error'|'info', text: string }

  // Keep the same signInWithEmail behaviour (call to supabase) — we only add UI around it.
  async function signInWithEmail() {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setNotice({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // keep the redirectTo behavior the same as before
          emailRedirectTo: window.location.origin + `/auth/callback?redirect=${redirectTo}`,
        },
      });

      if (error) {
        // keep existing behavior (alert) but also show inline message
        setNotice({ type: "error", text: error.message || "Failed to send magic link." });
        // keep the original alert for parity (optional, but retained to not change UX behavior)
        alert(error.message);
      } else {
        setNotice({
          type: "success",
          text: "Magic link sent! Check your email to continue.",
        });
        alert("Magic link sent! Check your email.");
      }
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "Unexpected error" });
      // preserve visible alert as before
      alert(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    signInWithEmail();
  }

  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 dark:bg-gray-800"
        aria-labelledby="login-heading"
      >
        <h2 id="login-heading" className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Login
        </h2>

        {/* Inline notice */}
        {notice && (
          <div
            role="status"
            className={`mb-4 rounded-md px-4 py-2 text-sm ${
              notice.type === "success"
                ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                : notice.type === "error"
                ? "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                : "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
            }`}
          >
            {notice.text}
          </div>
        )}

        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 mb-4 block w-full rounded-md border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm
            placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          placeholder="you@example.com"
          aria-describedby="email-help"
        />

        <div id="email-help" className="text-xs text-gray-500 mb-4">
          We'll send a magic link to this email — no password required.
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold
            text-white shadow-sm transition disabled:opacity-60 ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-500"
            }`}
        >
          {loading ? (
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : null}
          {loading ? "Sending..." : "Send Magic Link"}
        </button>

        {/* Secondary actions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Prefer a password? <a href="/login/password" className="font-medium text-indigo-600 hover:underline">Sign in with password</a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default AuthForm;

