/**
 * All landing-page copy, kept as data so the section components stay layout-only
 * and the wording can be reviewed (and tested) in one place.
 *
 * Source: the norirobotics.com production landing page, reframed into the
 * sections of the A3 design study.
 */

/** Background treatment for a media card, matching the design's colour blocks. */
export type MediaTone = "sage" | "ink" | "haze";

export type MediaSlot = {
  /** Mono slot marker printed in the card's top-left corner. */
  slot: string;
  /** Mono note printed in the card's bottom-right corner. */
  note?: string;
  tone: MediaTone;
  /** CSS aspect-ratio value, e.g. "16 / 9". */
  ratio: string;
  /** Real footage. When set, the card plays it instead of drawing a placeholder. */
  src?: string;
  /** Renders a play affordance for slots still waiting on footage. */
  video?: boolean;
  /** Large headline set over the card, bottom-left. */
  overlay?: string;
};

/**
 * A headline line, in order. Text parts carry no implicit spacing: the inline
 * mark supplies its own side margins, so words sit flush against it.
 */
export type HeadlinePart = string | { mark: true };

export type SupportingDetail = { label: string; value: string };

export type HardwareCard = { title: string; caption: string; media: MediaSlot };

export type TeachingStep = { title: string; body: string };

export type Spec = { label: string; value: string };

export type NavChild = { href: string; label: string; note: string };

export type NavItem = { href: string; label: string; items: readonly NavChild[] };

export const NAV_LINKS: readonly NavItem[] = [
  {
    href: "#what-it-is",
    label: "Nori A3",
    items: [
      { href: "#what-it-is", label: "What it is", note: "A bimanual robot you teach by showing." },
      { href: "#the-face", label: "The face", note: "A screen that looks back at you." },
      { href: "#order", label: "Price and shipping", note: "$1,688, no deposit. Fall 2026." },
    ],
  },
  {
    href: "#the-face",
    label: "In the home",
    items: [
      { href: "#what-it-is", label: "Everyday tasks", note: "Kitchen, tidying, laundry, dishes." },
      { href: "#teach-it", label: "Teach it a skill", note: "Demonstrate once, it generalises." },
      { href: "/library", label: "Expression library", note: "Faces the community has made." },
    ],
  },
  {
    href: "#hardware",
    label: "Hardware",
    items: [
      { href: "#hardware", label: "What is on the body", note: "Arms, lidar, cameras, battery." },
      { href: "/lab", label: "Nori Lab", note: "Train, operate and manage your robot." },
      { href: "#order", label: "Order an A3", note: "Assembled in San Francisco." },
    ],
  },
];

export const NAV_CTA = { label: "Order Now", href: "/preorder" } as const;

export const HERO = {
  label: "Nori A3 / home robot",
  headline: [
    ["Meet", { mark: true }, "A3."],
    ["It looks back."],
  ] satisfies readonly (readonly HeadlinePart[])[],
  // Delivered at display size: the source png is 1.6MB, this is a few KB.
  mark: {
    src: "https://res.cloudinary.com/dp5tdrmf8/image/upload/w_240,q_auto,f_webp/v1795065970/Glossy_Neon_Green_Clover_Icon_f6uca6.png",
  },
  body: "A home robot with an animated face. Shipping fall 2026, at $1,688.",
  primaryCta: { label: "Learn more", href: "#what-it-is" },
  secondaryCta: { label: "Watch it at home", href: "#what-it-is" },
  media: {
    slot: "Nori A3 — face and torso",
    note: "Eyes open, tracking the room.",
    tone: "sage",
    ratio: "16 / 9",
    src: "https://res.cloudinary.com/dp5tdrmf8/video/upload/v1794986979/nori-main_cxujza.mp4",
  } satisfies MediaSlot,
} as const;

export const SUPPORTING_DETAILS: readonly SupportingDetail[] = [
  { label: "Price", value: "$1,688" },
  { label: "Arms", value: "Bimanual, 7+1 DOF" },
  { label: "Runtime", value: "6-8 hours" },
];

export const WHAT_IT_IS = {
  label: "01 / what it is",
  headline: "Nori A3 is a bimanual home robot that you teach by showing it, not by programming it.",
  hero: {
    slot: "In the kitchen",
    note: "Cooking, unbroken take.",
    tone: "haze",
    ratio: "16 / 9",
    src: "https://res.cloudinary.com/dp5tdrmf8/video/upload/v1794986981/Kitchen-2_t9xejc.mp4",
    overlay: "Helping in the kitchen.",
  } satisfies MediaSlot,
  pair: [
    {
      slot: "Loading dishes",
      note: "Two cuts, three seconds.",
      tone: "sage",
      ratio: "16 / 10",
      src: "https://res.cloudinary.com/dp5tdrmf8/video/upload/v1794986979/kitchen-1_egkrs0.mp4",
    },
    {
      slot: "Video slot 04 — close-up of the hand",
      note: "Slow, macro, soft light.",
      tone: "ink",
      ratio: "16 / 10",
      video: true,
    },
  ] satisfies MediaSlot[],
} as const;

export const THE_FACE = {
  label: "02 / the face",
  headline: "Its face is a screen.",
  body:
    "A3's head screen shows animated eyes. The four expressions below are drawn by " +
    "the same renderer that runs on the robot, straight from the expression " +
    "playground.",
  cta: { label: "Open the playground", href: "/lab" },
} as const;

export const HARDWARE = {
  label: "03 / hardware",
  headline: "What is on the body.",
  cards: [
    {
      title: "Head and face",
      caption: "Screen face, plus the head and neck cameras.",
      media: { slot: "Image slot 05", tone: "sage", ratio: "3 / 4" },
    },
    {
      title: "Arm",
      caption: "7+1 DOF, 1.5kg payload per arm.",
      media: { slot: "Image slot 06", tone: "haze", ratio: "4 / 3" },
    },
    {
      title: "Base",
      caption: "12m lidar, 8-12Hz scanning.",
      media: { slot: "Image slot 07", tone: "ink", ratio: "4 / 3" },
    },
    {
      title: "Workshop",
      caption: "Assembled in San Francisco.",
      media: { slot: "Image slot 08", tone: "sage", ratio: "16 / 7" },
    },
  ] satisfies HardwareCard[],
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

export const TEACH_IT = {
  label: "04 / teach it",
  headline: "Teach it a skill.",
  body:
    "Train your Nori at home, share its skills anywhere. The Nori Lab laptop app " +
    "records demonstrations and trains skills, then publishes them to the Skills " +
    "Marketplace.",
  cta: { label: "Learn more", href: "/lab" },
  media: {
    slot: "Video slot 09 — screen recording, Nori Lab",
    note: "Screen recording of the Nori Lab app.",
    tone: "sage",
    ratio: "16 / 10",
    video: true,
  } satisfies MediaSlot,
  steps: [
    {
      title: "Show it once",
      body: "Guide the arms through the task. The app records motion, camera feeds and grip.",
    },
    {
      title: "Nori learns the skill",
      body: "A few demonstrations are enough to generalise to new positions and lighting.",
    },
    {
      title: "Share it anywhere",
      body: "Publish to the Skills Marketplace, or install a skill someone else trained.",
    },
  ] satisfies TeachingStep[],
} as const;

export const CLOSING = {
  label: "05 / order",
  headline: ["Full price,", "no deposit."],
  price: "$1,688",
  body: "Reserve a NORI A3 at the launch price. Ships Fall 2026, assembled in San Francisco.",
  cta: { label: "Learn more", href: "/preorder" },
  media: {
    slot: "Image slot 10 — full robot, three-quarter",
    tone: "sage",
    ratio: "3 / 4",
  } satisfies MediaSlot,
} as const;

export const FOOTER = {
  note: "Design study for the A3 page. All copy is draft; footage slots are marked.",
  links: [
    { href: "/library", label: "Library" },
    { href: "/lab", label: "Nori Lab" },
    { href: "#hardware", label: "Specs" },
  ],
  socials: [
    { href: "https://x.com/NoriRobotics", label: "X" },
    { href: "https://discord.gg/NgKhhxQny7", label: "Discord" },
    { href: "https://www.linkedin.com/company/norirobotics", label: "LinkedIn" },
    { href: "https://github.com/Nori-Robotics", label: "GitHub" },
  ],
} as const;
