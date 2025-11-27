import { useEffect, useState } from 'react';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      'Within a week every deal was in one board, emails were automated, and reporting finally matched what leadership asked for.',
    author: 'Isla Gray',
    role: 'Founder, Contour Studio',
  },
  {
    quote:
      'SimpleAutomate feels like a lightweight HubSpot: contacts, automations, and campaigns in one login my team actually uses.',
    author: 'Maya Patel',
    role: 'Growth Lead, FieldNorth',
  },
  {
    quote:
      'We send 3+ newsletters a month straight from the CRM list. Notes, tasks, and campaigns stay synced without extra tools.',
    author: 'Leo Duncan',
    role: 'Agency Partner, Brightline',
  },
];

export const TestimonialCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % testimonials.length), 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-brand/5 py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Teams we power</p>
        <div className="relative mt-10 min-h-[220px] overflow-hidden rounded-3xl border border-brand/10 bg-white px-6 py-10 shadow-card">
          {testimonials.map((testimonial, idx) => (
            <article
              key={testimonial.author}
              className={`absolute inset-0 flex flex-col items-center justify-center px-4 text-slate-800 transition duration-700 ${
                idx === index ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-6'
              }`}
            >
              <blockquote className="text-2xl font-semibold leading-snug">{`“${testimonial.quote}”`}</blockquote>
              <p className="mt-4 text-sm font-semibold text-slate-600">
                {testimonial.author} · {testimonial.role}
              </p>
            </article>
          ))}
          <div className="relative mt-40 flex justify-center gap-2 md:mt-44">
            {testimonials.map((_, dotIdx) => (
              <span
                key={`dot-${dotIdx}`}
                className={`h-2.5 w-2.5 rounded-full ${dotIdx === index ? 'bg-brand' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

