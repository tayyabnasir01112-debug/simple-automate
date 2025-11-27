export type Contact = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  tags: string[];
  stages?: Array<{
    stage: { id: string; name: string };
  }>;
};

export type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  completed: boolean;
  contact?: { id: string; name: string | null };
};

export type Pipeline = {
  id: string;
  name: string;
  stages: Array<{ id: string; name: string; position: number }>;
};

export type AutomationStep = {
  id: string;
  type: 'SEND_EMAIL' | 'DELAY' | 'UPDATE_TAGS' | 'MOVE_STAGE';
  position: number;
  config: Record<string, unknown>;
};

export type Automation = {
  id: string;
  name: string;
  active: boolean;
  triggerType: 'NEW_CONTACT' | 'STAGE_CHANGE' | 'DATE';
  steps: AutomationStep[];
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export type EmailCampaign = {
  id: string;
  name: string;
  status: string;
  scheduledFor?: string | null;
  recipients: Array<{
    id: string;
    status: string;
    sentAt?: string | null;
  }>;
};

