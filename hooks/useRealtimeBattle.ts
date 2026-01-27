/**
 * Hook for real-time battle updates via Supabase
 */

import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';

export interface RealtimeBattle {
  id: string;
  battleNumber: number;
  prompt: string;
  trackAId: string;
  trackBId: string;
  isRevealed: boolean;
  winnerId: string | null;
  startedAt: string;
}

export interface RealtimeVote {
  id: string;
  battleId: string;
  userWallet: string;
  choice: string;
  betAmount: number;
  createdAt: string;
}

export function useRealtimeBattle() {
  const [currentBattle, setCurrentBattle] = useState<RealtimeBattle | null>(null);
  const [recentVotes, setRecentVotes] = useState<RealtimeVote[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let battlesChannel: RealtimeChannel;
    let votesChannel: RealtimeChannel;

    async function setupRealtimeSubscriptions() {
      try {
        // Fetch current active battle
        const { data: battles, error } = await supabase
          .from('battles')
          .select('*')
          .eq('isRevealed', false)
          .order('startedAt', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (battles && battles.length > 0) {
          setCurrentBattle(battles[0]);
        }

        // Subscribe to battles table
        battlesChannel = supabase
          .channel('realtime:battles')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'battles',
            },
            (payload) => {
              console.log('Battle update:', payload);

              if (payload.eventType === 'INSERT') {
                setCurrentBattle(payload.new as RealtimeBattle);
              } else if (payload.eventType === 'UPDATE') {
                setCurrentBattle(payload.new as RealtimeBattle);
              }
            }
          )
          .subscribe((status) => {
            console.log('Battles subscription status:', status);
            setIsConnected(status === 'SUBSCRIBED');
          });

        // Subscribe to votes table
        votesChannel = supabase
          .channel('realtime:votes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'votes',
            },
            (payload) => {
              console.log('New vote:', payload);

              const newVote = payload.new as RealtimeVote;

              // Add to recent votes (keep last 10)
              setRecentVotes((prev) => [newVote, ...prev].slice(0, 10));
            }
          )
          .subscribe((status) => {
            console.log('Votes subscription status:', status);
          });
      } catch (error) {
        console.error('Failed to setup real-time subscriptions:', error);
      }
    }

    setupRealtimeSubscriptions();

    // Cleanup
    return () => {
      battlesChannel?.unsubscribe();
      votesChannel?.unsubscribe();
    };
  }, []);

  return {
    currentBattle,
    recentVotes,
    isConnected,
  };
}
