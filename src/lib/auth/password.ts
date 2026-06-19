export type PasswordLevel = "leeg" | "zwak" | "matig" | "goed" | "sterk";

export interface PasswordStrength {
  score: number;
  label: string;
  level: PasswordLevel;
  checks: { label: string; met: boolean }[];
}

/**
 * Beoordeelt een wachtwoord op lengte en samenstelling en levert een score (0-4),
 * een leesbaar label en een checklist. Gedeeld door de invite- en reset-flow zodat
 * de gebruiker overal dezelfde eisen en feedback ziet.
 */
export function evaluatePassword(password: string): PasswordStrength {
  const checks = [
    { label: "8+ tekens", met: password.length >= 8 },
    { label: "Hoofd- & kleine letter", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "1 cijfer", met: /\d/.test(password) },
    { label: "1 symbool", met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) {
    return { score: 0, label: "Nog geen wachtwoord", level: "leeg", checks };
  }

  let score = checks.filter((check) => check.met).length;
  if (password.length >= 12 && score >= 3) score = 4;

  const level = ([, "zwak", "zwak", "matig", "sterk"] as const)[score] ?? "zwak";
  const labelMap: Record<PasswordLevel, string> = {
    leeg: "Nog geen wachtwoord",
    zwak: "Zwak wachtwoord",
    matig: "Redelijk wachtwoord",
    goed: "Goed wachtwoord",
    sterk: "Sterk wachtwoord",
  };

  return { score, label: labelMap[level], level, checks };
}
