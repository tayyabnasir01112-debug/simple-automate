import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Contact, EmailCampaign } from '../../types';

const fetchCampaigns = async () => {
  const { data } = await api.get<{ campaigns: EmailCampaign[] }>('/campaigns');
  return data.campaigns;
};

const fetchContacts = async () => {
  const { data } = await api.get<{ contacts: Contact[] }>('/contacts');
  return data.contacts;
};

export const CampaignsPage = () => {
  const queryClient = useQueryClient();
  const { data: campaigns } = useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns });
  const { data: contacts } = useQuery({ queryKey: ['contacts'], queryFn: fetchContacts });
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);

  const campaignMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/campaigns', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setSelectedContacts([]);
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await campaignMutation.mutateAsync({
      name: form.get('name'),
      subject: form.get('subject'),
      body: form.get('body'),
      contactIds: selectedContacts,
      scheduledFor: isScheduled ? form.get('scheduledFor') : undefined,
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card space-y-4"
      >
        <h2 className="text-xl font-semibold text-slate-900">Create campaign</h2>
        <input
          name="name"
          placeholder="Campaign name"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
        />
        <input
          name="subject"
          placeholder="Subject line"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
        />
        <textarea
          name="body"
          rows={4}
          placeholder="Write your message"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
        />
        <div>
          <p className="text-sm font-semibold text-slate-700">Recipients</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {contacts?.map((contact) => (
              <label key={contact.id} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={(event) =>
                    setSelectedContacts((prev) =>
                      event.target.checked ? [...prev, contact.id] : prev.filter((id) => id !== contact.id),
                    )
                  }
                />
                {contact.name}
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={(event) => setIsScheduled(event.target.checked)}
          />
          Schedule for later
        </label>
        {isScheduled && (
          <input
            type="datetime-local"
            name="scheduledFor"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
          />
        )}
        <button
          type="submit"
          disabled={!selectedContacts.length}
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          Launch campaign
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        {campaigns?.map((campaign) => (
          <div key={campaign.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                <p className="text-xs uppercase tracking-widest text-slate-500">{campaign.status}</p>
              </div>
              <p className="text-xs text-slate-500">
                {campaign.scheduledFor ? new Date(campaign.scheduledFor).toLocaleString() : 'Sending now'}
              </p>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Recipients: {campaign.recipients.length} · Sent:{' '}
              {campaign.recipients.filter((recipient) => recipient.status === 'SENT').length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

