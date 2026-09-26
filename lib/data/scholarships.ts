export type Scholarship = {
  name: string;
  country: string;
  type: string;
  coverage: string;
  elig: string;
  deadline: string;
  gks?: boolean;
};

export const SCHOLARSHIPS: Scholarship[] = [
  { name: "Global Korea Scholarship (GKS)", country: "South Korea", type: "Government", coverage: "Full tuition, airfare, monthly stipend, Korean training, insurance", elig: "Under 25 (bachelor) / 40 (grad), strong academics", deadline: "Feb–Mar (varies by track)", gks: true },
  { name: "Lester B. Pearson Scholarship", country: "Canada", type: "University (Toronto)", coverage: "Full tuition + books + residence, 4 years", elig: "Exceptional international applicants", deadline: "Nov 15" },
  { name: "Reach Oxford Scholarship", country: "United Kingdom", type: "University (Oxford)", coverage: "Full tuition + living costs", elig: "Students from eligible developing countries", deadline: "Jan (with UCAS)" },
  { name: "Cambridge Trust Scholarship", country: "United Kingdom", type: "University (Cambridge)", coverage: "Full or partial cost of study", elig: "Academic merit + financial need", deadline: "Early December" },
  { name: "MIT Need-Based Aid", country: "United States", type: "University (MIT)", coverage: "Up to full cost of attendance", elig: "Demonstrated financial need, any nationality", deadline: "With application" },
  { name: "Fulbright Foreign Student Program", country: "United States", type: "Government", coverage: "Tuition, living stipend, health insurance, airfare", elig: "Graduate-level applicants, strong leadership record", deadline: "Varies by country (typically spring)" },
  { name: "Chevening Scholarship", country: "United Kingdom", type: "Government", coverage: "Full tuition, living stipend, travel costs", elig: "Master's applicants with leadership potential", deadline: "Early November" },
  { name: "DAAD Scholarship", country: "Germany", type: "Government", coverage: "Monthly stipend, travel & health insurance", elig: "Graduate applicants in eligible fields", deadline: "Varies by programme" },
  { name: "Swiss Government Excellence Scholarship", country: "Switzerland", type: "Government", coverage: "Monthly stipend, tuition waiver, insurance", elig: "Postgraduate/research applicants", deadline: "Varies by country of origin" },
  { name: "Australia Awards Scholarship", country: "Australia", type: "Government", coverage: "Tuition, living allowance, travel", elig: "Applicants from eligible developing countries", deadline: "Apr–Jun (varies)" },
];
