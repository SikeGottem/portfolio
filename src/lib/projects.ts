export interface Project {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  year: number;
  color: string;
}

export const projects: Project[] = [
  {
    slug: "bristlecone",
    name: "Bristlecone Asset Management",
    description: "Investor pitch deck for a global asset manager",
    tags: ["DECK", "BRAND"],
    year: 2026,
    color: "#1a3a2a",
  },
  {
    slug: "sun-street-hk",
    name: "Sun Street HK",
    description: "Complete website rebuild for a Hong Kong consulting firm",
    tags: ["WEB", "DESIGN"],
    year: 2026,
    color: "#011E41",
  },
  {
    slug: "s17-skincare",
    name: "S17 Skincare",
    description: "Brand identity and design for a skincare line",
    tags: ["BRAND", "DESIGN"],
    year: 2025,
    color: "#2a1a1a",
  },
  {
    slug: "limage",
    name: "Limage",
    description: "Website for a Sydney-based skincare salon",
    tags: ["WEB"],
    year: 2025,
    color: "#1a1a2a",
  },
  {
    slug: "briefed",
    name: "Briefed",
    description: "SaaS platform for freelance designers",
    tags: ["PRODUCT", "WEB", "CODE"],
    year: 2026,
    color: "rgba(224, 82, 82, 0.2)",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project | undefined {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return undefined;
  return projects[(idx + 1) % projects.length];
}
