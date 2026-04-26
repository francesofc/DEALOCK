"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, X, AlertCircle, Flame, Clock, User, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/hooks/useNotifications";
import { urgencyColor, urgencyLabel, Notification } from "@/lib/intelligence/notifications";
import { useRouter } from "next/navigation";
import { getLeads, getBuyers, getMandates, getMatches, getActivities, getFinanceProfiles } from "@/lib/data";
import { Lead, Buyer, Mandate, MatchOpportunity, Activity, FinanceProfile } from "@/types/database";

export function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{
    leads: Lead[];
    buyers: Buyer[];
    mandates: Mandate[];
    matches: MatchOpportunity[];
    activities: Activity[];
    financeProfiles: FinanceProfile[];
  }>({
    leads: [],
    buyers: [],
    mandates: [],
    matches: [],
    activities: [],
    financeProfiles: [],
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load data for notifications
  useEffect(() => {
    async function loadData() {
      try {
        const [leads, buyers, mandates, matches, activities, financeProfiles] = await Promise.all([
          getLeads(),
          getBuyers(),
          getMandates(),
          getMatches(),
          getActivities(),
          getFinanceProfiles(),
        ]);
        setData({ leads, buyers, mandates, matches, activities, financeProfiles });
      } catch (err) {
        console.error("[Header] Failed to load notification data:", err);
      }
    }
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { total, critical, high, notifications, hasNotifications, hasCritical, isLoading } = useNotifications(data);

  const getIconForNotification = (notification: Notification) => {
    switch (notification.type) {
      case "seller_action":
        return User;
      case "buyer_action":
        return User;
      case "mandate_expiring":
        return FileText;
      case "excellent_match":
        return Flame;
      case "finance_blocker":
        return Wallet;
      case "stale_record":
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    router.push(notification.link);
  };

  return (
    <header
  className="h-20 flex items-center justify-between px-8 relative"
  style={{
    background: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)",
  }}
>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search leads, mandates..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "0.5px solid rgba(255, 255, 255, 0.08)",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white/60 hover:text-white hover:bg-white/[0.04]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell className="w-[18px] h-[18px]" />
            {!isLoading && hasNotifications && (
              <span
                className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1 ${
                  hasCritical ? "bg-red-500 text-white" : "bg-amber-500 text-black"
                }`}
              >
                {total > 9 ? "9+" : total}
              </span>
            )}
          </Button>

          {/* Notification Dropdown */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 surface-elevated rounded-xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    {critical > 0 && (
                      <span className="text-red-400 font-medium">{critical} critical</span>
                    )}
                    {critical > 0 && high > 0 && <span className="text-white/30"> · </span>}
                    {high > 0 && (
                      <span className="text-amber-400 font-medium">{high} high priority</span>
                    )}
                    {critical === 0 && high === 0 && total > 0 && (
                      <span>{total} items need attention</span>
                    )}
                    {total === 0 && <span>All caught up</span>}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/40 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Notification List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-sm text-white/60">No notifications</p>
                    <p className="text-xs text-white/40 mt-1">You&apos;re all caught up</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => {
                    const Icon = getIconForNotification(notification);
                    return (
                      <button
                        key={notification.id}
                        className="w-full text-left p-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors flex items-start gap-3"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${urgencyColor(notification.urgency)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${
                              notification.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                              notification.urgency === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {urgencyLabel(notification.urgency)}
                            </span>
                          </div>
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          <p className="text-xs text-white/50 truncate mt-0.5">{notification.description}</p>
                          {notification.actionLabel && (
                            <p className="text-xs text-emerald-400 mt-2 font-medium">{notification.actionLabel} →</p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/[0.06] bg-white/[0.02]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-white/50 hover:text-white"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/");
                    }}
                  >
                    View all in Command Center
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
