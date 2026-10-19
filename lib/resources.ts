/**
 * Places that can actually help, which Mirian deliberately isn't.
 *
 * Mirian is a record, not an advice service. Everything on this list is free
 * at the point of use in the UK, and none of it is a paid debt management
 * company — those charge for something the charities do for nothing.
 *
 * Written routes first throughout. Phoning is the hardest thing on the list
 * for a lot of the people using this app, and a page that opens with a phone
 * number reads as closed to them. Numbers appear only where no written option
 * exists, and they're marked as such.
 */

export type Resource = {
  name: string;
  url: string;
  what: string;
  /** How you reach them, written routes first. */
  how: string;
};

export type ResourceGroup = {
  id: string;
  title: string;
  blurb: string;
  items: Resource[];
};

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "debt-advice",
    title: "Free debt advice",
    blurb:
      "Charities and services that will look at your whole situation and tell you your options. They are free, they are confidential, and they do not judge. If you only use one thing on this page, use one of these.",
    items: [
      {
        name: "StepChange",
        url: "https://www.stepchange.org",
        what: "The UK's biggest debt charity. Full advice, and they can set up and run a debt management plan for you at no cost.",
        how: "Online debt advice tool, no phone call needed",
      },
      {
        name: "National Debtline",
        url: "https://nationaldebtline.org",
        what: "Free, independent advice, with very clear fact sheets and sample letters if you would rather handle it yourself.",
        how: "Webchat and a digital advice tool",
      },
      {
        name: "Citizens Advice",
        url: "https://www.citizensadvice.org.uk/debt-and-money/",
        what: "Advice on debt alongside everything else: benefits, housing, work, bills. Good when the debt is tangled up in something else.",
        how: "Online guides, webchat, and local offices",
      },
      {
        name: "Christians Against Poverty",
        url: "https://capuk.org",
        what: "Free debt help including home visits, which can help if paperwork and phone calls are the barrier. They help anyone, whatever you believe.",
        how: "Online referral form",
      },
      {
        name: "Business Debtline",
        url: "https://www.businessdebtline.org",
        what: "The same free advice, for people who are self-employed or run a small business.",
        how: "Webchat and online tools",
      },
    ],
  },
  {
    id: "money",
    title: "Working out what you are owed",
    blurb:
      "Debt is often a sign that money is coming in short rather than going out fast. These are worth an hour before anything else.",
    items: [
      {
        name: "Turn2us",
        url: "https://www.turn2us.org.uk",
        what: "Checks what benefits and grants you can claim. People regularly find hundreds a month they were entitled to and never knew about.",
        how: "Online calculator",
      },
      {
        name: "MoneyHelper",
        url: "https://www.moneyhelper.org.uk",
        what: "Government-backed, impartial guidance on debt, benefits, pensions and budgeting.",
        how: "Online guides and webchat",
      },
      {
        name: "MoneySavingExpert",
        url: "https://www.moneysavingexpert.com/debt-help/",
        what: "Martin Lewis's site. Not advice in the regulated sense, but the best plain-English explanations of how any of this works.",
        how: "Articles and forums",
      },
    ],
  },
  {
    id: "specific",
    title: "When it is about something specific",
    blurb: "",
    items: [
      {
        name: "Shelter",
        url: "https://england.shelter.org.uk/housing_advice",
        what: "Rent arrears, mortgage trouble, eviction. Get in touch early; they can do far more before a court date than after one.",
        how: "Online advice and webchat",
      },
      {
        name: "Mental Health & Money Advice",
        url: "https://www.mentalhealthandmoneyadvice.org",
        what: "Built for where money trouble and mental health meet, including what to do if you cannot face dealing with it.",
        how: "Online guides",
      },
      {
        name: "Breathing Space",
        url: "https://www.gov.uk/options-for-paying-off-your-debts/breathing-space",
        what: "A government scheme that freezes interest, fees and enforcement for 60 days while you get advice. You apply through a debt adviser, not directly.",
        how: "Through any of the advice charities above",
      },
    ],
  },
];

/**
 * If things are bad. Kept separate and last, and the only place on the site
 * that leads with a phone number, because here it matters more than comfort.
 * Written routes are listed alongside, since for plenty of people a phone call
 * is the thing they cannot do.
 */
export const CRISIS = [
  {
    name: "Samaritans",
    url: "https://www.samaritans.org",
    what: "Any time, day or night, about anything. You do not have to be suicidal to call them.",
    how: "Call 116 123 free, or email jo@samaritans.org if talking is too much",
  },
  {
    name: "Shout",
    url: "https://giveusashout.org",
    what: "Free, confidential support by text message, 24 hours a day.",
    how: "Text SHOUT to 85258",
  },
];
