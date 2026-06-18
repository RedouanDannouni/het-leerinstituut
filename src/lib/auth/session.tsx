"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createSessionContext } from "@/lib/domain/access";
import { users } from "@/lib/domain/seed-data";
import type { SessionContext, User } from "@/lib/domain/types";

const sessionKey = "hli.active-user-id";
const onboardingKey = "hli.onboarding-complete";

interface SessionState {
  context: SessionContext | null;
  login: (userId: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
}

const SessionContextReact = createContext<SessionState | null>(null);

function findUser(userId: string): User | null {
  return users.find((user) => user.id === userId) ?? null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(sessionKey);
    if (stored) setUser(findUser(stored));
    setOnboardingComplete(window.localStorage.getItem(onboardingKey) === "true");
  }, []);

  const value = useMemo<SessionState>(() => {
    const setActiveUser = (userId: string) => {
      const next = findUser(userId);
      if (!next) return;
      window.localStorage.setItem(sessionKey, next.id);
      setUser(next);
    };

    return {
      context: user ? createSessionContext(user) : null,
      login: (userId: string) => {
        setActiveUser(userId);
        router.push(window.localStorage.getItem(onboardingKey) === "true" ? "/app/cockpit" : "/app/onboarding");
      },
      switchUser: (userId: string) => {
        setActiveUser(userId);
        router.push("/app/cockpit");
      },
      logout: () => {
        window.localStorage.removeItem(sessionKey);
        setUser(null);
        router.push("/login");
      },
      onboardingComplete,
      completeOnboarding: () => {
        window.localStorage.setItem(onboardingKey, "true");
        setOnboardingComplete(true);
        router.push("/app/cockpit");
      },
    };
  }, [onboardingComplete, router, user]);

  return <SessionContextReact.Provider value={value}>{children}</SessionContextReact.Provider>;
}

export function useSession() {
  const value = useContext(SessionContextReact);
  if (!value) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return value;
}

export function useRequireSession() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.context === null) {
      const timer = window.setTimeout(() => router.push("/login"), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [router, session.context]);

  return session;
}
