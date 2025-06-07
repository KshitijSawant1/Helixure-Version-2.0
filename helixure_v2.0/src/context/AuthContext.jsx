import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Signup
  // Inside AuthContextProvider
  const signUpNewUser = async (
    firstname,
    lastname,
    dob,
    phone,
    email,
    password
  ) => {
    const memberSince = new Date().toISOString();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstname, lastname, dob, phone, memberSince },
      },
    });

    if (error) {
      console.log("Signup error:", error);
      return { success: false, error };
    }

    const userId = data.user?.id || data.session?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          firstname,
          lastname,
          dob,
          phone,
          email,
          selectedColor: "gray",
          memberSince,
        })
        .select(); // ✅ added

      if (profileError) {
        console.error("Profile insert error:", profileError);
      }
    }

    return { success: true, data };
  };

  // Signin
  const signInUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Signin error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  };

  // Signout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Signout error:", error);
    }
  };

  // Session and user state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, loading, signUpNewUser, signInUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(AuthContext);
