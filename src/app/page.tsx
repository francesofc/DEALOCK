"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Target, 
  FileSignature, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  Zap,
  ChevronRight,
  ActivityIcon
} from "lucide-react";
import { getLeads, getActivities, getMandates } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, Activity, Mandate, LeadStatus, ActivityType } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

const activityTypeMap: Record<ActivityType, { label: string }> = {
  call: { label: "Call" },
  email: { label: "Email" },
  whatsapp: { label: "WhatsApp" },
  meeting: { label: "Meeting" },
  note: { label: "Note" },
  mandate: { label: "Mandate" },
  lead: { label: "Lead" },
};

export default function CommandCenterPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [intelligence, setIntelligence] = useState<Record<string, SellerIntelligence>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [leadsData, activitiesData, mandatesData] = await Promise.all([
        getLeads(),
        getActivities(),
        getMandates(),
      ]);
      
      setLeads(leadsData);
      setActivities(activitiesData.slice(0, 5));
      setMandates(mandatesData);
      
      const priorityLeads = leadsData.filter(l => 
        ['qualified', 'replied', 'call_scheduled', 'mandate_proposed'].includes(l.status)
      ).slice(0, 3);
      
      const intelMap: Record<string, SellerIntelligence> = {};
      for (const lead of priorityLeads) {
        const intel = await getLeadIntelligence(lead.id, lead);
        intelMap[lead.id] = intel;
      }
      setIntelligence(intelMap);
      setLoading(false);
    }
    loadData();
  }, []);

  // Business metrics
  const needsAttention = leads.filter(l => 
    ['new', 'contacted'].includes(l.status) || 
    (l.priority_score && l.priority_score > 0.8 && l.status !== 'mandate_signed')
  ).length;
  
  const mandateOpportunities = leads.filter(l => 
    ['qualified', 'replied', 'call_scheduled'].includes(l.status)
  ).length;
  
  const activeMandates = mandates.filter(m => m.status === 'signed').length;
  
  // Priority sellers (top 3 by readiness + priority)
  const prioritySellers = leads
    .filter(l => ['qualified', 'replied', 'call_scheduled', 'mandate_proposed'].includes(l.status))
    .sort((a, b) => {
      const aIntel = intelligence[a.id];
      const bIntel = intelligence[b.id];
      const aScore = (aIntel?.mandate_readiness_score || 0) + ((a.priority_score || 0) * 20);
      const bScore = (bIntel?.mandate_readiness_score || 0) + ((b.priority_score || 0) * 20);
      return bScore - aScore;
    })
    .slice(0, 3);

  // Today's focus actions
  const todaysActions = prioritySellers
    .filter(l => {
      const intel = intelligence[l.id];
      return intel?.suggested_timing === 'today' || intel?.suggested_timing === 'immediate';
    })
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading command center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HERO HEADER */}
      <section className="pb-6 border-b border-white/[0.06]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-white/40 mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl font-semibold tracking-tight">Command Center</h1>
          </div>
          
          {/* Key Metrics - Minimal */}
          <div className="flex items-center gap-8">
            <Metric value={needsAttention} label="Need Attention" />
            <Metric value={mandateOpportunities} label="Opportunities" />
            <Metric value={activeMandates} label="Active Mandates" />
          </div>
        </div>
      </section>

      {/* TODAY'S FOCUS - Primary Section */}
      {todaysActions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">Today's Focus</h2>
          </div>
          
          <div className="space-y-3">
            {todaysActions.map((lead) => {
              const intel = intelligence[lead.id];
              return (
                <div 
                  key={lead.id}
                  className="group flex items-center justify-between p-5 surface-elevated rounded-2xl hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg">
                      {lead.seller_type === 'owner' ? '🏠' : lead.seller_type === 'investor' ? '📈' : '🏗️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{lead.owner_name}</p>
                        <Badge variant="outline" className="text-xs border-white/10">
                          {lead.city}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/50 mt-0.5">
                        {intel?.next_best_move.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {intel && (
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${intel.mandate_readiness_score}%` }}
                            />
                          </div>
                          <span className="text-sm text-white/60">{intel.mandate_readiness_score}%</span>
                        </div>
                      </div>
                    )}
                    <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PRIORITY SELLERS */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-medium">Priority Sellers</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/50 hover:text-white gap-1"
              onClick={() => router.push('/leads')}
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {prioritySellers.map((lead) => {
              const intel = intelligence[lead.id];
              return (
                <div 
                  key={lead.id}
                  className="p-4 surface-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{lead.owner_name}</p>
                      <p className="text-sm text-white/40 mt-0.5">{lead.property_type} · {lead.city}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                  
                  {intel && (
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${intel.mandate_readiness_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40">{intel.mandate_readiness_score}% ready</span>
                      </div>
                      <span className="text-xs text-white/30">·</span>
                      <span className="text-xs text-white/50">{intel.next_best_move.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {prioritySellers.length === 0 && (
              <div className="p-8 text-center text-white/30 surface-subtle rounded-xl">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No priority sellers identified</p>
              </div>
            )}
          </div>
        </section>

        {/* AI SIGNALS & INSIGHTS */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">Strategic Signals</h2>
          </div>
          
          <div className="space-y-3">
            {/* Signal 1 */}
            <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-emerald-400/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/[0.08] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">High mandate readiness detected</p>
                  <p className="text-sm text-white/50 mt-1">
                    {prioritySellers.filter(l => {
                      const intel = intelligence[l.id];
                      return intel && intel.mandate_readiness_score > 70;
                    }).length} leads are approaching mandate readiness
                  </p>
                </div>
              </div>
            </div>

            {/* Signal 2 */}
            {mandateOpportunities > 0 && (
              <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-amber-400/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/[0.08] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">Follow-ups due today</p>
                    <p className="text-sm text-white/50 mt-1">
                      {mandateOpportunities} opportunities require attention
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Signal 3 */}
            <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-blue-400/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/[0.08] flex items-center justify-center shrink-0">
                  <ActivityIcon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Market momentum</p>
                  <p className="text-sm text-white/50 mt-1">
                    Properties in your pipeline are averaging 45 days to close
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RECENT ACTIVITY - Tertiary */}
      <section className="pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <ActivityIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">Recent Activity</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/50 hover:text-white gap-1"
            onClick={() => router.push('/activities')}
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-white/70">{activityTypeMap[activity.type].label}</span>
                  <span className="text-white/30 mx-2">·</span>
                  <span className="text-white/50">{activity.content}</span>
                </p>
              </div>
              <span className="text-xs text-white/30">
                {new Date(activity.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Helper Components

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-right">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
    </div>
  );
}
