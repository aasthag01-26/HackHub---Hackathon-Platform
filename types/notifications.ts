export type NotificationCategory =
  | 'team_invitation'
  | 'team_membership'
  | 'task_assigned'
  | 'task_deadline'
  | 'team_chat'
  | 'hackathon_update'
  | 'participation_status';

export interface InAppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  createdAt?: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
