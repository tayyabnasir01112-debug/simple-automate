import { useState } from 'react';
import type { FormEvent } from 'react';
import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';
import { api } from '../../lib/api';

export const ContactPage = () => {
  const seo = seoContent['/contact'];
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus('sending');
    try {
      await api.post('/support/contact', {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
      });
      setStatus('success');
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/contact" />
      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{seo.hero.heading}</h1>
          <p className="mt-4 text-lg text-slate-600">{seo.hero.subheading}</p>
          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <p>Email: hello@simpleautomate.co.uk</p>
            <p>Response time: within 24 hours on weekdays.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              name="name"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              name="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Message
            <textarea
              name="message"
              rows={4}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-6 w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </button>
          {status === 'success' && (
            <p className="mt-3 text-sm text-brand">Thanks! We will reply shortly.</p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm text-red-500">Something went wrong. Please try again.</p>
          )}
        </form>
      </section>
    </>
  );
};

