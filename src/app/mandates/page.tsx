"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, MoreHorizontal, FileText } from "lucide-react";

const mandates = [
  { id: "1", client: "Marie Dupont", property: "Lyon Apartment", type: "Exclusive", startDate: "Mar 15, 2024", endDate: "Sep 15, 2024", status: "active", value: "€450,000" },
  { id: "2", client: "João Silva", property: "Cascais Villa", type: "Exclusive", startDate: "Mar 10, 2024", endDate: "Sep 10, 2024", status: "active", value: "€320,000" },
  { id: "3", client: "Emma Johnson", property: "Paris Studio", type: "Non-Exclusive", startDate: "Feb 28, 2024", endDate: "Aug 28, 2024", status: "active", value: "€280,000" },
  { id: "4", client: "Carlos Mendes", property: "Lisbon Apartment", type: "Exclusive", startDate: "Jan 15, 2024", endDate: "Mar 15, 2024", status: "expired", value: "€390,000" },
  { id: "5", client: "Sophie Martin", property: "Bordeaux House", type: "Exclusive", startDate: "Mar 20, 2024", endDate: "Sep 20, 2024", status: "draft", value: "€510,000" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" }> = {
  active: { label: "Active", variant: "success" },
  expired: { label: "Expired", variant: "destructive" },
  draft: { label: "Draft", variant: "warning" },
  terminated: { label: "Terminated", variant: "secondary" },
};

const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "Exclusive": { label: "Exclusive", variant: "default" },
  "Non-Exclusive": { label: "Non-Exclusive", variant: "secondary" },
};

export default function MandatesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mandates"
        description="Manage your seller mandates and exclusivity agreements"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Mandate
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Mandates</p>
            <p className="text-3xl font-bold mt-2">18</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Exclusive</p>
            <p className="text-3xl font-bold mt-2">14</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-3xl font-bold mt-2">€7.2M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-3xl font-bold mt-2">3</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search mandates..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Mandates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Mandates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mandates.map((mandate) => {
                const status = statusMap[mandate.status];
                const type = typeMap[mandate.type];
                return (
                  <TableRow key={mandate.id} className="cursor-pointer">
                    <TableCell>
                      <div className="font-medium">{mandate.client}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{mandate.property}</TableCell>
                    <TableCell>
                      <Badge variant={type.variant}>{type.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div>{mandate.startDate}</div>
                        <div>to {mandate.endDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{mandate.value}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
