export type Opportunity = {
  title: string;
  category: string;
  eligibility: string;
  country: string;
  online: boolean;
  deadline: string;
};

// Example directory — verify current deadlines and eligibility on the official
// site before relying on any entry here. Not comprehensive, not auto-updated.
export const OPPORTUNITIES: Opportunity[] = [
  { title: "International Mathematical Olympiad (IMO)", category: "Olympiad", eligibility: "Pre-university students, national team selection", country: "Global", online: false, deadline: "Varies by country (national rounds)" },
  { title: "Model United Nations (MUN) conferences", category: "MUN", eligibility: "High school / university students", country: "Global", online: false, deadline: "Varies by conference" },
  { title: "Genius Olympiad", category: "Competition", eligibility: "High school students, STEM projects", country: "United States", online: false, deadline: "Spring (varies by year)" },
  { title: "Regeneron International Science and Engineering Fair (ISEF)", category: "Research", eligibility: "High school students with a research project", country: "United States", online: false, deadline: "Via affiliated regional fairs" },
  { title: "Major League Hacking (MLH) hackathons", category: "Hackathon", eligibility: "University and some high school students", country: "Global", online: true, deadline: "Rolling, event-specific" },
  { title: "UN Volunteers online programme", category: "Volunteering", eligibility: "18+, varies by role", country: "Global", online: true, deadline: "Rolling" },
];
