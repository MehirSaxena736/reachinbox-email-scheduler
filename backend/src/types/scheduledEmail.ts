import { ScheduledEmail, ScheduledEmailStatus } from "@prisma/client";

export type { ScheduledEmail, ScheduledEmailStatus };

export interface ScheduledEmailListFilters {
  workspaceId?: string;
  campaignId?: string;
  contactId?: string;
  status?: ScheduledEmailStatus;
}
