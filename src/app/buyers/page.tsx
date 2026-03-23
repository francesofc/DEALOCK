"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { EditDrawer } from "@/components/ui/EditDrawer";
import { BuyerCreatePanel } from "@/components/buyers/BuyerCreatePanel";
import { 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Wallet,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  ShieldCheck,
  UserCircle,
  Flame
} from "lucide-react";
import { getBuyers, getFinanceProfileByBuyer, createBuyer, saveFinanceProfile } from "@/lib/data";
import { Buyer, BuyerStatus, FinanceProfile } from "@/types/database";

// ============================================
// BUYER STATUS LOGIC
// ============================================

const statusMap: Record<BuyerStatus, { 
  label: string; 
  className: string;
  stage: 'new' | 'engaged' | 'qualified' | 'active' | 'closed' | 'inactive';
}> = {
  new: { label: "New", className: "bg-white/[0.06] text-white/60", stage: 'new' },
  contacted: { label: "Contacted", className: "bg-amber-500/15 text-amber-400", stage: 'engaged' },
  qualified: { label: "Qualified", className: "bg-blue-500/15 text-blue-400", stage: 'qualified' },
  viewing_scheduled: { label: "Viewing", className: "bg-violet-500/15 text-violet-400", stage: 'active' },
  offer_pending: { label: "Offer", className: "bg-orange-500/15 text-orange-400", stage: 'active' },
  closed: { label: "Closed", className: "bg-emerald-500/15 text-emerald-400", stage: 'closed' },
  inactive: { label: "Inactive", className: "bg-red-500/15 text-red-400", stage: 'inactive' },
};

const seriousnessMap = {
  low: { 
    label: "Browsing", 
    color: "text-white/40",
    bg: "bg-white/[0.04]",
    icon: Clock
  },
  medium: { 
    label: "Interested", 
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    icon: Target
  },
  high: { 
    label: "Serious", 
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: TrendingUp
  },
  very_high: { 
    label: "Committed", 
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    icon: CheckCircle2
  },
};

const timelineMap = {
  browsing: { label: "Browsing", color: "text-white/40", urgency: 'low' },
  '3_months': { label: "3 months", color: "text-amber-400", urgency: 'medium' },
  '1_month': { label: "1 month", color: "text-emerald-400", urgency: 'high' },
  immediate: { label: "Immediate", color: "text-violet-400", urgency: 'urgent' },
};

// Combined qualification state
function getQualificationState(buyer: Buyer, finance: FinanceProfile | null | undefined): {
  state: 'new' | 'contacted' | 'qualified' | 'verified' | 'finance_ready' | 'blocked';
  label: string;
  color: string;
  bg: string;
} {
  if (buyer.status === 'new') return { 
    state: 'new', label: 'New Lead', color: 'text-white/50', bg: 'bg-white/[0.04]' 
  };
  if (buyer.status === 'contacted') return { 
    state: 'contacted', label: 'Contacted', color: 'text-amber-400', bg: 'bg-amber-500/10' 
  };
  if (!finance || finance.completion_percentage < 50) {
    return { 
      state: 'qualified', label: 'Qualified', color: 'text-blue-400', bg: 'bg-blue-500/10' 
    };
  }
  if (finance.status === 'needs_clarification' || finance.status === 'incomplete') {
    return { 
      state: 'blocked', label: 'Finance Blocked', color: 'text-red-400', bg: 'bg-red-500/10' 
    };
  }
  if (finance.status === 'under_review') {
    return { 
      state: 'verified', label: 'Under Review', color: 'text-amber-400', bg: 'bg-amber-500/10' 
    };
  }
  return { 
    state: 'finance_ready', label: 'Finance Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10' 
  };
}

// Get buyer priority score for sorting
type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';

function getBuyerPriority(buyer: Buyer, finance: FinanceProfile | null | undefined): {
  level: PriorityLevel;
  score: number;
} {
  let score = 0;
  
  // Timeline urgency
  if (buyer.timeline === 'immediate') score += 40;
  else if (buyer.timeline === '1_month') score += 30;
  else if (buyer.timeline === '3_months') score += 15;
  
  // Seriousness
  if (buyer.seriousness === 'very_high') score += 30;
  else if (buyer.seriousness === 'high') score += 20;
  else if (buyer.seriousness === 'medium') score += 10;
  
  // Finance readiness
  if (finance?.status === 'strong_buyer') score += 30;
  else if (finance?.status === 'ready_to_progress') score += 25;
  else if (finance?.status === 'under_review') score += 15;
  
  // Pre-approved bonus
  if (buyer.pre_approved) score += 10;
  
  let level: PriorityLevel = 'low';
  if (score >= 80) level = 'urgent';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'normal';
  
  return { level, score };
}

export default function BuyersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [financeMap, setFinanceMap] = useState<Record<string, FinanceProfile | null | undefined>>({});
  const [loading, setLoading] = useState(true);
  
  // Create drawer state
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [newBuyerData, setNewBuyerData] = useState<Partial<Buyer>>({});
  const [newFinanceData, setNewFinanceData] = useState<Partial<FinanceProfile>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadBuyers() {
      try {
        const data = await getBuyers();
        setBuyers(data);
        
        const profiles: Record<string, FinanceProfile | null> = {};
        for (const buyer of data) {
          try {
            profiles[buyer.id] = await getFinanceProfileByBuyer(buyer.id);
          } catch (profileErr) {
            console.error(`Error loading finance profile for buyer ${buyer.id}:`, profileErr);
          }
        }
        setFinanceMap(profiles);
      } catch (err) {
        console.error('Error loading buyers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuyers();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const stats = {
    total: buyers.length,
    financeReady: buyers.filter(b => {
      const f = financeMap[b.id];
      return f && (f.status === 'ready_to_progress' || f.status === 'strong_buyer');
    }).length,
    urgent: buyers.filter(b => {
      const priority = getBuyerPriority(b, financeMap[b.id]);
      return priority.level === 'urgent';
    }).length,
    blocked: buyers.filter(b => {
      const f = financeMap[b.id];
      return f && (f.status === 'incomplete' || f.status === 'needs_clarification');
    }).length,
    committed: buyers.filter(b => b.seriousness === 'high' || b.seriousness === 'very_high').length,
  };

  // Sort buyers by priority (highest first), then by created_at (newest first)
  const sortedBuyers = [...buyers].sort((a, b) => {
    const aPriority = getBuyerPriority(a, financeMap[a.id]);
    const bPriority = getBuyerPriority(b, financeMap[b.id]);
    // First sort by priority level
    if (bPriority.score !== aPriority.score) {
      return bPriority.score - aPriority.score;
    }
    // Then by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Group by priority
  const urgentBuyers = sortedBuyers.filter(b => getBuyerPriority(b, financeMap[b.id]).level === 'urgent');
  const highBuyers = sortedBuyers.filter(b => getBuyerPriority(b, financeMap[b.id]).level === 'high');
  const normalBuyers = sortedBuyers.filter(b => getBuyerPriority(b, financeMap[b.id]).level === 'normal');
  const lowBuyers = sortedBuyers.filter(b => getBuyerPriority(b, financeMap[b.id]).level === 'low');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading buyers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buyers</h1>
          <p className="text-white/40 mt-1">Buyer qualification workspace</p>
        </div>
        <Button 
          className="gap-2 bg-white text-black hover:bg-white/90"
          onClick={() => setIsCreateDrawerOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Buyer
        </Button>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard icon={Users} value={stats.total} label={t.buyers.stats.total} />
        <StatCard icon={ShieldCheck} value={stats.financeReady} label={t.buyers.stats.ready} color="emerald" />
        <StatCard icon={Flame} value={stats.urgent} label={t.buyers.stats.urgent} color="red" />
        <StatCard icon={TrendingUp} value={stats.committed} label={t.buyers.stats.committed} color="violet" />
        <StatCard icon={AlertCircle} value={stats.blocked} label={t.buyers.stats.blocked} color="amber" />
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder={t.buyers.search_placeholder}
            className="pl-11 bg-white/[0.03] border-white/[0.06] focus:border-white/10"
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* BUYERS LIST - GROUPED BY PRIORITY */}
      <div className="space-y-6">
        
        {/* URGENT */}
        {urgentBuyers.length > 0 && (
          <section>
            <PriorityHeader icon={Flame} title="Urgent" count={urgentBuyers.length} color="red" />
            <div className="space-y-2">
              {urgentBuyers.map(buyer => (
                <BuyerRow key={buyer.id} buyer={buyer} finance={financeMap[buyer.id]} onClick={() => router.push(`/buyers/${buyer.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* HIGH PRIORITY */}
        {highBuyers.length > 0 && (
          <section>
            <PriorityHeader icon={Zap} title="High Priority" count={highBuyers.length} color="orange" />
            <div className="space-y-2">
              {highBuyers.map(buyer => (
                <BuyerRow key={buyer.id} buyer={buyer} finance={financeMap[buyer.id]} onClick={() => router.push(`/buyers/${buyer.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* NORMAL */}
        {normalBuyers.length > 0 && (
          <section>
            <PriorityHeader icon={Target} title="Active" count={normalBuyers.length} color="blue" />
            <div className="space-y-2">
              {normalBuyers.map(buyer => (
                <BuyerRow key={buyer.id} buyer={buyer} finance={financeMap[buyer.id]} onClick={() => router.push(`/buyers/${buyer.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* LOW PRIORITY */}
        {lowBuyers.length > 0 && (
          <section className="opacity-60">
            <PriorityHeader icon={Clock} title="Nurture" count={lowBuyers.length} color="default" />
            <div className="space-y-2">
              {lowBuyers.map(buyer => (
                <BuyerRow key={buyer.id} buyer={buyer} finance={financeMap[buyer.id]} onClick={() => router.push(`/buyers/${buyer.id}`)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* EMPTY STATE */}
      {buyers.length === 0 && (
        <div className="text-center py-20 surface-subtle rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium mb-2">No buyers yet</h3>
          <p className="text-white/40 text-sm mb-6">Start building your buyer network</p>
          <Button 
            className="gap-2 bg-white text-black hover:bg-white/90"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add First Buyer
          </Button>
        </div>
      )}

      {/* CREATE DRAWER */}
      <EditDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Add New Buyer"
        subtitle="Create a new buyer in your network"
        onSave={() => {
          setIsCreating(true);
          // Persist to Supabase (with localStorage fallback)
          setTimeout(() => {
            // Build the new buyer object from form data with safe defaults
            const newBuyer: Buyer = {
              id: newBuyerData.id || crypto.randomUUID(),
              created_at: newBuyerData.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              name: newBuyerData.name?.trim() || 'New Buyer',
              phone: newBuyerData.phone || '',
              email: newBuyerData.email || '',
              status: (newBuyerData.status as BuyerStatus) || 'new',
              buyer_type: newBuyerData.buyer_type || 'first_time',
              timeline: newBuyerData.timeline || 'browsing',
              seriousness: newBuyerData.seriousness || 'medium',
              language_preference: (newBuyerData.language_preference as any) || 'en',
              budget_min: newBuyerData.budget_min || 0,
              budget_max: newBuyerData.budget_max || 0,
              target_areas: newBuyerData.target_areas || [],
              property_types: newBuyerData.property_types || [],
              min_bedrooms: newBuyerData.min_bedrooms || null,
              min_area_m2: (newBuyerData as any).min_area_m2 || null,
              pre_approved: newBuyerData.pre_approved || false,
              cash_buyer: newBuyerData.cash_buyer || false,
              notes: newBuyerData.notes || null,
              next_action: '',
              next_action_date: null,
            };
            
            // Persist buyer to Supabase (with localStorage fallback)
            createBuyer(newBuyer);
            
            // Update local state for immediate UI update
            setBuyers(prevBuyers => [newBuyer, ...prevBuyers]);
            
            // Also add finance profile if income or deposit was provided
            if (newFinanceData && (newFinanceData.annual_income || newFinanceData.available_down_payment)) {
              const financeProfile: FinanceProfile = {
                id: newFinanceData.id || crypto.randomUUID(),
                buyer_id: newBuyer.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'incomplete',
                annual_income: newFinanceData.annual_income || null,
                available_down_payment: newFinanceData.available_down_payment || null,
                existing_debt_monthly: newFinanceData.existing_debt_monthly || null,
                documents: [],
                documents_complete: false,
                estimated_max_budget: null,
                estimated_monthly_payment: null,
                affordability_status: null,
                under_review_since: null,
                reviewed_by: null,
                review_notes: null,
                missing_documents: [],
                recommended_actions: [],
                completion_percentage: 25,
              };
              // Persist finance profile to Supabase (with localStorage fallback)
              saveFinanceProfile(financeProfile);
              setFinanceMap(prev => ({ ...prev, [newBuyer.id]: financeProfile }));
            }
            
            // Reset form and close drawer
            setIsCreating(false);
            setIsCreateDrawerOpen(false);
            setNewBuyerData({});
            setNewFinanceData({});
          }, 500);
        }}
        isSaving={isCreating}
        saveLabel="Create Buyer"
      >
        <BuyerCreatePanel 
          onChange={setNewBuyerData} 
          onFinanceChange={setNewFinanceData}
        />
      </EditDrawer>
    </div>
  );
}

// ============================================
// BUYER ROW COMPONENT
// ============================================

function BuyerRow({ 
  buyer, 
  finance,
  onClick
}: { 
  buyer: Buyer; 
  finance: FinanceProfile | null | undefined;
  onClick?: () => void;
}) {
  const status = statusMap[buyer.status];
  const seriousness = seriousnessMap[buyer.seriousness];
  const timeline = timelineMap[buyer.timeline];
  const qualification = getQualificationState(buyer, finance);
  const SeriousnessIcon = seriousness.icon;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div 
      className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Seriousness Avatar */}
        <div className={`w-11 h-11 rounded-xl ${seriousness.bg} flex items-center justify-center shrink-0`}>
          <SeriousnessIcon className={`w-5 h-5 ${seriousness.color}`} />
        </div>
        
        {/* Buyer Info */}
        <div className="w-48 shrink-0">
          <h3 className="font-medium">{buyer.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`text-[10px] ${status.className}`}>
              {status.label}
            </Badge>
            {buyer.pre_approved && (
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                Pre-approved
              </Badge>
            )}
          </div>
        </div>

        {/* Target Area */}
        <div className="w-40 shrink-0">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="w-3.5 h-3.5 text-white/30" />
            <span className="text-white/70 truncate">
              {buyer.target_areas[0]}
              {buyer.target_areas.length > 1 && (
                <span className="text-white/40"> +{buyer.target_areas.length - 1}</span>
              )}
            </span>
          </div>
        </div>

        {/* Budget */}
        <div className="w-36 shrink-0">
          <div className="flex items-center gap-1.5 text-sm">
            <Wallet className="w-3.5 h-3.5 text-white/30" />
            <span className="text-white/70">
              {formatCurrency(buyer.budget_max)}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="w-28 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-white/30" />
            <span className={`text-sm ${timeline.color}`}>{timeline.label}</span>
          </div>
        </div>

        {/* Qualification State */}
        <div className="w-32 shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${qualification.bg}`}>
            <span className={`text-xs font-medium ${qualification.color}`}>
              {qualification.label}
            </span>
          </div>
        </div>

        {/* Finance Progress */}
        <div className="w-32 shrink-0">
          {finance ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1">
                  <Progress value={finance.completion_percentage} className="h-1.5" />
                </div>
                <span className="text-xs text-white/50">{finance.completion_percentage}%</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/30">No profile</p>
          )}
        </div>

        {/* Action */}
        <div className="flex-1 flex justify-end">
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
        </div>
      </div>
      
      {/* Next Action Preview */}
      {buyer.next_action && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2">
          <span className="text-xs text-white/30">Next:</span>
          <span className="text-sm text-white/50">{buyer.next_action}</span>
          {buyer.next_action_date && (
            <span className="text-xs text-white/30 ml-auto">
              {new Date(buyer.next_action_date).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color = 'default'
}: { 
  icon: React.ElementType; 
  value: number; 
  label: string; 
  color?: 'default' | 'emerald' | 'red' | 'violet' | 'amber';
}) {
  const colors = {
    default: "bg-white/[0.06] text-white/60",
    emerald: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    violet: "bg-violet-500/10 text-violet-400",
    amber: "bg-amber-500/10 text-amber-400",
  };
  
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function PriorityHeader({ 
  icon: Icon, 
  title, 
  count,
  color
}: { 
  icon: React.ElementType; 
  title: string; 
  count: number;
  color: 'red' | 'orange' | 'blue' | 'default';
}) {
  const colors = {
    red: "text-red-400",
    orange: "text-orange-400",
    blue: "text-blue-400",
    default: "text-white/50",
  };
  
  return (
    <div className="flex items-center gap-3 mb-3">
      <Icon className={`w-4 h-4 ${colors[color]}`} />
      <h3 className={`font-medium ${colors[color]}`}>{title}</h3>
      <span className="text-sm text-white/30">({count})</span>
    </div>
  );
}
