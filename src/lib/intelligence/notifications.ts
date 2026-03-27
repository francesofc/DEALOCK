"use client";

import { Lead, Buyer, Mandate, MatchOpportunity, Activity, FinanceProfile } from "@/types/database";
import { getSellerNextAction, getBuyerNextAction, getFinanceNextAction, getDaysSinceLastActivity } from "./next-actions";

export type NotificationType = 
  | "seller_action" 
  | "buyer_action" 
  | "mandate_expiring" 
  | "excellent_match" 
  | "finance_blocker" 
  | "stale_record";

export type UrgencyLevel = "critical" | "high" | "normal" | "low";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  entityId: string;
  entityType: "seller" | "buyer" | "mandate" | "match" | "finance";
  link: string;
  createdAt: string;
  actionLabel?: string;
}

// ============================================
// NOTIFICATION GENERATORS
// ============================================

export function generateSellerNotifications(
  leads: Lead[],
  activities: Activity[],
  mandates: Mandate[]
): Notification[] {
  const notifications: Notification[] = [];

  for (const lead of leads) {
    const leadActivities = activities.filter(a => a.lead_id === lead.id);
    const mandate = mandates.find(m => m.lead_id === lead.id);
    const daysSinceActivity = getDaysSinceLastActivity(leadActivities);

    // Critical: No activity for 7+ days on hot leads
    if (daysSinceActivity >= 7 && ['mandate_proposed', 'mandate_sent', 'replied'].includes(lead.status)) {
      notifications.push({
        id: `seller-stale-${lead.id}`,
        type: "stale_record",
        title: lead.owner_name,
        description: `No activity for ${daysSinceActivity} days — hot lead going cold`,
        urgency: daysSinceActivity >= 14 ? "critical" : "high",
        entityId: lead.id,
        entityType: "seller",
        link: `/sellers/${lead.id}`,
        createdAt: new Date().toISOString(),
        actionLabel: "Re-engage now"
      });
    }

    // Critical: Mandate sent but not signed for 3+ days
    if (mandate?.status === 'sent') {
      const daysSinceSent = mandate.signed_at 
        ? 0 
        : Math.floor((Date.now() - new Date(mandate.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceSent >= 3) {
        notifications.push({
          id: `mandate-pending-${mandate.id}`,
          type: "seller_action",
          title: lead.owner_name,
          description: `Mandate sent ${daysSinceSent} days ago — signature pending`,
          urgency: daysSinceSent >= 7 ? "critical" : "high",
          entityId: lead.id,
          entityType: "seller",
          link: `/sellers/${lead.id}`,
          createdAt: new Date().toISOString(),
          actionLabel: "Follow up"
        });
      }
    }

    // High: New lead not contacted within 24h
    if (lead.status === 'new') {
      const hoursSinceCreated = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60));
      if (hoursSinceCreated >= 24) {
        notifications.push({
          id: `seller-new-${lead.id}`,
          type: "seller_action",
          title: lead.owner_name,
          description: `New lead not contacted within 24 hours`,
          urgency: hoursSinceCreated >= 48 ? "critical" : "high",
          entityId: lead.id,
          entityType: "seller",
          link: `/sellers/${lead.id}`,
          createdAt: new Date().toISOString(),
          actionLabel: "Call now"
        });
      }
    }
  }

  return notifications;
}

export function generateBuyerNotifications(
  buyers: Buyer[],
  activities: Activity[],
  financeProfiles: FinanceProfile[],
  matches: MatchOpportunity[]
): Notification[] {
  const notifications: Notification[] = [];

  for (const buyer of buyers) {
    const buyerActivities = activities.filter(a => a.buyer_id === buyer.id);
    const finance = financeProfiles.find(f => f.buyer_id === buyer.id);
    const buyerMatches = matches.filter(m => m.buyer_id === buyer.id);
    const daysSinceActivity = getDaysSinceLastActivity(buyerActivities);

    // Critical: Finance incomplete blocking progress
    if (finance?.status === 'incomplete' && finance.missing_documents?.length > 0) {
      notifications.push({
        id: `finance-blocker-${buyer.id}`,
        type: "finance_blocker",
        title: buyer.name,
        description: `${finance.missing_documents.length} documents missing — finance incomplete`,
        urgency: "critical",
        entityId: buyer.id,
        entityType: "buyer",
        link: `/buyers/${buyer.id}`,
        createdAt: new Date().toISOString(),
        actionLabel: "Request documents"
      });
    }

    // High: Hot buyer (immediate timeline, pre-approved) with no recent activity
    if (buyer.timeline === 'immediate' && buyer.pre_approved && daysSinceActivity >= 3) {
      notifications.push({
        id: `buyer-hot-${buyer.id}`,
        type: "buyer_action",
        title: buyer.name,
        description: `Hot buyer ready to buy — no activity for ${daysSinceActivity} days`,
        urgency: "high",
        entityId: buyer.id,
        entityType: "buyer",
        link: `/buyers/${buyer.id}`,
        createdAt: new Date().toISOString(),
        actionLabel: "Find matches"
      });
    }

    // High: Has excellent matches not yet contacted
    const excellentMatches = buyerMatches.filter(m => m.match_score === 'excellent' && m.status === 'identified');
    if (excellentMatches.length > 0) {
      notifications.push({
        id: `buyer-matches-${buyer.id}`,
        type: "excellent_match",
        title: buyer.name,
        description: `${excellentMatches.length} excellent ${excellentMatches.length === 1 ? 'match' : 'matches'} waiting to be presented`,
        urgency: "high",
        entityId: buyer.id,
        entityType: "buyer",
        link: `/match`,
        createdAt: new Date().toISOString(),
        actionLabel: "Send opportunities"
      });
    }

    // Normal: Stale buyer (no activity 14+ days)
    if (daysSinceActivity >= 14) {
      notifications.push({
        id: `buyer-stale-${buyer.id}`,
        type: "stale_record",
        title: buyer.name,
        description: `No activity for ${daysSinceActivity} days — buyer may be losing interest`,
        urgency: "normal",
        entityId: buyer.id,
        entityType: "buyer",
        link: `/buyers/${buyer.id}`,
        createdAt: new Date().toISOString(),
        actionLabel: "Re-engage"
      });
    }
  }

  return notifications;
}

export function generateMandateNotifications(mandates: Mandate[], leads: Lead[]): Notification[] {
  const notifications: Notification[] = [];

  for (const mandate of mandates) {
    const lead = leads.find(l => l.id === mandate.lead_id);
    if (!lead) continue;

    // Estimate mandate expiration based on creation date (standard 6-month mandate)
    const daysSinceCreated = Math.floor((Date.now() - new Date(mandate.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilExpiry = 180 - daysSinceCreated; // 6 months = 180 days
    
    if (mandate.status === 'signed' && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      notifications.push({
        id: `mandate-expiring-${mandate.id}`,
        type: "mandate_expiring",
        title: lead.owner_name,
        description: `Mandate ~${daysUntilExpiry} days remaining — ${daysUntilExpiry <= 7 ? 'renewal urgent' : 'consider renewal'}`,
        urgency: daysUntilExpiry <= 7 ? "critical" : daysUntilExpiry <= 14 ? "high" : "normal",
        entityId: mandate.id,
        entityType: "mandate",
        link: `/mandates`,
        createdAt: new Date().toISOString(),
        actionLabel: daysUntilExpiry <= 7 ? "Renew now" : "Plan renewal"
      });
    }
  }

  return notifications;
}

// ============================================
// AGGREGATOR
// ============================================

export interface NotificationSummary {
  total: number;
  critical: number;
  high: number;
  normal: number;
  notifications: Notification[];
}

export function generateAllNotifications(
  leads: Lead[],
  buyers: Buyer[],
  mandates: Mandate[],
  matches: MatchOpportunity[],
  activities: Activity[],
  financeProfiles: FinanceProfile[]
): NotificationSummary {
  const notifications = [
    ...generateSellerNotifications(leads, activities, mandates),
    ...generateBuyerNotifications(buyers, activities, financeProfiles, matches),
    ...generateMandateNotifications(mandates, leads),
  ];

  // Sort by urgency and deduplicate by entity
  const seen = new Set<string>();
  const unique = notifications.filter(n => {
    const key = `${n.entityType}-${n.entityId}-${n.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = unique.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  return {
    total: sorted.length,
    critical: sorted.filter(n => n.urgency === 'critical').length,
    high: sorted.filter(n => n.urgency === 'high').length,
    normal: sorted.filter(n => n.urgency === 'normal').length,
    notifications: sorted
  };
}

// ============================================
// HELPERS
// ============================================

export function urgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-amber-500";
    case "normal":
      return "bg-blue-500";
    case "low":
      return "bg-white/40";
  }
}

export function urgencyLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "critical":
      return "Act now";
    case "high":
      return "Today";
    case "normal":
      return "This week";
    case "low":
      return "Soon";
  }
}
