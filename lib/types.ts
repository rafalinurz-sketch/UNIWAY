export type University = {
  id: string;
  name: string;
  country: string;
  region: string;
  city: string;
  type: string;
  majors: string[];
  req: {
    gpa: string;
    sat: string;
    act: string;
    ielts: string;
    toefl: string;
    ap: string;
    ib: string;
    docs: string[];
  };
  acceptanceRate: string;
  tuition: string;
  applicationFee: string;
  deadline: string;
  deadlines: { EA: string; ED?: string; RD: string; Rolling?: string };
  scholarships: { name: string; cov: string; elig: string; dl: string }[];
  gks: boolean;
  gksInfo: { eligible: string[]; track: string; coverage: string; requirements: string } | null;
  officialSite: string;
  lastVerified: string;
  source: string;
  dataStatus: "Verified" | "Needs Review";
};

export type SatQuestion = {
  id: string;
  test_id: string | null;
  test_title: string | null;
  section: "math" | "rw";
  topic: string;
  difficulty: string;
  question: string;
  choices: string[];
  correct_index: number | null;
  explanation: string | null;
  source_file: string | null;
  needs_review: boolean;
};

export type IeltsPassage = {
  id: string;
  test_id: string | null;
  title: string;
  text: string;
  needs_review: boolean;
};

export type IeltsReadingQuestion = {
  id: string;
  passage_id: string;
  type: string;
  question: string;
  choices: string[] | null;
  answer: string | null;
};

export type Profile = {
  id: string;
  name: string | null;
  is_admin: boolean;
  gpa: string | null;
  sat: string | null;
  ielts: string | null;
  toefl: string | null;
  intended_major: string | null;
  target_countries: string | null;
};
