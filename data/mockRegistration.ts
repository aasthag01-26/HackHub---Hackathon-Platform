import { StudentRegistration, HackathonInvitation } from '../types/registration';

export const INITIAL_REGISTRATIONS: StudentRegistration[] = [
  {
    id: 'reg-101',
    hackathonId: 'hack-ai-2026',
    hackathonTitle: 'Global AI Innovators Hackathon 2026',
    registrationType: 'team',
    teamName: 'CyberKnights',
    teamMembers: [
      { name: 'Alex Rivera', email: 'alex@example.com', role: 'Team Lead', confirmed: true },
      { name: 'You', email: 'you@hackhub.io', role: 'Fullstack Dev', confirmed: true },
      { name: 'Marcus Chen', email: 'marcus@example.com', role: 'ML Engineer', confirmed: true },
    ],
    participationStatus: 'accepted',
    invitationCode: 'CK-9821-AI',
    registeredAt: '2026-11-12T10:00:00Z',
    projectSubmission: {
      projectTitle: 'HealthAI Sentinel',
      tagline: 'Autonomous AI triage and diagnostic agent for rural clinics',
      description: 'Built a lightweight multimodal vision & text diagnostic assistant deploying offline on edge devices.',
      techStack: ['Next.js', 'PyTorch', 'FastAPI', 'TailwindCSS'],
      repoUrl: 'https://github.com/hackhub/healthai-sentinel',
      demoUrl: 'https://healthai-sentinel.demo.app',
      videoUrl: 'https://youtube.com/watch?v=demo123',
      submittedAt: '2026-11-17T18:30:00Z',
    },
  },
  {
    id: 'reg-102',
    hackathonId: 'hack-web3-sprint',
    hackathonTitle: 'Ethereum Global Builders Sprint',
    registrationType: 'individual',
    teamMembers: [
      { name: 'You', email: 'you@hackhub.io', role: 'Solidity Developer', confirmed: true },
    ],
    participationStatus: 'under_review',
    invitationCode: 'SOLO-4412-ETH',
    registeredAt: '2026-11-15T14:20:00Z',
  },
];

export const INITIAL_INVITATIONS: HackathonInvitation[] = [
  {
    id: 'inv-201',
    hackathonTitle: 'FinTech Revolution Challenge',
    teamName: 'ZeroKnowledge Pay',
    inviterName: 'Sarah Jenkins',
    inviterEmail: 'sarah.j@example.com',
    role: 'Frontend UI/UX Designer',
    status: 'pending',
    sentAt: '1 day ago',
  },
  {
    id: 'inv-202',
    hackathonTitle: 'Open Source Climate Hack',
    teamName: 'EcoTrackers',
    inviterName: 'Liam O\'Connor',
    inviterEmail: 'liam@ecotrack.org',
    role: 'Backend Data Engineer',
    status: 'pending',
    sentAt: '2 days ago',
  },
];
