"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client-browser";

// Define the shape of our user data
interface UserData {
  id: string;
  profile_id: string;
  email: string;
  name: string;
  avatar_url: string;
  active_workspace: string;
}

// Define what our context will provide
interface UserContextInterface {
  user: UserData | null;
  isLoading: boolean;
  updateUser: (newData: Partial<UserData>) => void;
  refetchUser: () => Promise<void>;
}

// Create the context
const UserContext = createContext<UserContextInterface | undefined>(undefined);

// Create the provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      const supabase = await createClient();
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profileError) {
        toast.error(profileError.message);
        return;
      }

      if (profileData) {
        setUser({
          id: user?.id || "",
          profile_id: profileData.id,
          email: user?.email || "",
          name: profileData.name || "",
          avatar_url: profileData.avatar_url || "",
          active_workspace: profileData.active_workspace || "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch user.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update user data
  const updateUser = (newData: Partial<UserData>) => {
    setUser((currentUser) => {
      if (currentUser) {
        return { ...currentUser, ...newData };
      }
      return currentUser;
    });
  };

  // Function to refetch user data
  const refetchUser = async () => {
    await fetchUser();
  };

  // Create the context value
  const contextValue: UserContextInterface = {
    user,
    isLoading,
    updateUser,
    refetchUser,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
