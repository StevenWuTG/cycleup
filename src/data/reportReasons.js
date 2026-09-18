// The reasons a person can pick when reporting. `value` is stored in the
// database (and must match the check constraint in supabase/reports.sql).
export const reportReasons = [
  { value: "spam",       label: "Spam or a scam" },
  { value: "prohibited", label: "Illegal, unsafe or prohibited item" },
  { value: "misleading", label: "Misleading or fake" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "other",      label: "Something else" },
];
