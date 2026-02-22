export interface Project {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  year: number;
  brief: string;
  approach: string;
  previewImage?: string;
  accentColor?: string;
  accentTextLight?: boolean;
}

export const projects: Project[] = [
  {
    slug: "sun-street-hk",
    previewImage: "/previews/sun-street-hk.jpg",
    name: "Sun Street HK",
    description: "Website rebuild for a Hong Kong consulting firm",
    tags: ["WEB", "DESIGN"],
    year: 2026,
    accentColor: "#0A1E3D",
    accentTextLight: true,
    brief:
      "Sun Street HK needed a complete digital overhaul — their existing site didn't reflect the calibre of their consulting work or their position in the Hong Kong market.",
    approach:
      "We stripped everything back and rebuilt from the ground up. Clean typography, structured content hierarchy, and a responsive build that performs across devices. The result is a site that communicates authority and professionalism without saying a word too many.",
  },
  {
    slug: "bristlecone",
    previewImage: "/previews/bristlecone.jpg",
    name: "Bristlecone",
    description: "Branding and investor pitch deck for a global asset manager",
    tags: ["BRAND", "DECK"],
    year: 2026,
    accentColor: "#1B3D2F",
    accentTextLight: true,
    brief:
      "Bristlecone required a pitch deck that could stand up in rooms with serious capital. The existing materials were generic and undersold their track record.",
    approach:
      "We developed a visual system rooted in clarity and confidence — restrained colour, sharp typographic hierarchy, and data visualisation that tells the story without clutter. Every slide was designed to earn trust.",
  },
  {
    slug: "s17-skincare",
    previewImage: "/previews/s17-skincare.jpg",
    name: "S17 Skincare",
    description: "Brand identity for a premium skincare line",
    tags: ["BRAND", "DESIGN"],
    year: 2025,
    accentColor: "#1C2E1F",
    accentTextLight: true,
    brief:
      "S17 needed a brand identity that felt premium without being pretentious — something that could sit on a shelf next to established names and hold its own.",
    approach:
      "We built the brand from typography and texture. A refined wordmark, a muted earth-tone palette, and packaging design that feels considered at every touchpoint. The identity system scales from labels to digital with consistency.",
  },
  {
    slug: "limage",
    previewImage: "/previews/limage.jpg",
    name: "Limage",
    description: "Website for a Sydney skincare salon",
    tags: ["WEB"],
    year: 2025,
    accentColor: "#C4A87C",
    accentTextLight: false,
    brief:
      "Limage wanted a website that matched the experience of walking into their salon — calm, elevated, and intentional.",
    approach:
      "We designed a minimal site with generous whitespace, smooth transitions, and imagery that does the heavy lifting. The booking flow was simplified and the overall experience feels like an extension of the brand.",
  },
];

export const experiments: Project[] = [
  {
    slug: "briefed",
    previewImage: "/previews/briefed.jpg",
    name: "Briefed",
    description: "SaaS platform for freelance designers",
    tags: ["PRODUCT", "CODE"],
    year: 2026,
    accentColor: "#E05252",
    accentTextLight: true,
    brief:
      "Freelance designers waste hours on admin — scoping projects, writing proposals, chasing clients. Briefed was built to fix that.",
    approach:
      "Designing and building a full SaaS platform from the ground up. Project scoping, client portals, proposal generation, and workflow management — all in one place. Built with Next.js, TypeScript, and a relentless focus on the designer's experience.",
  },
  {
    slug: "campfire",
    previewImage: "/previews/campfire.jpg",
    name: "Campfire",
    description: "Social app — daily questions that spark real conversations",
    tags: ["APP", "PRODUCT", "CODE"],
    year: 2025,
    accentColor: "#F4A340",
    accentTextLight: false,
    brief:
      "Social media is broken. Everyone performs, nobody connects. Campfire was an experiment in building a social platform around genuine conversation — one question a day, answered honestly, shared with close friends.",
    approach:
      "Designed and developed a full mobile-first app concept. Daily question engine, DM-based sharing, friend group matching. Built the UI system, interaction patterns, and core product logic. The project shaped how I think about social product design.",
  },
  {
    slug: "lore",
    previewImage: "/previews/lore.jpg",
    name: "Lore",
    description: "Collaborative weekly journal for friend groups",
    tags: ["APP", "PRODUCT", "CODE"],
    year: 2025,
    accentColor: "#6B4EE6",
    accentTextLight: true,
    brief:
      "Friend groups share moments constantly but have no way to collect them. Lore was a collaborative pinboard journal — a shared digital scrapbook that builds itself week by week.",
    approach:
      "Built auth, onboarding, infinite canvas, content types (photos, text, links, audio), and a year-end wrapped feature. Next.js, Supabase, real-time collaboration. Discontinued in favour of Briefed — but the technical and product learnings carried forward.",
  },
  {
    slug: "agent-comms",
    previewImage: "/previews/agent-comms.jpg",
    name: "Agent Comms",
    description: "Real-time coordination platform for AI agents",
    tags: ["API", "PRODUCT", "CODE"],
    year: 2026,
    accentColor: "#1A1A1A",
    accentTextLight: true,
    brief:
      "AI agents on different platforms can't talk to each other. Agent Comms is a standalone coordination API — threads, tasks, shared memory, handoffs — so agents can work together in real time.",
    approach:
      "Built a full API from scratch with Hono and TypeScript. Deployed to Render with Turso (SQLite) for persistence. Features include threaded messaging, task management, read receipts, search, analytics, and a dark-mode dashboard. Designed for zero-config agent onboarding.",
  },
];
