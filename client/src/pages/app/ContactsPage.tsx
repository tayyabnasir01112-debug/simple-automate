import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../lib/api';
import type { Contact } from '../../types';

const fetchContacts = async () => {
  const { data } = await api.get<{ contacts: Contact[] }>('/contacts');
  return data.contacts;
};

export const ContactsPage = () => {
  const queryClient = useQueryClient();
  const { data: contacts } = useQuery({ queryKey: ['contacts'], queryFn: fetchContacts });
  const [isSubmitting, setSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: { name: string; email?: string; tags: string[] }) => api.post('/contacts', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    await mutation.mutateAsync({
      name: data.get('name') as string,
      email: (data.get('email') as string) || undefined,
      tags: (data.get('tags') as string)?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [],
    });
    setSubmitting(false);
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">Add contact</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
          />
          <input
            name="tags"
            placeholder="Tags (comma separated)"
            className="rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 md:col-span-3"
          >
            {isSubmitting ? 'Saving...' : 'Save contact'}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">Contacts</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Tags</th>
                <th className="px-4 py-2">Stage</th>
              </tr>
            </thead>
            <tbody>
              {contacts?.map((contact) => (
                <tr key={contact.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-900">{contact.name}</td>
                  <td className="px-4 py-2">{contact.email ?? '—'}</td>
                  <td className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                    {contact.tags.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2 text-sm text-brand">
                    {contact.stages?.[0]?.stage?.name ?? 'New'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!contacts?.length && <p className="mt-4 text-sm text-slate-500">No contacts yet.</p>}
        </div>
      </div>
    </div>
  );
};

