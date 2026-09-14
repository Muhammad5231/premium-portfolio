"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  notificationPreferences?: {
    emailNotifications?: boolean;
    commentReplies?: boolean;
    adminMessages?: boolean;
  };
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  unreadNotifications: number;
  unreadMessages: number;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    username?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  authModalOpen: boolean;
  authModalMessage: string;
  openAuthModal: (message?: string, onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>("");
  const [authCallback, setAuthCallback] = useState<(() => void) | null>(null);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setUnreadNotifications(data.unreadNotifications || 0);
        setUnreadMessages(data.unreadMessages || 0);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    // Subtle polling every 30 seconds for live notification & message telemetry
    const interval = setInterval(fetchCurrentUser, 30000);
    return () => clearInterval(interval);
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      await fetchCurrentUser();
      if (authCallback) {
        authCallback();
        setAuthCallback(null);
      }
      setAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred." };
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    username?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }
      await fetchCurrentUser();
      if (authCallback) {
        authCallback();
        setAuthCallback(null);
      }
      setAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUnreadNotifications(0);
      setUnreadMessages(0);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Update failed." };
      }
      await fetchCurrentUser();
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred." };
    }
  };

  const openAuthModal = (message?: string, onSuccessCallback?: () => void) => {
    setAuthModalMessage(
      message || "Please sign in or create an account to continue."
    );
    if (onSuccessCallback) {
      setAuthCallback(() => onSuccessCallback);
    } else {
      setAuthCallback(null);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadNotifications,
        unreadMessages,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser,
        authModalOpen,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

