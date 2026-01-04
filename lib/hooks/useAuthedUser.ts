"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type State = {
  user: User | null;
  loading: boolean;
  error?: string;
};

/**
 * WebContainer-safe auth state.
 * Uses the Supabase browser client (localStorage-based session persistence).
 */
export function useAuthedUser(): State {
  const [state, setState] = useState<State>({ user: null, loading: true });

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function init() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error) setState({ user: null, loading: false, error: error.message });
        else setState({ user: data.user ?? null, loading: false });
      } catch (e: any) {
        if (!mounted) return;
        setState({ user: null, loading: false, error: e?.message ?? "Unknown error" });
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ user: session?.user ?? null, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
