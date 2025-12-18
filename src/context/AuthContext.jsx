// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "work.keshavsharmaaa678@gmail.com";

  /* -----------------------------------------------------------
      LOAD AVATAR (ALWAYS USE FIXED PATH + CACHE BUSTER)
  ------------------------------------------------------------ */
  async function loadAvatar(userId) {
    const path = `avatar-${userId}`;

    const { data } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(path);

    if (data?.publicUrl) {
      // Add timestamp to avoid browser caching old image
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    } else {
      setAvatarUrl(null);
    }
  }

  /* -----------------------------------------------------------
      LOAD SESSION ON APP START
  ------------------------------------------------------------ */
  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;

      setUser(currentUser);

      if (currentUser) {
        await loadAvatar(currentUser.id);
      }

      setLoading(false);
    }

    loadSession();

    /* -----------------------------------------------------------
        LISTEN FOR LOGIN / LOGOUT EVENTS
    ------------------------------------------------------------ */
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user || null;
        setUser(u);

        if (u) {
          await loadAvatar(u.id); // load avatar after login
        } else {
          setAvatarUrl(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  /* -----------------------------------------------------------
      LOGOUT
  ------------------------------------------------------------ */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvatarUrl(null);
  };

  /* -----------------------------------------------------------
      CALLED FROM PROFILE PAGE AFTER UPLOADING NEW AVATAR
  ------------------------------------------------------------ */
  const refreshAvatar = async () => {
    if (!user) return;
    await loadAvatar(user.id);
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        avatarUrl,
        logout,
        refreshAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

