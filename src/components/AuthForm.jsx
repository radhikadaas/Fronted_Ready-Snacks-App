// src/components/AuthForm.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { Card } from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";

export default function AuthForm({ redirectTo = "/" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [notice, setNotice] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [cardVisible, setCardVisible] = useState(false);

  const COUNTDOWN_SECS = 30;
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  const [lastProviderUrl, setLastProviderUrl] = useState(null);

  const validDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

  // ---------------------------------------------
  // Email Validation
  // ---------------------------------------------
  function validateEmailLocal(value) {
    const v = (value || "").trim();
    if (!v) {
      setFieldError("Email is required.");
      return false;
    }

    const pattern = /^\S+@\S+\.\S+$/;
    if (!pattern.test(v)) {
      setFieldError("Enter a valid email (example: you@gmail.com).");
      return false;
    }

    const domain = v.split("@")[1]?.toLowerCase();
    if (!validDomains.includes(domain)) {
      setFieldError(
        "Unsupported provider — use Gmail, Yahoo, Outlook, Hotmail, or iCloud."
      );
      return false;
    }

    setFieldError("");
    return true;
  }

  // ---------------------------------------------
  // Countdown (supports dynamic server values)
  // ---------------------------------------------
  function startCountdown(seconds = COUNTDOWN_SECS) {
    setCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => countdownRef.current && clearInterval(countdownRef.current);
  }, []);

  // ---------------------------------------------
  // Mail provider URL
  // ---------------------------------------------
  function getMailProviderUrl(emailArg) {
    try {
      const domain = emailArg.split("@")[1].toLowerCase();
      switch (domain) {
        case "gmail.com": return "https://mail.google.com/";
        case "yahoo.com": return "https://mail.yahoo.com/";
        case "outlook.com":
        case "hotmail.com": return "https://outlook.live.com/mail/";
        case "icloud.com": return "https://www.icloud.com/mail";
        default: return "https://mail.google.com/";
      }
    } catch {
      return "https://mail.google.com/";
    }
  }

  // ---------------------------------------------
  // Send Magic Link (with Supabase rate-limit sync!)
  // ---------------------------------------------
  async function signInWithEmail() {
    if (!validateEmailLocal(email)) {
      setNotice({ type: "error", text: "Please fix the email before continuing." });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + `/auth/callback?redirect=${redirectTo}`,
        },
      });

      if (error) {
        // 🔥 Detect Supabase's rate-limit message
        const match = error.message.match(/after (\d+) seconds/i);

        if (match) {
          const serverSeconds = parseInt(match[1], 10);

          // Sync UI with Supabase timer
          startCountdown(serverSeconds);
          setNotice({ type: "error", text: `To keep your account secure, please wait ${serverSeconds}s before requesting a new link.` });
          toast.error(`To keep your account secure, please wait ${serverSeconds}s before requesting a new link.`);
          return;
        }

        // Other errors
        setNotice({ type: "error", text: error.message || "Failed to send magic link." });
        toast.error(error.message || "Failed to send magic link.");
        return;
      }

      toast.success("Magic link sent!");
      setCardVisible(true);

      startCountdown(COUNTDOWN_SECS);

      setEmail("");
      setFieldError("");
      setNotice(null);

    } catch (err) {
      setNotice({ type: "error", text: err?.message });
      toast.error(err?.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (countdown > 0) {
      setNotice({ type: "error", text: `Please wait ${countdown}s before resending.` });
      return;
    }

    setLastProviderUrl(getMailProviderUrl(email));
    signInWithEmail();
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 py-12 relative">

      {/* Background Blur when card is visible */}
      {cardVisible && (
        <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/40 transition-opacity"></div>
      )}

      {/* Magic Link Sent Modal */}
      {cardVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_0.15s]">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl 
                           animate-[zoomIn_0.18s_ease-out]">

            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full 
                    bg-green-100 text-green-700">
                  <HiCheckCircle className="h-6 w-6" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Magic link sent
                </h3>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  We emailed a login link. Open your mail and tap the link — you’ll be signed in instantly.
                </p>

                <div className="mt-4 flex items-center gap-3">

                  {/* Open Mail */}
                  <button
                    onClick={() => window.open(lastProviderUrl || "https://mail.google.com/", "_blank")}
                    className="px-5 py-2 rounded-lg font-semibold text-white bg-indigo-600 
                               hover:bg-indigo-500 shadow">
                    Open Mail
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setCardVisible(false)}
                    className="px-5 py-2 rounded-lg font-medium bg-gray-300 text-gray-900 
                               hover:bg-gray-200 shadow-sm border border-gray-400">
                    Close
                  </button>

                  {/* Countdown */}
                  <div className="ml-auto text-sm text-gray-500 min-w-[110px] text-right">
                    {countdown > 0
                      ? `Resend in ${countdown}s`
                      : <span className="text-green-600 font-medium">You can resend now</span>}
                  </div>

                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg 
                    transition-all duration-200 
                    ${cardVisible ? "scale-95 blur-sm select-none" : ""}`}>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Login</h2>

        {/* Notice */}
        {notice && (
          <div className={`mb-4 px-4 py-2 rounded-md text-sm ${
            notice.type === "error"
              ? "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
              : "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
          }`}>
            {notice.text}
          </div>
        )}

        {/* Email Field */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Email address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); validateEmailLocal(e.target.value); }}
          placeholder="you@example.com"
          className={`mt-1 w-full px-3 py-2 rounded-md border shadow-sm ${
            fieldError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
          } dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
        />

        {fieldError && (
          <p className="text-xs text-red-400 mt-1">{fieldError}</p>
        )}

        <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 mb-4">
          We’ll send you a secure magic link — no password needed.
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || countdown > 0}
          className={`w-full mt-4 py-2 rounded-md text-white font-semibold flex items-center justify-center gap-2 
            ${loading || countdown > 0
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500"}`}>

          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}

          {loading
            ? "Sending..."
            : countdown > 0
            ? `Resend in ${countdown}s`
            : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}

