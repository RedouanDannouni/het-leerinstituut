import type { Role } from "./types";

export const roleLabels: Record<Role, string> = {
  school_opleider: "Schoolopleider",
  school_leider: "Schoolleider",
  docent: "Docent",
  admin: "Admin",
};

export const roleIntents: Record<Role, string> = {
  school_opleider: "Snel zien welke observaties vandaag aandacht vragen.",
  school_leider: "Voortgang en gespreksonderwerpen sturen zonder ruwe observatiedata.",
  docent: "Eigen materiaal, feedback en afspraken ontwikkelgericht volgen.",
  admin: "Omgevingen, gebruikers, templates en audit betrouwbaar beheren.",
};
