import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Perimeter {
  id: string;
  zone: string;
  status: boolean;
}

export const usePerimeterStatus = () => {
  const [perimeters, setPerimeters] = useState<Perimeter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timeout fallback: if loading takes more than 5 seconds, show error
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. Please refresh.');
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchPerimeters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perimeters')
        .select('*')
        .order('zone');
      if (error) throw error;
      setPerimeters(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch perimeter statuses');
      setPerimeters([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePerimeterStatus = async (zone: string, status: boolean) => {
    try {
      const { error } = await supabase
        .from('perimeters')
        .update({ status })
        .eq('zone', zone);
      if (error) throw error;
      setPerimeters(prev => prev.map(p => p.zone === zone ? { ...p, status } : p));
    } catch (err: any) {
      setError(err.message || 'Failed to update perimeter status');
    }
  };

  // Initial fetch and subscription
  useEffect(() => {
    let channel: any = null;
    let isMounted = true;
    fetchPerimeters().then(() => {
      if (!isMounted) return;
      channel = supabase
        .channel('perimeters_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'perimeters' },
          (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: Perimeter; old: Perimeter; }) => {
            if (payload.eventType === 'UPDATE') {
              setPerimeters(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
            } else if (payload.eventType === 'INSERT') {
              setPerimeters(prev => [...prev, payload.new]);
            } else if (payload.eventType === 'DELETE') {
              setPerimeters(prev => prev.filter(p => p.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    });
    return () => {
      isMounted = false;
      if (channel) channel.unsubscribe();
    };
  }, []);

  return {
    perimeters,
    loading,
    error,
    updatePerimeterStatus,
    refreshPerimeters: fetchPerimeters
  };
}; 