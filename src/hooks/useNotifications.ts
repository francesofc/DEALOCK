"use client";

import { useState, useEffect, useCallback } from "react";
import { NotificationSummary, generateAllNotifications } from "@/lib/intelligence/notifications";
import { Lead, Buyer, Mandate, MatchOpportunity, Activity, FinanceProfile } from "@/types/database";

interface UseNotificationsProps {
  leads: Lead[];
  buyers: Buyer[];
  mandates: Mandate[];
  matches: MatchOpportunity[];
  activities: Activity[];
  financeProfiles: FinanceProfile[];
}

export function useNotifications({
  leads,
  buyers,
  mandates,
  matches,
  activities,
  financeProfiles,
}: UseNotificationsProps) {
  const [summary, setSummary] = useState<NotificationSummary>({
    total: 0,
    critical: 0,
    high: 0,
    normal: 0,
    notifications: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    const result = generateAllNotifications(
      leads,
      buyers,
      mandates,
      matches,
      activities,
      financeProfiles
    );
    setSummary(result);
    setIsLoading(false);
  }, [leads, buyers, mandates, matches, activities, financeProfiles]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...summary,
    isLoading,
    refresh,
    hasCritical: summary.critical > 0,
    hasNotifications: summary.total > 0,
  };
}
