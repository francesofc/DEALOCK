/**
 * Basic Info Step - Collect essential information
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { OnboardingInput, TeamSize, PropertyType } from '@/types/onboarding';
import { Building2, MapPin, Users, Globe, ChevronRight } from 'lucide-react';

const TEAM_SIZES: { value: TeamSize; label: string; description: string }[] = [
  { value: 'solo', label: 'Just me', description: 'Independent agent' },
  { value: 'small', label: '2-5 people', description: 'Small team' },
  { value: 'medium', label: '6-15 people', description: 'Growing agency' },
  { value: 'large', label: '16+ people', description: 'Established agency' },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartments' },
  { value: 'house', label: 'Houses' },
  { value: 'villa', label: 'Villas' },
  { value: 'penthouse', label: 'Penthouses' },
  { value: 'loft', label: 'Lofts' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'building', label: 'Buildings' },
  { value: 'land', label: 'Land' },
];

export function BasicInfoStep() {
  const { state, actions } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingInput>({
    agencyName: state.input.agencyName || '',
    primaryMarket: state.input.primaryMarket || '',
    userName: state.input.userName || '',
    userEmail: state.input.userEmail || '',
    website: state.input.website || '',
    phone: state.input.phone || '',
    teamSize: state.input.teamSize || 'solo',
    hasExistingData: state.input.hasExistingData || false,
    language: state.input.language || 'en',
    propertyTypes: state.input.propertyTypes || [],
  });

  const isValid = 
    formData.agencyName.trim() &&
    formData.primaryMarket.trim() &&
    formData.userName.trim() &&
    formData.userEmail.trim() &&
    formData.propertyTypes.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    try {
      await actions.submitBasicInfo(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePropertyType = (type: PropertyType) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Tell us about your agency</h2>
        <p className="text-white/60">
          We'll use this to create your personalized workspace.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Agency Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Agency Name *</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={formData.agencyName}
              onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
              placeholder="e.g., Prime Properties Lisbon"
              className="pl-11"
              data-testid="onboarding-agency-name"
            />
          </div>
        </div>

        {/* Primary Market */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Market *</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={formData.primaryMarket}
              onChange={(e) => setFormData({ ...formData, primaryMarket: e.target.value })}
              placeholder="e.g., Lisbon, Paris, Miami"
              className="pl-11"
              data-testid="onboarding-primary-market"
            />
          </div>
        </div>

        {/* Website (optional but recommended) */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Agency Website
            <span className="text-xs text-white/40 font-normal">— recommended for AI enrichment</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://your-agency.com"
              className="pl-11"
            />
          </div>
        </div>

        {/* Team Size */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-white/50" />
            Team Size *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {TEAM_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setFormData({ ...formData, teamSize: size.value })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.teamSize === size.value
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-white/[0.06] hover:border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="font-medium">{size.label}</div>
                <div className="text-xs text-white/50">{size.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Property Types */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Property Types You Handle *</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => togglePropertyType(type.value)}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                  formData.propertyTypes.includes(type.value)
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/[0.06] hover:border-white/10 bg-white/[0.02]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name *</label>
            <Input
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="John Smith"
              data-testid="onboarding-user-name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              placeholder="john@your-agency.com"
              data-testid="onboarding-user-email"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="ghost"
          onClick={() => actions.setStep('welcome')}
        >
          Back
        </Button>
        
        <Button
          size="lg"
          className="bg-white text-black hover:bg-white/90"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
          data-testid="onboarding-continue"
        >
          {isSubmitting ? (
            'Creating Workspace...'
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
