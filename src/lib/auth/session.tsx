"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createSessionContext } from "@/lib/domain/access";
import { users } from "@/lib/domain/seed-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Role, SessionContext, TenantId, User } from "@/lib/domain/types";

const sessionKey = "hli.active-user-id";
const onboardingKey = "hli.onboarding-complete";

export type SupabaseLoginResult = { ok: true } | { ok: false; error: string };

interface SessionState {
  context: SessionContext | null;
  initializing: boolean;
  login: (userId: string) => void;
  loginWithSupabase: (email: string, password: string) => Promise<SupabaseLoginResult>;
  logout: () => void;
  switchUser: (userId: string) => void;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
}

const SessionContextReact = createContext<SessionState | null>(null);

function findUser(userId: string): User | null {
  return users.find((user) => user.id === userId) ?? null;
}

function initialsFrom(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Bouwt een app-`User` op basis van het Supabase-profiel van de ingelogde gebruiker.
  async function loadProfileUser(userId: string, fallbackEmail?: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, tenant_id")
      .eq("id", userId)
      .single();
    if (error || !data || !data.tenant_id) return null;
    const name = data.full_name ?? data.email ?? fallbackEmail ?? "Gebruiker";
    return {
      id: data.id,
      email: data.email ?? fallbackEmail ?? "",
      name,
      role: data.role as Role,
      tenantId: data.tenant_id as TenantId,
      avatarInitials: initialsFrom(name),
    };
  }

  useEffect(() => {
    let active = true;
    async function init() {
      // 1) Echte Supabase-sessie heeft voorrang. We racen tegen een timeout:
      // als Supabase traag of onbereikbaar is, mag de app niet eindeloos op de
      // loader blijven hangen maar valt terug op de demo-/localStorage-sessie.
      const sessionResult = await Promise.race([
        supabase.auth.getSession().then((result) => result.data.session),
        new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 3000)),
      ]);
      const session = sessionResult;
      if (session?.user && active) {
        const realUser = await loadProfileUser(session.user.id, session.user.email ?? undefined);
        if (realUser && active) {
          setUser(realUser);
          setOnboardingComplete(true);
          setInitializing(false);
          return;
        }
      }
      // 2) Terugval op demo-sessie (localStorage + seed-data).
      if (!active) return;
      const stored = window.localStorage.getItem(sessionKey);
      if (stored) setUser(findUser(stored));
      setOnboardingComplete(window.localStorage.getItem(onboardingKey) === "true");
      setInitializing(false);
    }
    void init();
    return () => {
      active = false;
    };
  }, [supabase]);

  const value = useMemo<SessionState>(() => {
    const setActiveUser = (userId: string) => {
      const next = findUser(userId);
      if (!next) return;
      window.localStorage.setItem(sessionKey, next.id);
      setUser(next);
    };

    return {
      context: user ? createSessionContext(user) : null,
      initializing,
      login: (userId: string) => {
        setActiveUser(userId);
        router.push(window.localStorage.getItem(onboardingKey) === "true" ? "/app/cockpit" : "/app/onboarding");
      },
      loginWithSupabase: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          return { ok: false, error: error?.message ?? "Inloggen mislukt." };
        }
        const realUser = await loadProfileUser(data.user.id, data.user.email ?? undefined);
        if (!realUser) {
          await supabase.auth.signOut();
          return { ok: false, error: "Geen profiel gevonden voor dit account." };
        }
        // Demo-sessie opruimen zodat de echte sessie leidend is.
        window.localStorage.removeItem(sessionKey);
        setUser(realUser);
        setOnboardingComplete(true);
        router.push("/app/cockpit");
        return { ok: true };
      },
      switchUser: (userId: string) => {
        setActiveUser(userId);
        router.push("/app/cockpit");
      },
      logout: () => {
        window.localStorage.removeItem(sessionKey);
        setUser(null);
        void supabase.auth.signOut();
        router.push("/login");
      },
      onboardingComplete,
      completeOnboarding: () => {
        window.localStorage.setItem(onboardingKey, "true");
        setOnboardingComplete(true);
        router.push("/app/cockpit");
      },
    };
  }, [initializing, onboardingComplete, router, supabase, user]);

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
    if (session.initializing) return undefined;
    if (session.context === null) {
      const timer = window.setTimeout(() => router.push("/login"), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [router, session.context, session.initializing]);

  return session;
}
