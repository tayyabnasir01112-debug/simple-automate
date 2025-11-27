import {
  EmailCampaignStatus,
  EmailRecipientStatus,
  type EmailCampaign,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { sendSystemEmail, renderEmailLayout } from '../lib/email';

const sendCampaignEmail = async (
  campaign: EmailCampaign,
  recipientId: string,
  contactId: string,
) => {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact?.email) {
    await prisma.emailCampaignRecipient.update({
      where: { id: recipientId },
      data: { status: EmailRecipientStatus.BOUNCED },
    });
    return;
  }

  await sendSystemEmail({
    to: contact.email,
    subject: campaign.subject,
    html: renderEmailLayout(campaign.name, campaign.body),
  });

  await prisma.emailCampaignRecipient.update({
    where: { id: recipientId },
    data: {
      status: EmailRecipientStatus.SENT,
      sentAt: new Date(),
    },
  });
};

export const dispatchCampaignNow = async (campaignId: string) => {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: { recipients: true },
  });
  if (!campaign) return;

  for (const recipient of campaign.recipients) {
    await sendCampaignEmail(campaign, recipient.id, recipient.contactId);
  }

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: { status: EmailCampaignStatus.SENT },
  });
};

export const processScheduledCampaigns = async () => {
  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      status: EmailCampaignStatus.SCHEDULED,
      scheduledFor: { lte: new Date() },
    },
    include: { recipients: true },
  });

  for (const campaign of campaigns) {
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: EmailCampaignStatus.SENDING },
    });
    await dispatchCampaignNow(campaign.id);
  }
};

