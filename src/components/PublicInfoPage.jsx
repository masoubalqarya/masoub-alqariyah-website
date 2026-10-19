"use client";

import { Mail } from "lucide-react";

export const SUPPORT_EMAIL = "info@masoubalqariyah.com";

export default function PublicInfoPage({
  title,
  intro,
  updated,
  sections,
  contact,
}) {
  const mailto = contact?.subject
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(contact.subject)}`
    : `mailto:${SUPPORT_EMAIL}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <header className="rise clay-panel relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {updated}
        </p>
        <h1 className="display mt-3 text-4xl font-black text-primary-dark sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {intro}
        </p>
      </header>

      <div className="mt-8 space-y-5">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <h2 className="display text-2xl font-black text-primary-dark">
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-base leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
            {section.items?.length ? (
              <ul className="mt-4 list-disc space-y-3 ps-6 text-base leading-relaxed text-muted-foreground marker:text-accent">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {contact ? (
        <aside className="mt-8 rounded-3xl bg-primary-dark p-6 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div>
            <h2 className="display text-2xl font-black">{contact.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
              {contact.body}
            </p>
          </div>
          <a
            href={mailto}
            className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-bold text-primary-dark transition hover:bg-secondary sm:mt-0"
          >
            <Mail size={18} />
            {contact.action}
          </a>
        </aside>
      ) : null}
    </div>
  );
}
