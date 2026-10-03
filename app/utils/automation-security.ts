import "server-only";

export type AutomationSecurityDecision =
  | "allow"
  | "review_required";

export type AutomationSecurityResult = {
  decision: AutomationSecurityDecision;
  flags: string[];
};

type AutomationSecurityInput = {
  incomingMessage: string;
  generatedReply: string;
};

const securityRules: Array<{
  flag: string;
  patterns: RegExp[];
}> = [
  {
    flag: "financial",
    patterns: [
      /\biban\b/i,
      /\bbic\b/i,
      /\bbank(?:konto|verbindung)?\b/i,
      /\bkreditkarte\b/i,
      /\bcredit\s*card\b/i,
      /\bpayment\s+details\b/i,
      /\bzahlungsdaten\b/i,
      /\bpaypal\b/i,
    ],
  },
  {
    flag: "credentials",
    patterns: [
      /\bpasswort\b/i,
      /\bpassword\b/i,
      /\bapi[\s_-]?key\b/i,
      /\baccess[\s_-]?token\b/i,
      /\bsecret\b/i,
      /\bverification\s+code\b/i,
      /\bbestätigungscode\b/i,
      /\banmeldedaten\b/i,
    ],
  },
  {
    flag: "personal_data",
    patterns: [
      /\bpersonalausweis\b/i,
      /\bpassport\b/i,
      /\bpassnummer\b/i,
      /\bsozialversicherungsnummer\b/i,
      /\bsocial\s+security\b/i,
      /\bsteuer[\s-]?id\b/i,
      /\bsteuernummer\b/i,
    ],
  },
  {
    flag: "health",
    patterns: [
      /\bdiagnose\b/i,
      /\bdiagnosis\b/i,
      /\bmedizinisch\b/i,
      /\bmedical\b/i,
      /\bgesundheit\b/i,
      /\bhealth\b/i,
    ],
  },
  {
    flag: "legal",
    patterns: [
      /\banwalt\b/i,
      /\blawyer\b/i,
      /\brechtsanwalt\b/i,
      /\blegal\s+action\b/i,
      /\bvertrag\b/i,
      /\bcontract\b/i,
      /\bnda\b/i,
      /\bnon[\s-]?disclosure\b/i,
    ],
  },
  {
    flag: "commitment",
    patterns: [
      /\bgarantie\b/i,
      /\bgarantiert\b/i,
      /\bguarantee\b/i,
      /\bguaranteed\b/i,
      /\brückerstattung\b/i,
      /\berstattung\b/i,
      /\brefund\b/i,
    ],
  },
  {
    flag: "internal_information",
    patterns: [
      /\bsystem prompt\b/i,
      /\bsystem message\b/i,
      /\binternal instructions\b/i,
      /\binternen anweisungen\b/i,
      /\bhidden instructions\b/i,
    ],
  },
];

export function checkAutomationSecurity({
  incomingMessage,
  generatedReply,
}: AutomationSecurityInput): AutomationSecurityResult {
  const combinedText =
    `${incomingMessage}\n${generatedReply}`.trim();

  const flags = securityRules
    .filter(({ patterns }) =>
      patterns.some((pattern) =>
        pattern.test(combinedText)
      )
    )
    .map(({ flag }) => flag);

  const uniqueFlags = [...new Set(flags)];

  return {
    decision:
      uniqueFlags.length > 0
        ? "review_required"
        : "allow",
    flags: uniqueFlags,
  };
}