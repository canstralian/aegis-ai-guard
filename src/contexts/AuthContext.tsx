import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, Organization, UserRole, AppRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  currentRole: AppRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  // Fetch user's organizations
  const fetchOrganizations = async (userId: string) => {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations:organization_id (*)
      `)
      .eq('user_id', userId)
      .not('accepted_at', 'is', null);
    
    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
    
    return data?.map((m: any) => m.organizations).filter(Boolean) as Organization[] || [];
  };

  // Fetch user's role in organization
  const fetchRole = async (userId: string, orgId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();
    
    if (error) {
      console.error('Error fetching role:', error);
      return null;
    }
    return data?.role as AppRole;
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const [profileData, orgsData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchOrganizations(session.user.id),
          ]);
          
          setProfile(profileData);
          setOrganizations(orgsData);
          
          // Set current org from localStorage or first org
          const savedOrgId = localStorage.getItem('aegis_current_org');
          const savedOrg = orgsData.find(o => o.id === savedOrgId);
          const currentOrg = savedOrg || orgsData[0];
          
          if (currentOrg) {
            setCurrentOrganization(currentOrg);
            const role = await fetchRole(session.user.id, currentOrg.id);
            setCurrentRole(role);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          const [profileData, orgsData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchOrganizations(session.user.id),
          ]);
          
          setProfile(profileData);
          setOrganizations(orgsData);
          
          if (orgsData.length > 0) {
            setCurrentOrganization(orgsData[0]);
            const role = await fetchRole(session.user.id, orgsData[0].id);
            setCurrentRole(role);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setOrganizations([]);
          setCurrentOrganization(null);
          setCurrentRole(null);
          localStorage.removeItem('aegis_current_org');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSetCurrentOrganization = async (org: Organization) => {
    setCurrentOrganization(org);
    localStorage.setItem('aegis_current_org', org.id);
    
    if (user) {
      const role = await fetchRole(user.id, org.id);
      setCurrentRole(role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organizations,
        currentOrganization,
        currentRole,
        isLoading,
        signIn,
        signUp,
        signOut,
        setCurrentOrganization: handleSetCurrentOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
