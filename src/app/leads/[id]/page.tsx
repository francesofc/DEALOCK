"use client";

import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ActivityItem } from "@/components/ui/ActivityItem";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileSignature,
  MapPin,
  Clock,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div className="space-y-4">
        <Link href="/leads">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Leads
          </Button>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Marie Dupont</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="success">Qualified</Badge>
              <span className="text-sm text-muted-foreground">Added 3 days ago</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button size="sm">
              <FileSignature className="w-4 h-4 mr-2" />
              Propose Mandate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">marie@example.com</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">+33 6 12 34 56 78</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Location</p>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">Lyon, France</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="font-medium">3-bedroom Apartment</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="font-medium">€450,000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium">Referral from Jean Martin</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <p className="text-sm">
                Marie is looking to sell her apartment within the next 2 months. 
                She has already renovated the kitchen and is open to exclusivity. 
                Prefers communication via email during business hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seller Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle>Seller Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Motivation Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-green-500 rounded-full" />
                  </div>
                  <span className="text-sm font-medium">High</span>
                </div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Urgency</p>
                <p className="text-sm text-muted-foreground">Wants to sell within 60 days</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Price Expectation</p>
                <p className="text-sm text-muted-foreground">Realistic - market value</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Exclusivity Potential</p>
                <Badge variant="success">High</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Scripts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Scripts</CardTitle>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Initial Contact</span>
                </div>
                <p className="text-xs text-muted-foreground">Generate a personalized introduction message</p>
              </div>
              <div className="p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Follow-up Call Script</span>
                </div>
                <p className="text-xs text-muted-foreground">Script for the next scheduled call</p>
              </div>
              <div className="p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <FileSignature className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Mandate Proposal</span>
                </div>
                <p className="text-xs text-muted-foreground">Generate exclusivity proposal email</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                type="call"
                title="Discovery call"
                description="Discussed property details and timeline"
                time="2 hours ago"
              />
              <ActivityItem
                type="email"
                title="Sent market analysis"
                description="Comparative market analysis email"
                time="Yesterday"
              />
              <ActivityItem
                type="lead"
                title="Lead created"
                description="Added to system from referral"
                time="3 days ago"
              />
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4">
              <Clock className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
        <Button variant="outline">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send WhatsApp
        </Button>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Send Email
        </Button>
        <Button variant="secondary">
          Move to Pipeline
        </Button>
      </div>
    </div>
  );
}
