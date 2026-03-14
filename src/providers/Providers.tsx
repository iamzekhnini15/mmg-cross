import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGarageStore } from '@/stores/garageStore';
import type { Garage, GarageMember } from '@/types/database';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

async function loadGarageForUser(userId: string) {
  const { setGarage, setGarageLoading } = useGarageStore.getState();

  try {
    const { data: memberships, error } = await supabase
      .from('garage_members')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'pending'])
      .order('status', { ascending: true }); // 'active' comes before 'pending'

    if (error) throw error;

    if (!memberships || memberships.length === 0) {
      setGarage(null, null);
      setGarageLoading(false);
      return;
    }

    // Prefer active membership over pending
    const membership =
      (memberships as GarageMember[]).find((m) => m.status === 'active') ??
      (memberships[0] as GarageMember);

    const { data: garage, error: garageError } = await supabase
      .from('garages')
      .select('*')
      .eq('id', membership.garage_id)
      .single();

    if (garageError) throw garageError;

    setGarage(garage as Garage, membership);
  } catch {
    setGarage(null, null);
  } finally {
    setGarageLoading(false);
  }
}

export function Providers({ children }: ProvidersProps) {
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearGarage = useGarageStore((state) => state.clearGarage);

  useEffect(() => {
    // Charger la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      if (session?.user) {
        loadGarageForUser(session.user.id);
      } else {
        useGarageStore.getState().setGarageLoading(false);
      }
    });

    // Écouter les changements d'état auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session?.user) {
        loadGarageForUser(session.user.id);
      } else {
        clearGarage();
        useGarageStore.getState().setGarageLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setLoading, clearGarage]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
