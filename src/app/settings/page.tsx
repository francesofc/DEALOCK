"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  User, 
  Languages,
  Bot,
  Bell,
  Database,
  Globe,
  Check,
  ChevronRight
} from "lucide-react";
import { LANGUAGES, Language } from "@/types/i18n";

const settingsSections = [
  { id: "profile", title: "Profile", description: "Your information", icon: User },
  { id: "languages", title: "Languages", description: "Interface & communications", icon: Languages },
  { id: "ai", title: "AI Settings", description: "Intelligence configuration", icon: Bot },
  { id: "notifications", title: "Notifications", description: "Alerts & updates", icon: Bell },
  { id: "system", title: "System", description: "Diagnostics & status", icon: Database },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [interfaceLang, setInterfaceLang] = useState<Language>("en");
  const [supportedLangs, setSupportedLangs] = useState<Language[]>(["en", "fr", "pt"]);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="pb-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-medium mb-1">Profile Information</h2>
              <p className="text-sm text-white/40">Manage your account details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">First Name</label>
                <Input defaultValue="John" className="bg-white/[0.03] border-white/[0.06]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Last Name</label>
                <Input defaultValue="Doe" className="bg-white/[0.03] border-white/[0.06]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Email</label>
              <Input defaultValue="john@dealock.com" className="bg-white/[0.03] border-white/[0.06]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Phone</label>
              <Input defaultValue="+33 6 12 34 56 78" className="bg-white/[0.03] border-white/[0.06]" />
            </div>
            
            <Button className="bg-white text-black hover:bg-white/90">Save Changes</Button>
          </div>
        );

      case "languages":
        return (
          <div className="space-y-8">
            <div className="pb-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-medium mb-1">Languages</h2>
              <p className="text-sm text-white/40">Configure interface and communication languages</p>
            </div>
            
            {/* Interface Language */}
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-4">Interface Language</h3>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => setInterfaceLang(lang.code)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                      interfaceLang === lang.code 
                        ? 'bg-white/[0.06] border border-white/[0.1]' 
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-white/40" />
                      <div>
                        <p className="font-medium">{lang.nativeName}</p>
                        <p className="text-sm text-white/40">{lang.name}</p>
                      </div>
                    </div>
                    {interfaceLang === lang.code && (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30 mt-4">More languages coming: Spanish, Russian</p>
            </div>

            {/* Supported Languages */}
            <div className="pt-6 border-t border-white/[0.06]">
              <h3 className="text-sm font-medium text-white/60 mb-4">Communication Languages</h3>
              <p className="text-sm text-white/40 mb-4">Languages enabled for AI scripts and client communications</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (supportedLangs.includes(lang.code)) {
                        setSupportedLangs(supportedLangs.filter(l => l !== lang.code));
                      } else {
                        setSupportedLangs([...supportedLangs, lang.code]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      supportedLangs.includes(lang.code)
                        ? 'bg-white text-black'
                        : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div className="pb-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-medium mb-1">AI Configuration</h2>
              <p className="text-sm text-white/40">Manage intelligence features</p>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "Seller Intelligence", desc: "AI-powered lead analysis and recommendations", enabled: true },
                { title: "Script Generation", desc: "Personalized outreach scripts", enabled: true },
                { title: "Mandate Activation", desc: "Go-to-market strategy generation", enabled: true, badge: "Beta" },
              ].map((feature, i) => (
                <div key={i} className="p-4 surface-subtle rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{feature.title}</p>
                        {feature.badge && <Badge variant="outline" className="text-[10px]">{feature.badge}</Badge>}
                      </div>
                      <p className="text-sm text-white/40 mt-1">{feature.desc}</p>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-0">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="pb-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-medium mb-1">Notifications</h2>
              <p className="text-sm text-white/40">Configure your alert preferences</p>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "Email Summaries", desc: "Daily digest of your pipeline activity", enabled: true },
                { title: "Mandate Alerts", desc: "Notifications when mandates are signed or expire", enabled: true },
                { title: "Follow-up Reminders", desc: "Reminders for scheduled follow-ups", enabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 surface-subtle rounded-xl">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${item.enabled ? 'bg-white' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${item.enabled ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <div className="pb-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-medium mb-1">System Status</h2>
              <p className="text-sm text-white/40">Check connectivity and health</p>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "Database", status: "Connected", desc: "Supabase connection active" },
                { title: "AI Engine", status: "Active", desc: "Seller intelligence ready" },
                { title: "Translation Service", status: "Ready", desc: "Multilingual support enabled" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 surface-subtle rounded-xl">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-0">{item.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="mb-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-white/40 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MENU */}
        <div className="lg:col-span-1 space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                activeSection === section.id 
                  ? 'bg-white/[0.06] text-white' 
                  : 'text-white/60 hover:bg-white/[0.02] hover:text-white'
              }`}
            >
              <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-white/40'}`} />
              <div className="flex-1">
                <p className="font-medium">{section.title}</p>
                <p className={`text-xs ${activeSection === section.id ? 'text-white/50' : 'text-white/30'}`}>
                  {section.description}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-opacity ${activeSection === section.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-2">
          <div className="surface-elevated rounded-2xl p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
