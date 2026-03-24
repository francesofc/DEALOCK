/**
 * ============================================
 * DEALOCK IMPORT / MIGRATION CENTER
 * ============================================
 * 
 * Architecture for future data import and migration capabilities.
 * Currently shows available options and prepares extension points
 * for CSV, CRM exports, and spreadsheet imports.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  Upload, 
  FileSpreadsheet, 
  Database, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2,
  FileJson,
  Building2,
  Users,
  FileSignature
} from 'lucide-react';

type ImportSource = 'csv' | 'spreadsheet' | 'crm' | null;
type ImportEntity = 'sellers' | 'buyers' | 'mandates' | null;

interface ImportOption {
  id: ImportSource;
  name: string;
  description: string;
  icon: typeof Upload;
  status: 'available' | 'coming-soon' | 'planned';
  supportedEntities: ImportEntity[];
}

const IMPORT_OPTIONS: ImportOption[] = [
  {
    id: 'csv',
    name: 'CSV File',
    description: 'Import from a CSV file with column mapping',
    icon: FileSpreadsheet,
    status: 'coming-soon',
    supportedEntities: ['sellers', 'buyers', 'mandates'],
  },
  {
    id: 'spreadsheet',
    name: 'Excel / Google Sheets',
    description: 'Copy-paste from spreadsheets or upload Excel files',
    icon: FileSpreadsheet,
    status: 'coming-soon',
    supportedEntities: ['sellers', 'buyers'],
  },
  {
    id: 'crm',
    name: 'CRM Export',
    description: 'Import from HubSpot, Pipedrive, or other CRM exports',
    icon: Database,
    status: 'planned',
    supportedEntities: ['sellers', 'buyers', 'mandates'],
  },
];

const ENTITY_OPTIONS = [
  { id: 'sellers' as ImportEntity, name: 'Sellers & Properties', icon: Building2, description: 'Property listings, owners, and listing details' },
  { id: 'buyers' as ImportEntity, name: 'Buyers', icon: Users, description: 'Buyer profiles and requirements' },
  { id: 'mandates' as ImportEntity, name: 'Mandates', icon: FileSignature, description: 'Existing exclusivity agreements' },
];

export default function ImportPage() {
  const router = useRouter();
  const [selectedSource, setSelectedSource] = useState<ImportSource>(null);
  const [selectedEntity, setSelectedEntity] = useState<ImportEntity>(null);
  const [step, setStep] = useState<'select-source' | 'select-entity' | 'configure'>('select-source');

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Import Data</h1>
              <p className="text-sm text-white/50">Migrate your existing data into Dealock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-2 flex-1 rounded-full ${step === 'select-source' ? 'bg-emerald-500' : 'bg-emerald-500/30'}`} />
          <div className={`h-2 flex-1 rounded-full ${step === 'select-entity' ? 'bg-emerald-500' : step === 'configure' ? 'bg-emerald-500/30' : 'bg-white/[0.06]'}`} />
          <div className={`h-2 flex-1 rounded-full ${step === 'configure' ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />
        </div>

        {/* Step 1: Select Source */}
        {step === 'select-source' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Choose Import Source</h2>
              <p className="text-white/60">
                Select where your data is coming from. More options coming soon.
              </p>
            </div>

            <div className="grid gap-4">
              {IMPORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedSource(option.id)}
                  className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                    selectedSource === option.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/[0.06] hover:border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    option.status === 'available' ? 'bg-emerald-500/10' : 'bg-white/[0.06]'
                  }`}>
                    <option.icon className={`w-6 h-6 ${
                      option.status === 'available' ? 'text-emerald-400' : 'text-white/40'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{option.name}</h3>
                      {option.status === 'coming-soon' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Coming Soon
                        </span>
                      )}
                      {option.status === 'planned' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-white/40 border border-white/[0.06]">
                          Planned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 mb-2">{option.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40">Supports:</span>
                      {option.supportedEntities.map(entity => (
                        <span key={entity} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-white/60">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedSource === option.id && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                disabled={!selectedSource}
                onClick={() => setStep('select-entity')}
                className="bg-white text-black hover:bg-white/90"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
