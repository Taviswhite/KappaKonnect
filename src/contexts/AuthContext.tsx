import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  graduation_year: number | null;
  committee: string | null;
}

interface UserRole {
  role: "admin" | "e_board" | "committee_chairman" | "member" | "alumni";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole["role"]) => boolean;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetches user profile and roles from Supabase
   * @param userId - The authenticated user's ID
   */
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) throw rolesError;
      setRoles(rolesData as UserRole[]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  /**
   * Signs up a new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param fullName - User's full name
   * @returns Object with error if signup fails
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error: error as Error | null };
  };

  /**
   * Signs in an existing user with email, username, or phone number and password
   * @param identifier - User's email address, username (full_name), or phone number
   * @param password - User's password
   * @returns Object with error if signin fails
   */
  const signIn = async (identifier: string, password: string) => {
    let emailToUse = identifier.trim();
    
    // Check if identifier is an email (contains @)
    const isEmail = identifier.includes('@');
    
    // Check if identifier is a phone number (contains mostly digits, may have +, -, spaces, parentheses)
    const phoneRegex = /^[\d\s+()-]+$/;
    const isPhone = phoneRegex.test(identifier.replace(/\s/g, '')) && identifier.replace(/\D/g, '').length >= 10;
    
    // If not an email, try to look up the email from profiles
    if (!isEmail) {
      try {
        const profileQuery = supabase
          .from('profiles')
          .select('email')
          .limit(1);
        
        if (isPhone) {
          // Look up by phone number - try both with and without formatting
          const cleanPhone = identifier.replace(/\D/g, ''); // Remove non-digits
          const { data: profileData, error: lookupError } = await supabase
            .from('profiles')
            .select('email')
            .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${identifier}%`)
            .maybeSingle();
          
          if (lookupError) {
            console.error('Error looking up user by phone:', lookupError);
            return { 
              error: new Error('Unable to find user. Please check your credentials.') as Error 
            };
          } else if (profileData?.email) {
            emailToUse = profileData.email;
          } else {
            // If no profile found, return error
            return { 
              error: new Error('Invalid login credentials. Please check your email, username, or phone number.') as Error 
            };
          }
        } else {
          // Look up by full_name (username) - case insensitive
          const { data: profileData, error: lookupError } = await profileQuery
            .ilike('full_name', identifier)
            .maybeSingle();
          
          if (lookupError) {
            console.error('Error looking up user by name:', lookupError);
            return { 
              error: new Error('Unable to find user. Please check your credentials.') as Error 
            };
          } else if (profileData?.email) {
            emailToUse = profileData.email;
          } else {
            // If no profile found, return error
            return { 
              error: new Error('Invalid login credentials. Please check your email, username, or phone number.') as Error 
            };
          }
        }
      } catch (error) {
        console.error('Error during user lookup:', error);
        return { 
          error: new Error('Unable to find user. Please check your credentials.') as Error 
        };
      }
    }
    
    // Sign in with the resolved email
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });
    
    return { error: error as Error | null };
  };

  /**
   * Resends email confirmation for a user
   * @param email - User's email address
   * @returns Object with error if resend fails
   */
  const resendConfirmationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  };

  /**
   * Checks if the current user has a specific role
   * @param role - The role to check for
   * @returns True if user has the role, false otherwise
   */
  const hasRole = (role: UserRole["role"]) => {
    return roles.some((r) => r.role === role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        signUp,
        signIn,
        signOut,
        hasRole,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
