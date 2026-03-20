"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  User, 
  Users, 
  Bot, 
  Building2, 
  Activity,
  ChevronRight,
  Globe,
  Bell,
  Shield,
  Database
} from "lucide-react";

const settingsSections = [
  {
    id: "profile",
    title: "Profile",
    description: "Manage your personal information and preferences",
    icon: User,
  },
  {
    id: "team",
    title: "Team",
    description: "Add and manage team members",
    icon: Users,
  },
  {
    id: "ai",
    title: "AI Settings",
    description: "Configure AI prompts and automation rules",
    icon: Bot,
  },
  {
    id: "business",
    title: "Business Defaults",
    description: "Set default values for mandates and communications",
    icon: Building2,
  },
  {
    id: "diagnostics",
    title: "Diagnostics",
    description: "System health and troubleshooting",
    icon: Activity,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Menu */}
        <div className="lg:col-span-1 space-y-2">
          {settingsSections.map((section) => (
            <Card key={section.id} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{section.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+33 6 12 34 56 78" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* AI Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Customize AI behavior and prompts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">AI Script Generation</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically generate personalized scripts for calls and emails
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Smart Follow-ups</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered suggestions for follow-up timing and content
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Seller Intelligence</span>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyze lead behavior and predict conversion likelihood
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Defaults Section */}
          <Card>
            <CardHeader>
              <CardTitle>Business Defaults</CardTitle>
              <CardDescription>Set default values for new mandates and communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Mandate Duration (months)</label>
                <Input type="number" placeholder="6" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Commission Rate (%)</label>
                <Input type="number" placeholder="5" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Language</label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <select className="flex-1 h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
              </div>
              <Button>Save Defaults</Button>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive daily summaries</p>
                  </div>
                </div>
                <Badge variant="success">On</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-muted-foreground">Login and access notifications</p>
                  </div>
                </div>
                <Badge variant="success">On</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostics Section */}
          <Card>
            <CardHeader>
              <CardTitle>System Diagnostics</CardTitle>
              <CardDescription>Check system health and connectivity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Database Connection</p>
                    <p className="text-sm text-muted-foreground">Supabase connection status</p>
                  </div>
                </div>
                <Badge variant="outline">Not configured</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">AI Service</p>
                    <p className="text-sm text-muted-foreground">LLM API connection status</p>
                  </div>
                </div>
                <Badge variant="outline">Not configured</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
