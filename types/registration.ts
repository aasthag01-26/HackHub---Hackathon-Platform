export type RegistrationType = 'individual' | 'team';
export type ParticipationStatus = 'registered' | 'under_review' | 'accepted' | 'waitlisted' | 'rejected' | 'submitted';

export interface HackathonProjectSubmission {
  projectTitle: string;
  tagline: string;
  description: string;
  techStack: string[];
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  submittedAt: string;
}

export interface StudentRegistration {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  registrationType: RegistrationType;
  teamName?: string;
  teamMembers: {
    name: string;
    email: string;
    role: string;
    confirmed: boolean;
  }[];
  participationStatus: ParticipationStatus;
  invitationCode: string;
  registeredAt: string;
  projectSubmission?: HackathonProjectSubmission;
}

export interface HackathonInvitation {
  id: string;
  hackathonTitle: string;
  teamName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
}
