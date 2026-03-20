import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/ui/KPICard";
import { ActivityItem } from "@/components/ui/ActivityItem";
import { PipelineStage } from "@/components/ui/PipelineStage";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  FileSignature, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        description="Overview of your mandates and pipeline"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Leads"
          value="124"
          change="+12%"
          trend="up"
          icon={Users}
        />
        <KPICard
          title="Active Mandates"
          value="18"
          change="+3"
          trend="up"
          icon={FileSignature}
        />
        <KPICard
          title="Conversion Rate"
          value="23%"
          change="+2.5%"
          trend="up"
          icon={TrendingUp}
        />
        <KPICard
          title="Avg. Time to Mandate"
          value="14 days"
          change="-2 days"
          trend="up"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Follow up with Marie Dupont</p>
                  <p className="text-sm text-muted-foreground">Call scheduled 2 days ago</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Send mandate proposal</p>
                  <p className="text-sm text-muted-foreground">João Silva - Villa in Cascais</p>
                </div>
                <Button size="sm" variant="outline">Send</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Review exclusivity terms</p>
                  <p className="text-sm text-muted-foreground">Emma Johnson - Paris apartment</p>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                type="mandate"
                title="Mandate signed"
                description="Marie Dupont - Lyon apartment"
                time="2 hours ago"
              />
              <ActivityItem
                type="call"
                title="Call completed"
                description="João Silva - Initial consultation"
                time="4 hours ago"
              />
              <ActivityItem
                type="email"
                title="Proposal sent"
                description="Emma Johnson - Exclusivity terms"
                time="Yesterday"
              />
              <ActivityItem
                type="lead"
                title="New lead added"
                description="Carlos Mendes - Lisbon property"
                time="Yesterday"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
            <PipelineStage name="New" count={12} />
            <PipelineStage name="Qualified" count={8} />
            <PipelineStage name="Contacted" count={15} />
            <PipelineStage name="Replied" count={6} />
            <PipelineStage name="Call Scheduled" count={4} />
            <PipelineStage name="Mandate Proposed" count={3} />
            <PipelineStage name="Mandate Sent" count={2} />
            <PipelineStage name="Mandate Signed" count={18} active />
            <PipelineStage name="Lost" count={7} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
