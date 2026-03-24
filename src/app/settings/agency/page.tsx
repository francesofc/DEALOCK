/**
 * ============================================
 * AGENCY PROFILE SETTINGS (Real Persistence)
 * ============================================
 * 
 * Manage agency profile and workspace configuration.
 * Uses real persisted data from Supabase.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  getActiveWorkspace, 
  updateWorkspaceProfile, 
  WorkspaceRecord 
} from '@/lib/data/workspace';
import { Building2, Globe, MapPin, Phone, Mail, Palette, Upload, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AgencySettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);

  const [formData, setFormData] = useState({
    agencyName: '',
    description: '',
    website: '',
    primaryMarket: '',
    phone: '',
    email: '',
    primaryColor: '#10b981',
  });

  // Load workspace data on mount
  useEffect(() => {
    async function loadWorkspace() {
      try {
        const data = await getActiveWorkspace();
        if (data) {
          setWorkspace(data);
          setFormData({
            agencyName: data.agency_name || '',
            description: data.agency_description || '',
            website: data.agency_website || '',
            primaryMarket: data.primary_market || '',
            phone: data.agency_phone || '',
            email: data.agency_email || '',
            primaryColor: data.primary_color || '#10b981',
          });
        }
      } catch (err) {
        console.error('[AgencySettings] Error loading workspace:', err);
        setError('Failed to load agency profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspace();
  }, []);

  const handleSave = async () => {
    if (!workspace) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateWorkspaceProfile(workspace.id, {
        agencyName: formData.agencyName,
        agencyDescription: formData.description,
        agencyWebsite: formData.website,
        agencyEmail: formData.email,
        agencyPhone: formData.phone,
        primaryMarket: formData.primaryMarket,
        primaryColor: formData.primaryColor,
      });
      
      setSavedMessage('Settings saved successfully');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      console.error('[AgencySettings] Error saving:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const runEnrichment = async () => {
    if (!workspace || !formData.website) return;
    
    // Placeholder for future AI enrichment
    alert('AI enrichment will analyze your website and auto-fill specialties, coverage areas, and more.\n\n(This is a future feature - manual input is required for now.)');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load</h2>
        <p className="text-white/60 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-2xl font-semibold mb-2">Agency Profile</h1>
        <p className="text-white/60">
          Manage your agency identity and workspace configuration
        </p>
      </div>

      <div className="space-y-8">
        {/* Branding Section */}
        <section>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white/50" />
            Branding
          </h2>
          
          <div className="p-6 surface-elevated rounded-xl space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="text-sm font-medium mb-3 block">Agency Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white/[0.06] flex items-center justify-center border-2 border-dashed border-white/10">
                  <Upload className="w-6 h-6 text-white/30" />
                </div>
                <div>
                  <Button variant="outline" size="sm" className="border-white/10">
                    Upload Logo
                  </Button>
                  <p className="text-xs text-white/40 mt-2">
                    Recommended: 400x400px, PNG or SVG
                  </p>
                </div>
              </div>
            </div>

            {/* Agency Name */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agency Name *</label>
                <Input
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  placeholder="Prime Properties"
                  data-testid="settings-agency-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Specialists in luxury properties in Lisbon..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] focus:border-white/10 text-sm resize-none"
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-white/50" />
            Contact & Market
          </h2>
          
          <div className="p-6 surface-elevated rounded-xl space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-white/30" />
                  Website
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://your-agency.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/30" />
                  Primary Market *
                </label>
                <Input
                  value={formData.primaryMarket}
                  onChange={(e) => setFormData({ ...formData, primaryMarket: e.target.value })}
                  placeholder="Lisbon"
                  data-testid="settings-primary-market"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/30" />
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+351 123 456 789"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/30" />
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@your-agency.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* AI Enrichment Section */}
        <section>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white/50" />
            AI Enrichment
          </h2>
          
          <div className="p-6 surface-elevated rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium">Auto-Enrich from Website</h3>
                  {workspace?.enrichment_status === 'completed' && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Enriched
                    </span>
                  )}
                  {workspace?.enrichment_status === 'pending' && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50 mb-4">
                  Let Dealock analyze your website to automatically detect specialties, 
                  property types, coverage areas, and brand positioning.
                </p>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30"
                    onClick={runEnrichment}
                    disabled={!formData.website}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run AI Analysis
                  </Button>
                  {workspace?.enrichment_completed_at && (
                    <span className="text-xs text-white/40">
                      Last run: {new Date(workspace.enrichment_completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {!formData.website && (
                  <p className="text-xs text-amber-400/80 mt-2">
                    Add your website in Contact & Market to enable AI enrichment
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-4">
            {error && (
              <span className="text-sm text-red-400">{error}</span>
            )}
            {savedMessage && (
              <span className="text-sm text-emerald-400">{savedMessage}</span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.agencyName || !formData.primaryMarket}
            className="bg-white text-black hover:bg-white/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
