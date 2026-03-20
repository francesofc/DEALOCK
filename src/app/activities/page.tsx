"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ActivityItem } from "@/components/ui/ActivityItem";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Calendar, CheckCircle, Clock } from "lucide-react";

const activities = [
  { id: "1", type: "call" as const, title: "Discovery call with Marie Dupont", description: "Discussed property details and timeline for Lyon apartment", time: "Today, 2:00 PM", status: "completed" },
  { id: "2", type: "email" as const, title: "Send mandate proposal", description: "João Silva - Villa in Cascais", time: "Today, 4:00 PM", status: "pending" },
  { id: "3", type: "call" as const, title: "Follow-up call", description: "Emma Johnson - Paris apartment pricing discussion", time: "Tomorrow, 10:00 AM", status: "scheduled" },
  { id: "4", type: "mandate" as const, title: "Mandate signed", description: "Marie Dupont - Lyon apartment exclusivity", time: "Yesterday", status: "completed" },
  { id: "5", type: "lead" as const, title: "New lead consultation", description: "Carlos Mendes - Initial property evaluation", time: "Mar 18, 3:00 PM", status: "completed" },
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Activities"
        description="Track your tasks, calls, and follow-ups"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        }
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Calendar View
        </Button>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <ActivityItem
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {activity.status === "completed" && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Done
                    </Badge>
                  )}
                  {activity.status === "scheduled" && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      Scheduled
                    </Badge>
                  )}
                  {activity.status === "pending" && (
                    <Badge variant="warning" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
