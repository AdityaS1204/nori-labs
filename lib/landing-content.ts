/**
 * All landing-page copy, kept as data so the section components stay layout-only
 * and the wording can be reviewed (and tested) in one place.
 *
 * Source: the norirobotics.com production landing page, reframed into the six
 * sections of the wireframe.
 */

export type MediaSlot = {
  /** Shown inside the placeholder frame until a real asset is dropped in. */
  label: string;
  /** CSS aspect-ratio value, e.g. "16 / 9". */
  ratio: string;
  caption?: string;
};

export type SupportingDetail = { label: string; value: string };

export type Capability = {
  id: string;
  title: string;
  body: string;
  media: MediaSlot;
};

export type TeachingStep = { title: string; body: string };

export type Spec = { label: string; value: string };

export type FaqItem = { question: string; answer: string };

export const NAV_LINKS = [
  { href: "#context", label: "Everyday tasks" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#teaching", label: "Teaching" },
  { href: "#hardware", label: "Hardware" },
] as const;

export const HERO = {
  eyebrow: "// now shipping fall 2026",
  headline: "The most capable robot for $1,688",
  body:
    "NORI A3 is an affordable bimanual robot built for the home. Two 7+1 DOF arms, " +
    "onboard lidar and vision, and a laptop app that lets you teach it the tasks you " +
    "actually need.",
  primaryCta: { label: "Order now", href: "/preorder" },
  secondaryCta: { label: "Watch demo", href: "#context" },
  badges: ["YYC S26", "NVIDIA Omniverse"],
  availability: "Full price, no deposit. Ships Fall 2026.",
  media: { label: "Product image / full robot", ratio: "4 / 3" } satisfies MediaSlot,
} as const;

export const SUPPORTING_DETAILS: readonly SupportingDetail[] = [
  { label: "Price", value: "$1,688" },
  { label: "Arms", value: "Bimanual, 7+1 DOF" },
  { label: "Runtime", value: "6-8 hours" },
];

export const IN_CONTEXT = {
  label: "Product in context",
  headline: "Everyday tasks",
  body: "Nori can support you with day-to-day home tasks.",
  media: {
    label: "Full-width demo video / robot in a home",
    ratio: "16 / 7",
  } satisfies MediaSlot,
  videoCaption: {
    title: "A morning in a real kitchen",
    body:
      "Footage of NORI A3 clearing a counter, loading the dishwasher and fetching " +
      "from the fridge, running the same skills you can teach it at home.",
  },
  chapters: ["Kitchen", "Tidying", "Fridge"],
} as const;

export const CAPABILITIES: readonly Capability[] = [
  {
    id: "kitchen",
    title: "Helping in the kitchen",
    body:
      "Pours ingredients, moves cookware and clears the counter with both arms " +
      "working together.",
    media: {
      label: "Capability visual / kitchen",
      ratio: "4 / 3",
      caption: "Bimanual pour, 1.5kg payload per arm",
    },
  },
  {
    id: "tidying",
    title: "Tidying and folding clothes",
    body:
      "Picks up what is out of place, sorts it and folds laundry into a stack you " +
      "can put away.",
    media: {
      label: "Capability visual / tidying",
      ratio: "4 / 3",
      caption: "Fold cycle, learned by demonstration",
    },
  },
  {
    id: "fridge",
    title: "Fetching from the fridge",
    body:
      "Navigates on 12m lidar, opens the door and brings back what you asked for by " +
      "name.",
    media: {
      label: "Capability visual / fetching",
      ratio: "4 / 3",
      caption: "Lidar navigation, 8-12Hz scanning",
    },
  },
  {
    id: "dishes",
    title: "Loading dishes",
    body:
      "Clears plates and glasses into the dishwasher, placing each item instead of " +
      "dropping it in.",
    media: {
      label: "Capability visual / dishes",
      ratio: "4 / 3",
      caption: "Gripper cameras, 720p at 30fps",
    },
  },
];

export const TEACHING = {
  label: "Teaching flow",
  headline: "Teach Nori to support you in every way",
  body:
    "Train your Nori at home, share its skills anywhere. The Nori Lab laptop app " +
    "helps you train, operate and manage your robot.",
  cta: { label: "Explore teaching", href: "/lab" },
  media: { label: "Teaching demonstration / video", ratio: "4 / 3" } satisfies MediaSlot,
  steps: [
    {
      title: "Show it once",
      body:
        "Guide the arms through the task in Nori Lab. The app records the motion, the " +
        "camera feeds and the grip.",
    },
    {
      title: "Nori learns the skill",
      body:
        "A few demonstrations are enough. Nori generalises the motion to new " +
        "positions, objects and lighting in your home.",
    },
    {
      title: "Share it anywhere",
      body:
        "Publish the skill to the Skills Marketplace, or install one someone else " +
        "trained, straight onto your robot.",
    },
  ] satisfies TeachingStep[],
} as const;

export const HARDWARE = {
  label: "Hardware details",
  headline: "Affordable and capable",
  body:
    "Every NORI A3 is assembled in San Francisco. No subscription and no locked " +
    "features: the hardware you order is the hardware you own.",
  media: {
    label: "Hardware detail image",
    ratio: "4 / 5",
    caption: "Based in the USA. Assembled in San Francisco.",
  } satisfies MediaSlot,
  specs: [
    { label: "Arms", value: "7+1 DOF, 1.5kg payload per-arm." },
    {
      label: "Lidar",
      value: "12m range, 8-12Hz scanning frequency. Angular resolution 0.72 degrees at 10Hz.",
    },
    {
      label: "Cameras",
      value: "x4 720p RGB cameras, up to 30 fps, mounted on the grippers, head, and neck.",
    },
    { label: "Audio", value: "Speaker and microphone for spoken commands." },
    { label: "Battery", value: "6-8 hours battery life." },
    {
      label: "App",
      value: "The Nori Lab laptop app helps you train, operate, and manage your robot.",
    },
  ] satisfies Spec[],
} as const;

export const FAQ: readonly FaqItem[] = [
  {
    question: "What does $1,688 actually include?",
    answer:
      "The full NORI A3 robot: both 7+1 DOF arms, lidar, the four 720p cameras, " +
      "audio, the battery and the Nori Lab laptop app. It is the full price rather " +
      "than a deposit, and there is no subscription to use the robot you own.",
  },
  {
    question: "When does it ship?",
    answer:
      "NORI A3 ships Fall 2026. Orders are filled in the sequence they are placed, " +
      "and you pay the full price at order rather than a deposit now and a balance " +
      "later.",
  },
  {
    question: "Do I need a robotics background to teach it?",
    answer:
      "No. Teaching happens by demonstration in the Nori Lab app: you guide the arms " +
      "through a task a few times and Nori generalises it. There is no code to write " +
      "and no model to configure.",
  },
  {
    question: "What is the Skills Marketplace?",
    answer:
      "A shared library of skills trained on real robots. Publish what you teach your " +
      "Nori, or install a skill someone else trained and your robot picks it up " +
      "without retraining from scratch.",
  },
  {
    question: "Where is it built?",
    answer:
      "In San Francisco. Every unit is assembled in the workshop there before it ships.",
  },
];

export const CLOSING = {
  label: "Next step",
  price: "$1,688",
  headline: "Full price, no deposit",
  body: "Reserve a NORI A3 at the launch price. Ships Fall 2026, assembled in San Francisco.",
  cta: { label: "Order now", href: "/preorder" },
} as const;

export const FOOTER_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/lab", label: "Nori Lab" },
  { href: "#hardware", label: "Specs" },
  { href: "#faq", label: "FAQ" },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://x.com/NoriRobotics", label: "X" },
  { href: "https://discord.gg/NgKhhxQny7", label: "Discord" },
  { href: "https://www.linkedin.com/company/norirobotics", label: "LinkedIn" },
  { href: "https://github.com/Nori-Robotics", label: "GitHub" },
] as const;
