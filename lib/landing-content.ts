/**
 * All landing-page copy, kept as data so the section components stay layout-only
 * and the wording can be reviewed (and tested) in one place.
 *
 * Source: the norirobotics.com production landing page, reframed into the
 * sections of the A3 design study.
 */

/** Background treatment for a media card, matching the design's colour blocks. */
export type MediaTone = "sage" | "ink" | "haze";

/**
 * How a clip was captured. Printed on the card when set, so a viewer is never
 * left guessing whether the robot drove itself. Left unset until the real label
 * for a clip is confirmed: a wrong tag is worse than no tag.
 */
export type CaptureMode = "autonomous" | "teleoperated";

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
  capture?: CaptureMode;
};

/**
 * A headline line, in order. Text parts carry no implicit spacing: the inline
 * mark supplies its own side margins, so words sit flush against it.
 */
export type HeadlinePart = string | { mark: true };

export type SupportingDetail = { label: string; value: string };

export type TeachingStep = { title: string; body: string };

export type Spec = { label: string; value: string };

export type NavChild = { href: string; label: string; note: string; media?: NavMedia };

/**
 * Footage shown beside a tab's links. Several clips play as one reel: each
 * runs to the end, hands over to the next, and the last loops back to the
 * first.
 */
export type NavMedia = {
  clips: readonly string[];
  poster: string;
  label: string;
};

export type NavItem = {
  href: string;
  label: string;
  items: readonly NavChild[];
  media?: NavMedia;
};

export const NAV_LINKS: readonly NavItem[] = [
  {
    href: "#what-it-is",
    label: "Nori A3",
    media: {
      clips: [
        "https://res.cloudinary.com/dp5tdrmf8/video/upload/q_auto,w_640/v1795064823/linkedin-video_lflhe1.mp4",
      ],
      poster:
        "https://res.cloudinary.com/dp5tdrmf8/video/upload/so_1,c_fill,w_640,h_360,q_auto,f_jpg/v1795064823/linkedin-video_lflhe1.jpg",
      label: "Launch Video",
    },
    items: [
      { href: "#what-it-is", label: "What it is", note: "A bimanual robot you teach by showing." },
      { href: "#the-face", label: "The face", note: "How you tell what it is doing." },
      { href: "#order", label: "Price and shipping", note: "$1,688, no deposit. Fall 2026." },
    ],
  },
  {
    href: "#the-face",
    label: "In the home",
    items: [
      {
        href: "#what-it-is",
        label: "Everyday tasks",
        note: "Kitchen, tidying, laundry, dishes.",
        media: {
          clips: [
            "https://res.cloudinary.com/dp5tdrmf8/video/upload/q_auto,w_640/v1795069077/evd-t2_konwfd.mp4",
            "https://res.cloudinary.com/dp5tdrmf8/video/upload/q_auto,w_640/v1795069078/evd-t1_kvjep7.mp4",
          ],
          poster:
            "https://res.cloudinary.com/dp5tdrmf8/video/upload/so_2,c_fill,w_640,h_360,q_auto,f_jpg/v1795069077/evd-t2_konwfd.jpg",
          label: "Around the house",
        },
      },
      {
        href: "#teach-it",
        label: "Teach it a skill",
        note: "Demonstrate once, it generalises.",
        media: {
          clips: [
            "https://res.cloudinary.com/dp5tdrmf8/video/upload/q_auto,w_640/v1795069077/skill-lib_jsvqlq.mp4",
          ],
          poster:
            "https://res.cloudinary.com/dp5tdrmf8/video/upload/so_2,c_fill,w_640,h_360,q_auto,f_jpg/v1795069077/skill-lib_jsvqlq.jpg",
          label: "Training a skill",
        },
      },
      {
        href: "/library",
        label: "Expression library",
        note: "Faces the community has made.",
        // Standing in for the playground demo until that one is recorded.
        media: {
          clips: [
            "https://res.cloudinary.com/dp5tdrmf8/video/upload/q_auto,w_640/v1795069077/skill-lib_jsvqlq.mp4",
          ],
          poster:
            "https://res.cloudinary.com/dp5tdrmf8/video/upload/so_2,c_fill,w_640,h_360,q_auto,f_jpg/v1795069077/skill-lib_jsvqlq.jpg",
          label: "Training a skill",
        },
      },
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

/**
 * The nori clover, in the hero headline and beside the nav wordmark. One url
 * for both, so the two share a cache entry. Delivered at display size: the
 * source png is 1.1MB, this is ~18KB, and f_webp rather than f_auto, which
 * hands back a jpeg and flattens the transparency.
 */
export const MARK = {
  src: "https://res.cloudinary.com/dp5tdrmf8/image/upload/w_240,q_auto,f_webp/v1795067350/Glossy_Neon_Green_Clover_Logo_k7snhs.png",
} as const;

export const HERO = {
  headline: [
    ["Meet", { mark: true }, "Nori A3."],
    ["You teach it by showing."],
  ] satisfies readonly (readonly HeadlinePart[])[],
  mark: MARK,
  body:
    "A two-armed robot you train at home, then share what it learns. $1,688, " +
    "shipping fall 2026, assembled in San Francisco.",
  primaryCta: { label: "Order an A3", href: "/preorder" },
  secondaryCta: { label: "See it work", href: "#what-it-is" },
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
      slot: "Close-up of the arm",
      note: "Slow, macro, soft light.",
      tone: "ink",
      ratio: "16 / 10",
      src: "https://res.cloudinary.com/dp5tdrmf8/video/upload/v1795163732/nori-arm_ohhzw1.mp4",
    },
  ] satisfies MediaSlot[],
} as const;

export const THE_FACE = {
  headline: "Its face tells you what it's doing.",
  body:
    "A robot you teach is a robot that runs on its own, so you need to read it at a " +
    "glance. A3's head screen maps its state onto two eyes: waiting, listening, " +
    "working, stuck. The four below are drawn by the same renderer that runs on the " +
    "robot, straight from the expression playground.",
  cta: { label: "Open the playground", href: "/lab" },
} as const;

export const HARDWARE = {
  headline: "What is on the body.",
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

export type WalkthroughStage = {
  id: string;
  title: string;
  body: string;
  /**
   * Where in the clip this stage begins, 0-1. Read off the footage: the camera
   * holds on the face, the grippers, the chest panel and then the base, so the
   * captions are cued to the shot rather than to even quarters.
   */
  at: number;
  /** Marks a claim the spec sheet cannot back yet. Printed on the caption. */
  unconfirmed?: true;
};

/**
 * The scroll-scrubbed tour of the body, read top to bottom. Every stage states
 * only what HARDWARE.specs already backs; the one claim that outruns the spec
 * sheet is flagged rather than written as fact.
 */
export const WALKTHROUGH = {
  /**
   * The push-in from full body to base. `src` is optional by design: with no
   * clip the section renders its stages as a plain list rather than an empty
   * pinned frame.
   */
  clip: {
    /**
     * Delivered through ki_0.2 on purpose. The source mp4 carries a single
     * keyframe for its ten seconds, so every backwards seek would decode from
     * frame zero; at a fifth of a second it scrubs, and q_auto brings it in at
     * 1.2MB rather than the source's 3.4MB. ac_none drops the silent track.
     */
    src: "https://res.cloudinary.com/dp5tdrmf8/video/upload/ki_0.2,vc_h264,ac_none,q_auto,w_1280/v1795168246/nori-fullbd_sopw1d.mp4",
    poster:
      "https://res.cloudinary.com/dp5tdrmf8/video/upload/so_0,c_fill,w_1280,h_720,q_auto,f_jpg/v1795168246/nori-fullbd_sopw1d.jpg",
    label: "Nori A3, full body down to the base",
  },
  /** Stands in for the clip while it is missing. */
  fallback: {
    slot: "Full body push-in",
    note: "One take, head to base.",
    tone: "ink",
    ratio: "4 / 5",
    video: true,
  } satisfies MediaSlot,
  stages: [
    {
      id: "head",
      title: "The face",
      body:
        "The head screen is a status display, not decoration: the four states above " +
        "are what it shows. Panel type and size are not published yet. Cameras sit on " +
        "the head and the neck.",
      at: 0,
      unconfirmed: true,
    },
    {
      id: "arm",
      title: "The arms",
      body:
        "Two of them, 7+1 degrees of freedom each and 1.5kg of payload per arm. A 720p " +
        "camera on each gripper watches the hand's own work.",
      at: 0.16,
    },
    {
      id: "torso",
      title: "The torso",
      body:
        "Battery and compute ride in the body, good for six to eight hours between " +
        "charges, with the speaker and microphone that take spoken commands.",
      at: 0.38,
    },
    {
      id: "base",
      title: "The base",
      body:
        "A 12m lidar scans at 8-12Hz, resolving 0.72 degrees at 10Hz, so the robot has " +
        "the shape of the room before it moves through it.",
      at: 0.62,
    },
  ] satisfies WalkthroughStage[],
} as const;

export const TEACH_IT = {
  headline: "Teach it a skill.",
  body:
    "Train your Nori at home, share its skills anywhere. The Nori Lab laptop app " +
    "records demonstrations and trains skills, then publishes them to the Skills " +
    "Marketplace.",
  cta: { label: "Browse the library", href: "/library" },
  media: {
    slot: "Video slot 09 — screen recording, Nori Lab",
    note: "Screen recording of the Nori Lab app.",
    tone: "sage",
    ratio: "16 / 10",
    video: true,
  } satisfies MediaSlot,
  steps: [
    {
      title: "Demonstrate",
      body: "Guide the arms through the task. The app records motion, camera feeds and grip.",
    },
    {
      title: "Train in Nori Lab",
      body: "A few demonstrations are enough to generalise to new positions and lighting.",
    },
    {
      title: "Run it",
      body: "Set the skill going and read the face: it reports what the robot is doing.",
    },
    {
      title: "Share it",
      body: "Publish to the Skills Marketplace, or install a skill someone else trained.",
    },
  ] satisfies TeachingStep[],
} as const;

export const CLOSING = {
  headline: ["Full price,", "no deposit."],
  price: "$1,688",
  body: "Reserve a NORI A3 at the launch price. Ships Fall 2026, assembled in San Francisco.",
  cta: { label: "Order an A3", href: "/preorder" },
  // Shot from several angles. `slot` is the caption and alt until a photo lands;
  // one shared ratio keeps every slide the same height so paging never jumps.
  gallery: [
    { slot: "Front", tone: "sage", ratio: "4 / 5" },
    { slot: "Three-quarter", tone: "ink", ratio: "4 / 5" },
    { slot: "Side", tone: "haze", ratio: "4 / 5" },
    { slot: "Back", tone: "sage", ratio: "4 / 5" },
  ] satisfies MediaSlot[],
} as const;

export const FOOTER = {
  note: "Design study for the A3 page. All copy is draft; footage slots are marked.",
  tagline: "The home robot you teach by showing.",
  // Columns point only at real anchors and routes — no placeholder legal pages,
  // since every footer href is checked against the sections that exist.
  columns: [
    {
      title: "The robot",
      links: [
        { href: "#what-it-is", label: "What it is" },
        { href: "#teach-it", label: "Teach it" },
        { href: "#the-face", label: "The face" },
        { href: "#hardware", label: "Hardware" },
      ],
    },
    {
      title: "Platform",
      links: [
        { href: "/lab", label: "Nori Lab" },
        { href: "/library", label: "Expression library" },
        { href: "/login", label: "Sign in" },
      ],
    },
    {
      title: "Get one",
      links: [
        { href: "#order", label: "Price" },
        { href: "/preorder", label: "Preorder" },
      ],
    },
  ],
  newsletter: {
    title: "Get launch updates",
    placeholder: "Email address",
    cta: "Subscribe",
  },
  socials: [
    { href: "https://x.com/NoriRobotics", label: "X" },
    { href: "https://discord.gg/NgKhhxQny7", label: "Discord" },
    { href: "https://www.linkedin.com/company/norirobotics", label: "LinkedIn" },
    { href: "https://github.com/Nori-Robotics", label: "GitHub" },
  ],
} as const;
