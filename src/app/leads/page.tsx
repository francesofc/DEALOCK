"use client";

import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";

const leads = [
  { id: "1", name: "Marie Dupont", email: "marie@example.com", phone: "+33 6 12 34 56 78", status: "qualified", source: "Referral", lastActivity: "2 hours ago" },
  { id: "2", name: "João Silva", email: "joao@example.com", phone: "+351 912 345 678", status: "contacted", source: "Website", lastActivity: "4 hours ago" },
  { id: "3", name: "Emma Johnson", email: "emma@example.com", phone: "+44 7700 900123", status: "new", source: "Social Media", lastActivity: "1 day ago" },
  { id: "4", name: "Carlos Mendes", email: "carlos@example.com", phone: "+351 923 456 789", status: "replied", source: "Email Campaign", lastActivity: "2 days ago" },
  { id: "5", name: "Sophie Martin", email: "sophie@example.com", phone: "+33 6 98 76 54 32", status: "call_scheduled", source: "Referral", lastActivity: "3 days ago" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" }> = {
  new: { label: "New", variant: "default" },
  qualified: { label: "Qualified", variant: "success" },
  contacted: { label: "Contacted", variant: "warning" },
  replied: { label: "Replied", variant: "secondary" },
  call_scheduled: { label: "Call Scheduled", variant: "outline" },
};

export default function LeadsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leads"
        description="Manage your seller leads and track their progress"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const status = statusMap[lead.status];
              return (
                <TableRow
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="font-medium">{lead.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground">{lead.email}</div>
                    <div className="text-xs text-muted-foreground">{lead.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.lastActivity}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
