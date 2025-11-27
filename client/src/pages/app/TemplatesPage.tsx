import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { EmailTemplate } from '../../types';

const fetchTemplates = async () => {
  const { data } = await api.get<{ templates: EmailTemplate[] }>('/templates');
  return data.templates;
};

export const TemplatesPage = () => {
  const queryClient = useQueryClient();
  const { data: templates } = useQuery({ queryKey: ['templates'], queryFn: fetchTemplates });
  const [isSaving, setSaving] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/templates', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    await mutation.mutateAsync({
      name: form.get('name'),
      subject: form.get('subject'),
      body: form.get('body'),
    });
    setSaving(false);
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card space-y-4"
      >
        <h2 className="text-xl font-semibold text-slate-900">Save template</h2>
        <input
          name="name"
          placeholder="Template name"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
        />
        <input
          name="subject"
          placeholder="Subject"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
        />
        <textarea
          name="body"
          rows={4}
          placeholder="Body"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save template'}
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        {templates?.map((template) => (
          <div key={template.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
            <p className="text-sm text-slate-500">Subject: {template.subject}</p>
            <p className="mt-3 text-sm text-slate-600">{template.body}</p>
          </div>
        ))}
        {!templates?.length && <p className="text-sm text-slate-500">No templates saved yet.</p>}
      </div>
    </div>
  );
};

