import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function completeLogin() {
      const currentURL = new URL(window.location.href);
      const code = currentURL.searchParams.get("code");
      const redirectPath = currentURL.searchParams.get("redirect") || "/";

      // CASE 1 — Supabase OAuth / Magic Link provides ?code=
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Exchange error:", error.message);
        }
        navigate(redirectPath);
        return;
      }

      // CASE 2 — Supabase sometimes returns tokens in URL fragment (#)
      const hash = currentURL.hash;
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          navigate(redirectPath);
          return;
        }
      }

      console.warn("No code or token found in URL");
    }

    completeLogin();
  }, []);

  return <p className="text-center p-6">Connecting securely...</p>;
}


