import Link from "next/link";
import Seo from "@/components/Seo";
import { LEGAL } from "@/lib/legal";

/* One section of the notice */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="py-6 border-t border-mint-200 first:border-t-0 first:pt-0"
    >
      <h2 id={id} className="text-lg font-semibold text-sage-800 mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-sage-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/* A bulleted list with consistent spacing */
function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1.5">{children}</ul>;
}

/**
 * Privacy notice. Public: linked from sign up, sign in and Your data.
 *
 * Written in plain language on purpose. UK GDPR requires a notice to be
 * "concise, transparent, intelligible", and the people using this app are the
 * last people who should be handed legalese.
 *
 * Who runs the service, where data is stored and the ICO number come from
 * lib/legal.ts. Have this notice checked before launch.
 */
export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy notice"
        description="What Mirian holds, why, where it's kept, and how to get a copy or have it all deleted. Your debts are yours — nothing is shared with creditors or credit reference agencies."
        path="/privacy"
      />

      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center min-h-[44px] text-sm font-medium text-sage-500 hover:text-sage-700 mb-4"
          >
            ← Back to {LEGAL.service}
          </Link>

          {/* Title */}
          <div className="mb-6">
            <h1 className="font-display text-[1.75rem] md:text-4xl leading-tight font-extrabold text-sage-800 mb-2">
              Privacy notice
            </h1>
            <p className="text-sage-500 text-sm">
              Last updated {LEGAL.lastUpdated}
            </p>
          </div>

          {/* The short version */}
          <div className="bg-white border border-mint-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-sage-800 mb-3">
              The short version
            </h2>
            <ul className="space-y-2 text-sm text-sage-700 leading-relaxed list-disc pl-5">
              <li>We only collect what {LEGAL.service} needs to work.</li>
              <li>
                We don&rsquo;t sell your data, show you adverts, or track you
                around the internet.
              </li>
              <li>
                We never share anything with the companies you owe money to.
              </li>
              <li>
                Your data is yours. You can{" "}
                <Link href="/settings/data" className="font-semibold text-brand underline">
                  download it or delete it
                </Link>{" "}
                at any time.
              </li>
            </ul>
          </div>

          <div className="bg-white border border-mint-200 rounded-2xl p-5 md:p-6 shadow-sm">
            <Section id="who" title="Who we are">
              <p>
                {LEGAL.service} is provided by {LEGAL.controller}. As a sole
                trader, Hannah is personally responsible for looking after your
                data, which makes her the &ldquo;data controller&rdquo; under UK
                data protection law.
              </p>
              {LEGAL.icoRegistration && (
                <p>
                  We&rsquo;re registered with the Information Commissioner&rsquo;s
                  Office (ICO), registration number {LEGAL.icoRegistration}.
                </p>
              )}
              <p>
                If you have any questions about your data, email{" "}
                <a
                  href={`mailto:${LEGAL.contactEmail}`}
                  className="font-semibold text-brand underline"
                >
                  {LEGAL.contactEmail}
                </a>
                .
              </p>
            </Section>

            <Section id="what" title="What we collect">
              <p>Only what you give us, and what&rsquo;s needed to keep you signed in:</p>
              <List>
                <li>
                  <strong>Your account:</strong> your email address and password.
                  Your password is stored scrambled, so nobody can read it,
                  including us.
                </li>
                <li>
                  <strong>Your details:</strong> your name and the name you&rsquo;d
                  like us to use, if you add them, and your monthly budget if you
                  set one.
                </li>
                <li>
                  <strong>Your debts:</strong> company names, amounts, monthly
                  payments, due dates, any interest rate you enter, and any
                  account numbers or company email addresses you add.
                </li>
                <li>
                  <strong>Your payments:</strong> amounts and dates, whether a
                  payment was late or short, how much of each payment went on
                  interest, and any reason you choose to give.
                </li>
                <li>
                  <strong>Your contact history:</strong> messages you tell us
                  you&rsquo;ve sent to companies, and when.
                </li>
                <li>
                  <strong>Messages you send us:</strong> if you use the contact
                  or feedback form, whatever you write, plus your name and email
                  if you give them. These are emailed to us and not stored in
                  {LEGAL.service}. We also briefly check the address your device
                  is connecting from, to stop the form being flooded with spam.
                </li>
                <li>
                  <strong>Technical information:</strong> a cookie that keeps you
                  signed in, and short-lived logs kept by our hosting provider
                  (such as your IP address and when a page was requested) to keep
                  the service secure and working.
                </li>
              </List>
            </Section>

            <Section id="sensitive" title="Things you might tell us about yourself">
              <p>
                When a payment is late or short, you can write down why. You
                never have to. If what you write mentions something personal,
                like your health, we only use it to show it back to you.
              </p>
            </Section>

            <Section id="why" title="Why we use your data">
              <List>
                <li>
                  <strong>To run your account and the app,</strong> because you
                  asked us to. This is necessary to provide the service you signed
                  up for.
                </li>
                <li>
                  <strong>To send account emails,</strong> like confirming your
                  email address or resetting your password.
                </li>
                <li>
                  <strong>To answer you</strong> when you send a message through
                  the website.
                </li>
                <li>
                  <strong>To keep {LEGAL.service} secure</strong> and fix problems.
                  We have a legitimate interest in doing this.
                </li>
              </List>
              <p>
                We don&rsquo;t use your data for marketing or advertising, and we
                don&rsquo;t make automated decisions about you.
              </p>
            </Section>

            <Section id="who-else" title="Who else handles your data">
              <p>
                We use a small number of trusted companies to run {LEGAL.service}.
                They can only use your data to provide their service to us, and
                must keep it secure.
              </p>
              <List>
                <li>
                  <strong>Supabase</strong> stores your data and handles signing in.
                </li>
                <li>
                  <strong>Vercel</strong> hosts the app.
                </li>
                <li>
                  <strong>Resend</strong> sends account emails and delivers messages from the contact and feedback forms.
                </li>
              </List>
              {LEGAL.databaseRegion && (
                <p>
                  Your data is stored in {LEGAL.databaseRegion}. UK law recognises
                  countries in the European Economic Area as protecting personal
                  data to the same standard as the UK.
                </p>
              )}
              <p>
                Some of these companies are based in the United States, so your
                data may be handled outside the UK. When that happens, it&rsquo;s
                protected by safeguards approved under UK data protection law.
              </p>
              <p>
                <strong>Messages to companies are sent by you, not us.</strong> When
                you email a company from {LEGAL.service}, it opens your own email
                app. Links to companies&rsquo; help pages are just links: we
                don&rsquo;t tell those companies anything about you.
              </p>
            </Section>

            <Section id="how-long" title="How long we keep it">
              <p>
                We keep your data for as long as you have an account. When you
                delete your account, we delete your data from our database
                straight away.
              </p>
              <p>
                Copies may stay in our providers&rsquo; backups for a short time
                before they&rsquo;re automatically removed. We don&rsquo;t restore
                them except to recover from a serious technical problem.
              </p>
            </Section>

            <Section id="rights" title="Your rights">
              <p>You have the right to:</p>
              <List>
                <li>
                  <strong>Get a copy of your data.</strong> Download it from{" "}
                  <Link href="/settings/data" className="font-semibold text-brand underline">
                    Your data
                  </Link>
                  . You can get it as a PDF to read or print, or as a data file that other apps and services can read.
                </li>
                <li>
                  <strong>Correct it.</strong> You can edit your details, debts and
                  payments in the app.
                </li>
                <li>
                  <strong>Delete it.</strong> Delete your account and everything in
                  it from{" "}
                  <Link href="/settings/data" className="font-semibold text-brand underline">
                    Your data
                  </Link>
                  .
                </li>
                <li>
                  <strong>Object to, or ask us to limit,</strong> how we use your
                  data.
                </li>
              </List>
              <p>
                For anything you can&rsquo;t do in the app, email{" "}
                <a
                  href={`mailto:${LEGAL.contactEmail}`}
                  className="font-semibold text-brand underline"
                >
                  {LEGAL.contactEmail}
                </a>
                . It&rsquo;s free, and we&rsquo;ll reply within one month.
              </p>
            </Section>

            <Section id="cookies" title="Cookies">
              <p>
                We only use what&rsquo;s needed for {LEGAL.service} to work, so
                there&rsquo;s no cookie banner:
              </p>
              <List>
                <li>A cookie that keeps you signed in.</li>
                <li>A security cookie that protects the sign-in form.</li>
                <li>
                  Your light or dark mode choice, saved on your own device.
                </li>
              </List>
              <p>No advertising, analytics or tracking cookies.</p>
            </Section>

            <Section id="security" title="Keeping your data safe">
              <p>
                Everything is sent over an encrypted connection. Our database is
                locked down so each person can only reach their own data, and
                passwords are never stored in a readable form.
              </p>
              <p>
                No system is perfectly secure. If something ever happens that
                puts your data at risk, we&rsquo;ll tell you, and the ICO where the
                law requires it.
              </p>
            </Section>

            <Section id="age" title="Age">
              <p>{LEGAL.service} is for people aged 18 and over.</p>
            </Section>

            <Section id="complaints" title="If you&rsquo;re not happy">
              <p>
                Please tell us first at{" "}
                <a
                  href={`mailto:${LEGAL.contactEmail}`}
                  className="font-semibold text-brand underline"
                >
                  {LEGAL.contactEmail}
                </a>
                , and we&rsquo;ll do our best to put it right.
              </p>
              <p>
                You also have the right to complain to the{" "}
                <a
                  href="https://ico.org.uk/make-a-complaint/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline"
                >
                  Information Commissioner&rsquo;s Office
                </a>
                , the UK&rsquo;s data protection regulator.
              </p>
            </Section>

            <Section id="changes" title="Changes to this notice">
              <p>
                If we change how we use your data, we&rsquo;ll update this page
                and the date at the top. If it&rsquo;s a big change, we&rsquo;ll
                let you know in the app or by email first.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
