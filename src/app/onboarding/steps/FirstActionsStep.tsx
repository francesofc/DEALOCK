/**
 * First Actions Step - Guided initial setup
 */

'use client';

import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { useRouter } from 'next/navigation';
import { OnboardingTask } from '@/types/onboarding';
import { 
  CheckCircle2, 
  Circle, 
  Import, 
  Plus, 
  Settings, 
  Compass,
  ArrowRight,
  Sparkles,
  Upload
} from 'lucide-react';

const taskIcons: Record<OnboardingTask['actionType'], typeof Import> = {
  import: Import,
  create: Plus,
  configure: Settings,
  explore: Compass,
};

const priorityColors = {
  critical: 'text-amber-400',
  recommended: 'text-blue-400',
  optional: 'text-white/40',
};

export function FirstActionsStep() {
  const { state, actions } = useOnboarding();
  const router = useRouter();
  const config = state.workspaceConfig;
  const tasks = config?.onboardingChecklist || [];

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Your workspace is ready</h2>
        <p className="text-white/60">
          Complete these steps to get the most from Dealock
        </p>
      </div>

      {/* Progress */}
      <div className="p-5 surface-elevated rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Setup Progress</span>
          <span className="text-sm text-white/60">{completedCount}/{tasks.length} completed</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Win Options */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Start Fresh</h3>
              <p className="text-sm text-white/60 mb-3">
                Add your first seller lead to see the Command Center come alive with real priorities.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => router.push('/sellers/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Lead
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Import Existing</h3>
              <p className="text-sm text-white/60 mb-3">
                Have existing data? Import your sellers, buyers, or mandates from CSV or spreadsheet.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                onClick={() => router.push('/import')}
              >
                <Import className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Recommended Actions</h3>
        
        {tasks.map((task) => {
          const Icon = taskIcons[task.actionType];
          return (
            <div
              key={task.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                task.isCompleted
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-white/[0.06] hover:border-white/10 bg-white/[0.02]'
              }`}
            >
              <button
                onClick={() => !task.isCompleted && actions.completeTask(task.id)}
                className="shrink-0"
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Circle className="w-6 h-6 text-white/20 hover:text-white/40" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium ${task.isCompleted ? 'line-through text-white/40' : ''}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-white/50">{task.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30">~{task.estimatedMinutes} min</span>
                <Icon className="w-4 h-4 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
        <Button
          variant="ghost"
          onClick={() => actions.setStep('workspace-init')}
        >
          Back
        </Button>

        <Button
          size="lg"
          className="bg-white text-black hover:bg-white/90"
          onClick={actions.completeOnboarding}
        >
          Go to Dealock
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <p className="text-center text-sm text-white/40">
        You can complete these steps later from Settings
      </p>
    </div>
  );
}
