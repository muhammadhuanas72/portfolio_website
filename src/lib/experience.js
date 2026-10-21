import { portfolioData } from "../data/portfolioData";

// Experience and education as one ordered list. `position` sets the order (lowest first);
// the owner can add entries, edit or hide these built-in ones, and reorder them in /admin.html.
export const builtInExperience = [
  ...portfolioData.experience.map((e, i) => ({
    id: e.id,
    kind: "Internship",
    title: e.role,
    org: e.company,
    location: e.location ?? "",
    period: e.period,
    summary: e.description ?? "",
    points: e.highlights ?? [],
    position: (i + 1) * 10,
  })),
  ...portfolioData.about.timeline.map((t, i) => ({
    id: t.id,
    kind: "Education",
    title: t.title,
    org: t.institution,
    location: t.location ?? "",
    period: t.year,
    summary: t.description ?? "",
    points: [],
    position: (portfolioData.experience.length + i + 1) * 10,
  })),
];

export const isEducation = (e) => /education/i.test(e.kind);
export const byPosition = (a, b) => (a.position ?? 0) - (b.position ?? 0);
