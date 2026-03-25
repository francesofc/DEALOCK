/**
 * Workspace Context
 * 
 * Provides workspace scoping throughout the application.
 * Phase 7: Critical for pilot multi-agency isolation.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getActiveWorkspace, WorkspaceRecord } from '@/lib/data/workspace';
import { Loader2 } from 'lucide-react';

interface WorkspaceContextValue {
  workspace: WorkspaceRecord | null;
  workspaceId: string | null;
  isLoading: boolean;
  error: Error | null;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshWorkspace = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ws = await getActiveWorkspace();
      setWorkspace(ws);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load workspace'));
      console.error('[WorkspaceContext] Error loading workspace:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorkspace();
  }, [refreshWorkspace]);

  const value: WorkspaceContextValue = {
    workspace,
    workspaceId: workspace?.id || null,
    isLoading,
    error,
    refreshWorkspace,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-white/50">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

export function useWorkspaceId(): string | null {
  const { workspaceId } = useWorkspace();
  return workspaceId;
}
