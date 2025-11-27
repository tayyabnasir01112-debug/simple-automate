#!/usr/bin/env tsx
import crypto from 'node:crypto';
import path from 'node:path';
import { promises as fs } from 'node:fs';

type Mailbox = {
  address: string;
  sid: string;
};

const API_URL = (process.env.API_URL ?? 'https://simpleautomate-api.onrender.com/api').replace(/\/$/, '');
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://simpleautomate.co.uk';
const WAIT_BETWEEN_POLLS_MS = 5000;
const MAX_WAIT_MS = 120000;
const RESULTS_DIR = path.resolve(process.cwd(), 'docs', 'test-results');
const ACCOUNT_FILE = path.join(RESULTS_DIR, 'account.json');
const CONTACT_NAME = 'Smoke Test Contact';

const log = (message: string, extra?: Record<string, unknown>) => {
  const payload = extra ? `${message} ${JSON.stringify(extra)}` : message;
  console.log(`[smoke] ${payload}`);
};

const toJson = async (res: { status: number; text(): Promise<string> }) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Non-JSON response (${res.status}): ${text}`);
  }
};

const apiFetch = async <T>(
  path: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    token?: string;
    cookie?: string;
  } = {},
) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.cookie ? { Cookie: options.cookie } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const payload = await res.text();
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${payload}`);
  }

  const data = (await toJson(res)) as T;
  const setCookie = res.headers.get('set-cookie') ?? undefined;
  return { data, cookie: setCookie };
};

const requestMailbox = async (): Promise<Mailbox> => {
  const res = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
  const data = (await res.json()) as { email_addr: string; sid_token: string };
  return { address: data.email_addr, sid: data.sid_token };
};

const waitForEmail = async (mailbox: Mailbox, subjectIncludes: string) => {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    const listRes = await fetch(
      `https://api.guerrillamail.com/ajax.php?f=get_email_list&sid_token=${mailbox.sid}&offset=0`,
    );
    const messages = (await listRes.json()) as {
      list: Array<{ mail_id: string; mail_subject: string }>;
    };
    const target = messages.list?.find((msg) => msg.mail_subject.includes(subjectIncludes));
    if (target) {
      const detailRes = await fetch(
        `https://api.guerrillamail.com/ajax.php?f=fetch_email&sid_token=${mailbox.sid}&email_id=${target.mail_id}`,
      );
      return (await detailRes.json()) as { mail_subject: string; mail_body: string };
    }
    await new Promise((resolve) => setTimeout(resolve, WAIT_BETWEEN_POLLS_MS));
  }
  throw new Error(`Timed out waiting for email containing "${subjectIncludes}"`);
};

const extractToken = (body: string) => {
  const match = body.match(/token=([a-z0-9-]+)/i);
  if (!match) throw new Error('Could not locate verification token in email body');
  return match[1];
};

const main = async () => {
  await fs.mkdir(RESULTS_DIR, { recursive: true });
  log(`API base ${API_URL}`);
  const password = `Test${crypto.randomUUID().slice(0, 8)}!Aa`;
  const accountMailbox = await requestMailbox();
  const contactMailbox = await requestMailbox();
  log('Workspace credentials', {
    email: accountMailbox.address,
    password,
    contactEmail: contactMailbox.address,
  });

  log('Signing up new workspace', { email: accountMailbox.address });
  await apiFetch('/auth/signup', {
    body: { email: accountMailbox.address, password },
  });

  log('Waiting for verification email');
  const verificationEmail = await waitForEmail(accountMailbox, 'Verify your SimpleAutomate email');
  const verifyToken = extractToken(verificationEmail.mail_body);

  log('Verifying account');
  await apiFetch('/auth/verify', { body: { token: verifyToken } });

  log('Logging in');
  const loginRes = await apiFetch<{ user: { id: string }; accessToken: string }>('/auth/login', {
    body: { email: accountMailbox.address, password },
  });
  const token = loginRes.data.accessToken;
  const cookie = loginRes.cookie;

  const authFetch = <T>(path: string, options: { method?: string; body?: Record<string, unknown> } = {}) =>
    apiFetch<T>(path, { ...options, token, cookie });

  log('Fetching default pipeline');
  const pipelinesRes = await authFetch<{
    pipelines: Array<{ id: string; stages: Array<{ id: string; name: string }> }>;
  }>('/pipelines');
  const pipeline = pipelinesRes.data.pipelines[0];
  if (!pipeline) throw new Error('Expected default pipeline');
  const defaultStageId = pipeline.stages[0].id;
  const advancedStageId = pipeline.stages[1]?.id ?? pipeline.stages[0].id;

  log('Creating contact');
  const contactRes = await authFetch<{ contact: { id: string } }>('/contacts', {
    body: {
      name: CONTACT_NAME,
      email: contactMailbox.address,
      phone: '+1-555-0100',
      tags: ['smoke', 'automation'],
      stageId: defaultStageId,
    },
  });
  const contactId = contactRes.data.contact.id;

  log('Adding note & revision history');
  const noteRes = await authFetch<{ note: { id: string } }>(`/notes/contacts/${contactId}`, {
    body: { content: 'Initial discovery call scheduled.' },
  });
  await authFetch(`/notes/${noteRes.data.note.id}`, {
    method: 'PUT',
    body: { content: 'Rescheduled call with updated agenda.' },
  });
  const revisions = await authFetch<{ revisions: Array<{ id: string }> }>(
    `/notes/${noteRes.data.note.id}/revisions`,
  );
  if (!revisions.data.revisions.length) {
    throw new Error('Expected at least one note revision');
  }

  log('Creating automation');
  const automationRes = await authFetch<{ automation: { id: string } }>('/automations', {
    body: {
      name: 'Smoke Follow-up',
      active: true,
      triggerType: 'STAGE_CHANGE',
      triggerConfig: { stageId: advancedStageId },
      steps: [
        {
          type: 'SEND_EMAIL',
          position: 0,
          config: { subject: 'Stage change alert', body: 'Congrats moving forward!' },
        },
        {
          type: 'UPDATE_TAGS',
          position: 1,
          config: { action: 'add', tags: ['advanced'] },
        },
      ],
    },
  });

  log('Creating task');
  const taskRes = await authFetch<{ task: { id: string } }>('/tasks', {
    body: {
      title: 'Follow up email',
      contactId,
      dueDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  });
  await authFetch(`/tasks/${taskRes.data.task.id}/complete`, { method: 'POST' });

  log('Moving contact to next stage (should enqueue automation)');
  await authFetch(`/contacts/${contactId}/stage`, {
    body: { stageId: advancedStageId },
  });

  log('Creating email template');
  const templateRes = await authFetch<{ template: { id: string } }>('/templates', {
    body: {
      name: 'Smoke Template',
      subject: 'Template Subject',
      body: '<p>Template body content.</p>',
    },
  });

  log('Scheduling automation via cron endpoint to process immediately requires CRON_SECRET (skipped in smoke). Checking logs instead.');
  const automationsList = await authFetch<{
    automations: Array<{ id: string; logs: Array<{ status: string }> }>;
  }>('/automations');
  const automationLogs = automationsList.data.automations.find(
    (a) => a.id === automationRes.data.automation.id,
  )?.logs;
  if (!automationLogs || !automationLogs.length) {
    log('Automation logs empty (cron may not have executed yet)', {});
  }

  log('Launching immediate campaign');
  const subject = 'Smoke Campaign';
  await authFetch('/campaigns', {
    body: {
      name: 'Smoke Test Campaign',
      subject,
      body: `Hello {{contact.name}}, welcome from ${FRONTEND_URL}`,
      contactIds: [contactId],
    },
  });

  log('Waiting for campaign email');
  const campaignEmail = await waitForEmail(contactMailbox, subject);
  if (!campaignEmail.mail_body?.includes('Smoke Test Campaign')) {
    throw new Error('Campaign email body did not match expectations');
  }

  log('Testing Stripe checkout endpoint (if configured)');
  try {
    await authFetch('/billing/checkout', {
      body: { successUrl: `${FRONTEND_URL}/settings`, cancelUrl: `${FRONTEND_URL}/settings` },
    });
  } catch (error) {
    log('Stripe test skipped', { reason: (error as Error).message });
  }

  log('Smoke test finished successfully', {
    account: accountMailbox.address,
    contact: contactMailbox.address,
  });

  const accountRecord = {
    email: accountMailbox.address,
    password,
    contactEmail: contactMailbox.address,
    contactName: CONTACT_NAME,
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(ACCOUNT_FILE, JSON.stringify(accountRecord, null, 2), 'utf8');
};

main().catch((error) => {
  console.error('[smoke] FAILED', error);
  process.exit(1);
});

