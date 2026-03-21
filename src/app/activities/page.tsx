"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  FileSignature,
  User,
  Users,
  Clock,
  Puzzle,
  Wallet
} from "lucide-react";
import { getActivities, getLeads } from "@/lib/data";
import { Activity, Lead, ActivityType } from "@/types/database";

const activityIcons: Record<ActivityType, React.ElementType> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Calendar,
  note: Clock,
  mandate: FileSignature,
  lead: User,
  buyer: Users,
  match: Puzzle,
  finance: Wallet,
};

const activityLabels: Record<ActivityType, string> = {
  call: "Call",
  email: "Email",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
  note: "Note",
  mandate: "Mandate",
  lead: "Lead",
  buyer: "Buyer",
  match: "Match",
  finance: "Finance",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [activitiesData, leadsData] = await Promise.all([
        getActivities(),
        getLeads(),
      ]);
      setActivities(activitiesData);
      const leadsMap = leadsData.reduce((acc, lead) => {
        acc[lead.id] = lead;
        return acc;
      }, {} as Record<string, Lead>);
      setLeads(leadsMap);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
          <p className="text-white/40 mt-1">Track your interactions and follow-ups</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Log Activity
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search activities..."
            className="pl-11 bg-white/[0.03] border-white/[0.06]"
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
          <Calendar className="w-4 h-4" />
          Calendar
        </Button>
      </div>

      {/* ACTIVITY TIMELINE */}
      <div className="space-y-1">
        {activities.map((activity) => {
          const lead = activity.lead_id ? leads[activity.lead_id] : null;
          const Icon = activityIcons[activity.type];
          
          return (
            <div
              key={activity.id}
              className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white/50" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-medium">{activityLabels[activity.type]}</p>
                  {lead && (
                    <>
                      <span className="text-white/20">·</span>
                      <p className="text-white/70">{lead.owner_name}</p>
                    </>
                  )}
                </div>
                <p className="text-sm text-white/50 mt-1">{activity.content}</p>
              </div>
              
              {/* Meta */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-white/30">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">
                  Done
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {activities.length === 0 && (
        <div className="text-center py-20 surface-subtle rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium mb-2">No activities yet</h3>
          <p className="text-white/40 text-sm mb-6">Your interactions will be tracked here</p>
          <Button className="gap-2 bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Log First Activity
          </Button>
        </div>
      )}
    </div>
  );
}
