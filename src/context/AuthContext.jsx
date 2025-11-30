import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ONLY THIS EMAIL IS ADMIN
  const ADMIN_EMAIL = "work.keshavsharmaaa678@gmail.com";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}



// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const session = supabase.auth.getSession().then(({ data }) => {
//       setUser(data?.session?.user || null);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_, session) => {
//         setUser(session?.user || null);
//       }
//     );

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }
