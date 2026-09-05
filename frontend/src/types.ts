export type Page =
  | "login"
  | "signup"
  | "forgot-password"
  | "dashboard"
  | "campaigns"
  | "campaign-details"
  | "create-campaign"
  | "contacts"
  | "email-accounts"
  | "sequences"
  | "scheduled-emails"
  | "analytics"
  | "settings";

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type EmailStatus = "pending" | "queued" | "sent" | "failed" | "cancelled" | "opened" | "replied";
export type ContactStatus = "active" | "bounced" | "unsubscribed" | "replied";

export interface Campaign {
  id: string;
  name: string;
  sender: string;
  senderEmail: string;
  status: CampaignStatus;
  contacts: number;
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  scheduled: number;
  steps: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  campaign?: string;
  status: ContactStatus;
  addedAt: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  name: string;
  provider: "google" | "smtp" | "outlook";
  status: "active" | "paused" | "error";
  sentToday: number;
  dailyLimit: number;
  lastActivity: string;
}

export interface ScheduledEmail {
  id: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  campaign: string;
  sender: string;
  scheduledAt: string;
  status: EmailStatus;
  step: number;
}

export interface Sequence {
  id: string;
  name: string;
  campaign: string;
  steps: number;
  contacts: number;
  active: boolean;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: "campaign_started" | "emails_scheduled" | "reply" | "account_connected" | "campaign_paused" | "campaign_created";
  text: string;
  timestamp: string;
  meta?: string;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
