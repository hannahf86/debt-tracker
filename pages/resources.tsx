"use client";

import { ExternalLink, LifeBuoy } from "lucide-react";
import Seo from "@/components/Seo";
import { CRISIS, RESOURCE_GROUPS } from "@/lib/resources";

/**
 * Where to get the help Mirian deliberately doesn't give.
 *
 * Mirian is a record, not an advice service, and the honest thing is to say so
 * somewhere people can find it rather than only in the small print. Everything
 * here is free in the UK, and nothing here is a paid debt management company.
 *
 * Written routes first throughout. For a lot of the people using this app the
 * phone is the hardest thing on the page, and a list that opens with a phone
 * number reads as closed to them.
 */

function Card({
  name,
  url,
  what,
  how,
}: {
  name: string;
  url: string;
  what: string;
  how: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-mint-200 rounded-2xl p-5 shadow-sm hover:border-sage-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-sage-800">{name}</h3>
        <ExternalLink
          size={16}
          className="shrink-0 mt-1 text-sage-500"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm text-sage-600 mt-1.5">{what}</p>
      <p className="text-xs text-sage-500 mt-2.5">{how}</p>
    </a>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <Seo
        title="Help and resources"
        description="Free, confidential debt advice in the UK, and the places worth knowing about."
        noindex
      />

      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-[1.75rem] md:text-4xl leading-tight font-extrabold text-sage-800 mb-2">
              Help and resources
            </h1>
            <p className="text-sage-600 text-sm">
              Mirian keeps your record. It doesn&rsquo;t give advice, and
              it&rsquo;s not meant to. These people do, they do it for free, and
              they are very good at it.
            </p>
          </div>

          {/* The one thing worth saying before any list. */}
          <div className="bg-mint-50 border border-mint-200 rounded-2xl p-5 mb-8">
            <p className="text-sage-700 text-sm">
              Nothing on this page costs money. If somebody asks you to pay a
              fee to sort out your debts, you can get the same thing free from
              the charities below, and usually done better.
            </p>
          </div>

          {RESOURCE_GROUPS.map((group) => (
            <section key={group.id} className="mb-10" aria-labelledby={group.id}>
              <h2
                id={group.id}
                className="font-display text-xl font-bold text-sage-800 mb-1"
              >
                {group.title}
              </h2>
              {group.blurb && (
                <p className="text-sm text-sage-600 mb-4">{group.blurb}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {group.items.map((item) => (
                  <Card key={item.name} {...item} />
                ))}
              </div>
            </section>
          ))}

          {/* Last, and marked, because somebody scanning in a bad moment
              should be able to find it without reading the rest. */}
          <section aria-labelledby="crisis" className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <LifeBuoy size={18} className="text-sage-600" aria-hidden="true" />
              <h2
                id="crisis"
                className="font-display text-xl font-bold text-sage-800"
              >
                If things feel really bad
              </h2>
            </div>
            <p className="text-sm text-sage-600 mb-4">
              Money worry and feeling hopeless go together more often than
              anybody says out loud. If you are struggling, these are there
              right now, and you do not have to be in crisis to use them.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CRISIS.map((item) => (
                <Card key={item.name} {...item} />
              ))}
            </div>
          </section>

          <p className="text-xs text-sage-500">
            These are other people&rsquo;s services, not ours. We have no
            arrangement with any of them and we are not paid to list them.
          </p>
        </div>
      </div>
    </>
  );
}
