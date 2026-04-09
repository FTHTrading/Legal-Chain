// ══════════════════════════════════════════════════════════════════════════════
// State of Florida v. Marquis Anthony Delcampo — Full Case Data
// Case #202300001348 | Warrant #23912CFA | Booking #202300004473
// 18th Judicial Circuit, Seminole County, Florida
// ══════════════════════════════════════════════════════════════════════════════

// ── Case Overview ──────────────────────────────────────────────────────────

export const CASE_OVERVIEW = {
  id: "state-v-delcampo",
  caseNumber: "202300001348",
  warrantNumber: "23912CFA",
  bookingId: "202300004473",
  caption: "State of Florida v. Marquis Anthony Delcampo",
  charge: "Aggravated Battery — F.S. § 784.045(1)(a)",
  chargeGrade: "Second-degree felony",
  statutoryMaximum: 15,
  sentenceImposed: 20,
  sentenceBreakdown: "15 years PRR (day-for-day, no gain time) + 5 years HFO (consecutive)",
  costsOrdered: 2500,
  court: "18th Judicial Circuit, Seminole County, Florida",
  appealCourt: "Fifth District Court of Appeal",
  judge: "Circuit Judge Jessica Reckseidler",
  prosecutors: ["ASA Domenick Leo", "ASA Martine McCarthy"],
  stateAttorney: "William Scheiner (SA18)",
  defendant: {
    name: "Marquis Anthony Delcampo",
    ageAtSentencing: 34,
    currentFacility: "Florida DOC",
    bookingDate: "2023-05-05",
    bond: 2000,
  },
  incidentDate: "2023-02-22",
  incidentLocation: "East SR 436 / 1370 E Altamonte Dr, Altamonte Springs, FL",
  trialDate: "2026-01",
  sentencingDate: "2026-02-23",
  appealDeadline: "2026-05-10",
};

// ── Key Actors ──────────────────────────────────────────────────────────────

export interface CaseActor {
  id: string;
  name: string;
  role: string;
  side: "defense" | "prosecution" | "witness" | "corporate" | "law-enforcement";
  status: string;
  details: string;
  critical?: boolean;
}

export const CASE_ACTORS: CaseActor[] = [
  {
    id: "marquis-delcampo",
    name: "Marquis Anthony Delcampo",
    role: "Defendant / Appellant",
    side: "defense",
    status: "Incarcerated since 5/5/2023",
    details: "Age 34 at sentencing. Sentenced to 20 years (15 PRR + 5 HFO) for aggravated battery.",
  },
  {
    id: "lisa-smith",
    name: "Lisa Smith",
    role: "Authorized Representative",
    side: "defense",
    status: "Active",
    details: "Authorized to act on behalf of defendant. Identified SYG was never applied, eyewitness excluded.",
  },
  {
    id: "jovanny-guzman",
    name: "Jovanny Atahualpa Mercado Guzman",
    role: "Uber Driver / Listed Victim",
    side: "witness",
    status: "Age 50 at time of incident",
    details: "Name variations in records: 'Mercade Guzman,' 'Mahnalp Mercade' — identity reliability concern. Selected image #2 in Spanish-only photo lineup 2/23/23.",
    critical: true,
  },
  {
    id: "female-passenger",
    name: "[UNNAMED Co-Rider]",
    role: "Key Witness — Missing",
    side: "witness",
    status: "Never located or interviewed",
    details: "Exited vehicle at Wawa stop, disappeared from investigation. Would have witnessed driver behavior, impatience, and pre-altercation escalation.",
    critical: true,
  },
  {
    id: "hilton-rodriguez",
    name: "Hilton A. Rodriguez",
    role: "Bystander Witness / Video Recorder",
    side: "witness",
    status: "Present at scene with phone",
    details: "Recorded cell phone video of incident. Only fragments shown to jury (punching only). Full sequence unknown.",
    critical: true,
  },
  {
    id: "witness-rhodes",
    name: "Rhodes",
    role: "Eyewitness",
    side: "witness",
    status: "Sworn statement on file",
    details: "Identity and statement details TBD from case binder.",
  },
  {
    id: "witness-pagan",
    name: "Pagan",
    role: "Eyewitness",
    side: "witness",
    status: "Sworn statement on file",
    details: "Identity and statement details TBD from case binder.",
  },
  {
    id: "asa-leo",
    name: "ASA Domenick Leo",
    role: "Prosecuting Attorney",
    side: "prosecution",
    status: "In office",
    details: "Charged and tried case. Co-prosecutor with ASA Martine McCarthy.",
  },
  {
    id: "asa-mccarthy",
    name: "ASA Martine McCarthy",
    role: "Prosecuting Attorney",
    side: "prosecution",
    status: "In office",
    details: "Co-prosecutor on the case.",
  },
  {
    id: "judge-reckseidler",
    name: "Circuit Judge Jessica Reckseidler",
    role: "Sentencing Judge",
    side: "prosecution",
    status: "In office",
    details: "Imposed 20-year sentence — exceeds 15-year statutory maximum for 2nd degree felony.",
  },
  {
    id: "william-scheiner",
    name: "William Scheiner",
    role: "State Attorney, SA18",
    side: "prosecution",
    status: "In office",
    details: "18th Judicial Circuit (Seminole/Brevard Counties).",
  },
  {
    id: "uber-technologies",
    name: "Uber Technologies, Inc.",
    role: "Platform Operator / Civil Defendant",
    side: "corporate",
    status: "Potential civil defendant",
    details: "FL Registered Agent: CT Corporation System, 1200 S Pine Island Rd, Plantation, FL 33324. HQ: 1515 3rd St, San Francisco, CA 94158.",
  },
  {
    id: "scso",
    name: "Seminole County Sheriff's Office",
    role: "Investigating Agency",
    side: "law-enforcement",
    status: "Case custodian",
    details: "100 Eslinger Way, Sanford, FL. Records: (407) 665-6650. Conducted investigation and photo lineup.",
  },
];

// ── Timeline Events ─────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  timestamp: string;
  label: string;
  description: string;
  category: "incident" | "investigation" | "legal" | "appeal" | "deadline";
  critical?: boolean;
  contradictions?: string[];
}

export const CASE_TIMELINE: TimelineEvent[] = [
  {
    id: "t1",
    timestamp: "2023-02-22 ~07:02",
    label: "Uber Ride Requested",
    description: "Marquis requests Uber ride. Pickup at Speedway, 3190 S US Hwy 17-92. Female passenger also boards.",
    category: "incident",
    contradictions: ["SA18 press release states ~8:50 AM — 1h 48m discrepancy from sworn statement"],
  },
  {
    id: "t2",
    timestamp: "2023-02-22 ~07:15",
    label: "Wawa Stop — Female Passenger Exits",
    description: "Female passenger requests intermediate Wawa stop. Driver agrees and pulls in. Female exits vehicle and does not return. Driver becomes visibly impatient.",
    category: "incident",
    critical: true,
  },
  {
    id: "t3",
    timestamp: "2023-02-22 ~07:25",
    label: "Driver Erratic Driving Begins",
    description: "Driver exits Wawa through entrance-only lane, runs a red light, drives erratically toward destination. Multiple traffic violations committed.",
    category: "incident",
  },
  {
    id: "t4",
    timestamp: "2023-02-22 ~07:35",
    label: "Driver Stops at Wrong Location",
    description: "Driver stops vehicle at location that is NOT the GPS-entered destination. Ride has NOT concluded.",
    category: "incident",
    critical: true,
    contradictions: ["Press release claims 'ride had concluded' — GPS data would disprove this"],
  },
  {
    id: "t5",
    timestamp: "2023-02-22 ~07:36",
    label: "FIRST AGGRESSION — Driver Forcible Removal",
    description: "Driver exits vehicle, opens rear passenger door, reaches in and physically grabs Marquis, attempts to forcibly remove him from the vehicle. Marquis's belongings still inside.",
    category: "incident",
    critical: true,
    contradictions: ["Prosecution narrative omits driver's initiation of physical contact entirely, jumping to 'Marquis started punching'"],
  },
  {
    id: "t6",
    timestamp: "2023-02-22 ~07:37",
    label: "Physical Confrontation — Self-Defense",
    description: "Driver attempts physical takedown of Marquis. Marquis defends himself with punching — this is the moment captured on video and shown to jury.",
    category: "incident",
    critical: true,
  },
  {
    id: "t7",
    timestamp: "2023-02-22 ~07:38",
    label: "Driver Arms with Umbrella",
    description: "Driver returns to vehicle, retrieves umbrella from compartment, and swings it at Marquis as a weapon. Escalates to armed assault. Marquis defends against armed attacker.",
    category: "incident",
    critical: true,
    contradictions: ["Prosecution narrative entirely omits the umbrella weapon — a major escalation by the driver"],
  },
  {
    id: "t8",
    timestamp: "2023-02-22 ~07:40",
    label: "Altercation Ends — Separation",
    description: "Both parties separate. Marquis retrieves belongings from vehicle. Bystander (Rodriguez) present with phone video.",
    category: "incident",
  },
  {
    id: "t9",
    timestamp: "2023-02-22",
    label: "Police Response & On-Scene Investigation",
    description: "SCSO responds to scene. Officers take statements. Preliminary investigation. Details restricted — BWC, CAD logs, and 911 audio NOT YET obtained.",
    category: "investigation",
  },
  {
    id: "t10",
    timestamp: "2023-02-23 16:30",
    label: "Photo Lineup — Spanish Only",
    description: "SCSO conducts photo lineup in Spanish language only. Driver (Guzman) selects image #2. Administered less than 34 hours after incident. Potential suggestiveness and translation issues.",
    category: "investigation",
    critical: true,
    contradictions: ["Lineup conducted in Spanish only — potential Neil v. Biggers challenge for suggestiveness"],
  },
  {
    id: "t11",
    timestamp: "2023-02-23",
    label: "Uber LE Portal Reply",
    description: "Uber Law Enforcement Portal request #00336376 replied — rider data linked to Marquis. Scope of data provided unknown (driver ID only? Full telemetry?).",
    category: "investigation",
  },
  {
    id: "t12",
    timestamp: "2023-05-05",
    label: "Warrant Arrest",
    description: "Arrest warrant #23912CFA executed. Seminole County Booking ID #202300004473. Bond set at $2,000 — relatively low for aggravated battery charge, suggesting magistrate assessed low risk.",
    category: "legal",
    contradictions: ["$2,000 bond suggests low initial risk assessment, yet prosecution later sought and obtained a 20-year sentence"],
  },
  {
    id: "t13",
    timestamp: "2026-01",
    label: "Jury Trial — Conviction",
    description: "Jury trial conducted. Guilty verdict on Aggravated Battery, F.S. § 784.045(1)(a). Jury also returned special verdicts on PRR and HFO enhancements. Phone video fragment shown to jury — only 'worst moment' for defendant.",
    category: "legal",
    critical: true,
  },
  {
    id: "t14",
    timestamp: "2026-02-23",
    label: "Sentencing — 20 Years Imposed",
    description: "Judge Jessica Reckseidler imposes 20-year sentence: 15 years PRR (day-for-day, no gain time) + 5 years HFO (consecutive). $2,500 costs ordered. Sentence EXCEEDS 15-year statutory maximum for 2nd degree felony.",
    category: "legal",
    critical: true,
  },
  {
    id: "t15",
    timestamp: "2026-03-30",
    label: "Post-Conviction Advocacy Platform Launched",
    description: "Comprehensive forensic deep dive completed. All legal remedies mapped. Defense operations platform deployed.",
    category: "appeal",
  },
  {
    id: "t16",
    timestamp: "2026-05-10",
    label: "DIRECT APPEAL DEADLINE",
    description: "Direct appeal window closes. Must verify if Notice of Appeal was timely filed. If not, engage appellate attorney for belated appeal via 3.850 IAC claim.",
    category: "deadline",
    critical: true,
  },
  {
    id: "t17",
    timestamp: "2028-02-23",
    label: "Rule 3.850 Deadline",
    description: "2-year window from sentencing for ineffective assistance claims under Rule 3.850. Should file well before this date with all 9 IAC grounds.",
    category: "deadline",
  },
];

// ── Contradictions ──────────────────────────────────────────────────────────

export interface Contradiction {
  id: string;
  number: number;
  officialNarrative: string;
  actualEvidence: string;
  legalImpact: string;
  severity: "critical" | "high" | "medium";
  linkedEvidence: string[];
}

export const CASE_CONTRADICTIONS: Contradiction[] = [
  {
    id: "c1",
    number: 1,
    officialNarrative: "\"Ride had concluded\"",
    actualEvidence: "Ride was NOT at GPS destination; Marquis had right to remain in vehicle",
    legalImpact: "SELF-DEFENSE: Driver had no authority to forcibly remove passenger. Occupied vehicle doctrine applies.",
    severity: "critical",
    linkedEvidence: ["uber-gps-data", "trip-telemetry"],
  },
  {
    id: "c2",
    number: 2,
    officialNarrative: "\"Marquis started punching\" (narrative start)",
    actualEvidence: "Driver FIRST: stopped at wrong location, opened door, grabbed Marquis, attempted takedown",
    legalImpact: "AGGRESSOR REVERSAL: Driver initiated all physical contact. Completely changes the self-defense calculus.",
    severity: "critical",
    linkedEvidence: ["sworn-statement", "business-cctv"],
  },
  {
    id: "c3",
    number: 3,
    officialNarrative: "Location \"Casselberry\" vs \"Altamonte Springs\"",
    actualEvidence: "Same corridor, different cities — matters if stop was NOT at GPS destination",
    legalImpact: "WRONG-LOCATION DEFENSE: Proves ride was incomplete. GPS coordinates would establish this definitively.",
    severity: "medium",
    linkedEvidence: ["uber-gps-data"],
  },
  {
    id: "c4",
    number: 4,
    officialNarrative: "Time: ~8:50 AM (press release)",
    actualEvidence: "Time: ~7:02 AM (sworn statement)",
    legalImpact: "1h 48m DISCREPANCY — foundational timeline is unreliable. Undermines prosecution's chronology.",
    severity: "high",
    linkedEvidence: ["press-release", "sworn-statement"],
  },
  {
    id: "c5",
    number: 5,
    officialNarrative: "Omitted: driver's erratic driving, red light, wrong-way exit",
    actualEvidence: "Documented in sworn statement: Wawa lot egress violation, speeding, running red light",
    legalImpact: "Driver was reckless BEFORE altercation — shows escalating aggressive behavior pattern.",
    severity: "high",
    linkedEvidence: ["sworn-statement", "traffic-cameras"],
  },
  {
    id: "c6",
    number: 6,
    officialNarrative: "Omitted: driver arming with umbrella",
    actualEvidence: "Umbrella retrieved from vehicle and swung at Marquis as weapon",
    legalImpact: "ARMED ASSAULT by driver escalates to offense level requiring deadly-force self-defense response.",
    severity: "critical",
    linkedEvidence: ["sworn-statement", "scene-evidence"],
  },
  {
    id: "c7",
    number: 7,
    officialNarrative: "Injuries: driver's broken nose, concussion, fractured jaw",
    actualEvidence: "Omitted: Marquis's injuries from driver's takedown and umbrella strike",
    legalImpact: "ONE-SIDED MEDICAL NARRATIVE — suggests prosecution presentation bias. Where are defendant's injury records?",
    severity: "high",
    linkedEvidence: ["medical-records-driver", "medical-records-marquis"],
  },
  {
    id: "c8",
    number: 8,
    officialNarrative: "Bond $2,000 (low-risk initial assessment)",
    actualEvidence: "Sentence 20 years (prosecution maximized)",
    legalImpact: "SENTENCING PROPORTIONALITY: Initial magistrate assessed dramatically lower risk than final sentence reflects.",
    severity: "medium",
    linkedEvidence: ["booking-records", "sentencing-order"],
  },
  {
    id: "c9",
    number: 9,
    officialNarrative: "Driver name: \"Jovanny Mercado Guzman\" (press release)",
    actualEvidence: "Spelling variants: \"Mercade,\" \"Mahnalp,\" \"Atahualpa\"",
    legalImpact: "Identity and chain-of-evidence concern — multiple name spellings in official documents.",
    severity: "medium",
    linkedEvidence: ["police-report", "booking-records"],
  },
  {
    id: "c10",
    number: 10,
    officialNarrative: "Video shown to jury (fragments)",
    actualEvidence: "Full video likely contains driver-initiation sequence jury never saw",
    legalImpact: "BRADY/PRESENTATION: Jury saw only the 'worst moment' for Marquis. Full context would show self-defense.",
    severity: "critical",
    linkedEvidence: ["cell-phone-video", "business-cctv"],
  },
];

// ── Evidence Matrix ─────────────────────────────────────────────────────────

export interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  status: "obtained" | "not-obtained" | "partial" | "known-to-exist" | "likely-lost";
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  blockchainHash?: string;
  anchoredBlock?: number;
}

export const EVIDENCE_MATRIX: EvidenceItem[] = [
  {
    id: "cell-phone-video",
    title: "Cell Phone Video (Witness)",
    source: "Hilton A. Rodriguez",
    status: "not-obtained",
    priority: "critical",
    description: "Only fragment shown to jury showing punching; full sequence unknown. May contain driver-initiation sequence.",
  },
  {
    id: "business-cctv",
    title: "Business CCTV (Pablano's)",
    source: "Pablano Hispanic Restaurant, 1370 E Altamonte Dr",
    status: "not-obtained",
    priority: "critical",
    description: "May show complete sequence including driver initiation. PRESERVATION URGENT.",
  },
  {
    id: "wawa-cctv",
    title: "Wawa CCTV",
    source: "Wawa near Speedway pickup",
    status: "not-obtained",
    priority: "high",
    description: "May show female passenger exit, driver impatience, lot behavior before erratic driving.",
  },
  {
    id: "uber-trip-telemetry",
    title: "Uber Trip Telemetry",
    source: "Uber Technologies (LE Portal #00336376)",
    status: "partial",
    priority: "critical",
    description: "Must obtain full GPS coordinates, speed data, route deviations, trip status. Currently only driver identification obtained.",
  },
  {
    id: "uber-in-app",
    title: "Uber In-App Messages",
    source: "Uber App",
    status: "not-obtained",
    priority: "high",
    description: "Communications between rider and driver during trip.",
  },
  {
    id: "uber-driver-profile",
    title: "Uber Driver Profile & History",
    source: "Uber Technologies",
    status: "not-obtained",
    priority: "high",
    description: "Driver history, prior complaints, safety incidents, deactivation status.",
  },
  {
    id: "police-incident-report",
    title: "Police Incident Report",
    source: "SCSO #202300001348",
    status: "not-obtained",
    priority: "critical",
    description: "Complete narrative, witness statements, officer observations. Foundation document of the case.",
  },
  {
    id: "police-supplements",
    title: "Police Supplements",
    source: "SCSO",
    status: "not-obtained",
    priority: "high",
    description: "Follow-up investigation reports and detective notes.",
  },
  {
    id: "911-audio",
    title: "911 Audio / Call Records",
    source: "SCSO Communications Center",
    status: "not-obtained",
    priority: "high",
    description: "Who called 911? What was reported? Sets the initial narrative before police arrival.",
  },
  {
    id: "cad-dispatch",
    title: "CAD / Dispatch Logs",
    source: "SCSO Communications Center",
    status: "not-obtained",
    priority: "high",
    description: "Timestamps, unit assignments, dispatcher notes. Establishes response timeline.",
  },
  {
    id: "bwc-footage",
    title: "Body-Worn Camera Footage",
    source: "Responding SCSO Officers",
    status: "not-obtained",
    priority: "high",
    description: "Scene observations, who was injured, what was said on arrival.",
  },
  {
    id: "photo-lineup-packet",
    title: "Photo Lineup Packet",
    source: "SCSO Investigations",
    status: "known-to-exist",
    priority: "critical",
    description: "2/23/23 at 16:30, Spanish-language only. Image #2 selected. Neil v. Biggers challenge basis.",
  },
  {
    id: "probable-cause-affidavit",
    title: "Probable Cause Affidavit",
    source: "SCSO / SA18",
    status: "known-to-exist",
    priority: "high",
    description: "Basis for arrest warrant #23912CFA. What facts did officer swear to?",
  },
  {
    id: "medical-records-driver",
    title: "Medical Records — Driver (Guzman)",
    source: "Hospital (facility unknown)",
    status: "not-obtained",
    priority: "high",
    description: "Injuries documented: broken nose, concussion, cuts, contusions, fractured upper jawbone.",
  },
  {
    id: "medical-records-marquis",
    title: "Medical Records — Marquis",
    source: "Seminole County Jail / Hospital",
    status: "not-obtained",
    priority: "high",
    description: "Injuries from driver's takedown and umbrella assault. Currently undocumented in prosecution narrative.",
  },
  {
    id: "sworn-statement",
    title: "Marquis Sworn Statement",
    source: "Marquis Anthony Delcampo",
    status: "obtained",
    priority: "critical",
    description: "Notarized 11/24/24 by Christina McElyea (HH 131329). Contains complete defendant account of events.",
    blockchainHash: "0xa7c3e9f2d81b4506c3d2e7f190ab38c6d5e4f712839a0b1c2d3e4f56a7b8c9d0",
    anchoredBlock: 12,
  },
  {
    id: "trial-transcript",
    title: "Trial Transcript",
    source: "Clerk of Court, 18th Judicial Circuit",
    status: "not-obtained",
    priority: "critical",
    description: "Shows what evidence was presented, how jury was instructed, and what arguments were made.",
  },
  {
    id: "sentencing-transcript",
    title: "Sentencing Transcript",
    source: "Clerk of Court",
    status: "not-obtained",
    priority: "critical",
    description: "Shows what findings were made on PRR/HFO record. Critical for illegal sentence challenge.",
  },
  {
    id: "judgment-sentence",
    title: "Judgment & Sentence (J&S)",
    source: "Clerk of Court",
    status: "not-obtained",
    priority: "critical",
    description: "Official court document showing complete sentence structure and enhancement findings.",
  },
  {
    id: "sentencing-scoresheet",
    title: "Sentencing Scoresheet",
    source: "Trial Court File",
    status: "not-obtained",
    priority: "high",
    description: "Criminal Punishment Code calculation. Required to verify PRR/HFO qualifications.",
  },
  {
    id: "traffic-cameras",
    title: "Traffic Camera Footage",
    source: "FDOT / Seminole County",
    status: "likely-lost",
    priority: "medium",
    description: "SR 436 corridor cameras. Retention ~30-72 hours — likely overwritten by now. Would show driver's erratic driving.",
  },
];

// ── Legal Strategy & Motions ────────────────────────────────────────────────

export interface LegalIssue {
  id: string;
  rank: number;
  title: string;
  statuteRule: string;
  strength: 1 | 2 | 3 | 4 | 5;
  vehicle: string;
  deadline: string;
  description: string;
  status: "ready-to-file" | "drafting" | "pending" | "filed";
}

export const LEGAL_ISSUES: LegalIssue[] = [
  {
    id: "illegal-sentence",
    rank: 1,
    title: "Illegal Sentence (20 yrs > 15-yr max)",
    statuteRule: "Rule 3.800(a); F.S. § 775.082(3)(d)",
    strength: 5,
    vehicle: "Rule 3.800(a) Motion",
    deadline: "NO TIME LIMIT",
    description: "Sentence of 20 years exceeds the 15-year statutory maximum for a second-degree felony. Can be challenged at any time — no filing deadline.",
    status: "ready-to-file",
  },
  {
    id: "iac-syg",
    rank: 2,
    title: "IAC: No Stand Your Ground Hearing Requested",
    statuteRule: "Rule 3.850; Strickland; F.S. § 776.032(4); Dennis v. State",
    strength: 5,
    vehicle: "Rule 3.850 Motion",
    deadline: "~February 2028 (2-year window)",
    description: "Trial counsel failed to request Stand Your Ground immunity hearing. F.S. § 776.032(4) provides pretrial immunity standard. Occupied vehicle doctrine (F.S. § 776.013(1)(b)) creates statutory presumption of reasonable fear.",
    status: "ready-to-file",
  },
  {
    id: "brady-uber",
    rank: 3,
    title: "Brady Violation: Full Uber Telemetry Withheld",
    statuteRule: "Brady v. Maryland; Rule 3.850",
    strength: 4,
    vehicle: "Rule 3.850 Motion / Brady Motion",
    deadline: "~February 2028",
    description: "Full Uber trip telemetry (GPS, route deviations, speed data) was not disclosed to defense. This data would prove the ride was not concluded and the driver stopped at the wrong location.",
    status: "drafting",
  },
  {
    id: "direct-appeal",
    rank: 4,
    title: "Direct Appeal (if timely filed)",
    statuteRule: "Fla. R. App. P. 9.110-9.140",
    strength: 4,
    vehicle: "Notice of Appeal to 5th DCA",
    deadline: "MAY 10, 2026",
    description: "Issues: sufficiency of evidence, jury instruction error, evidentiary rulings, sentencing error. Must verify if Notice of Appeal was timely filed.",
    status: "pending",
  },
  {
    id: "iac-self-defense",
    rank: 5,
    title: "IAC: Inadequate Self-Defense Instruction/Argument",
    statuteRule: "Strickland; Standard Jury Instructions 3.6(f)/(g)",
    strength: 3,
    vehicle: "Rule 3.850 / Direct Appeal",
    deadline: "~February 2028",
    description: "Trial counsel failed to properly argue self-defense theory or request appropriate jury instructions regarding initial aggressor and right to defend in occupied vehicle.",
    status: "drafting",
  },
  {
    id: "photo-lineup",
    rank: 6,
    title: "Photo Lineup Suggestiveness",
    statuteRule: "Neil v. Biggers; Manson factors; Rule 3.850",
    strength: 3,
    vehicle: "Rule 3.850 / Motion to Suppress ID",
    deadline: "~February 2028",
    description: "Spanish-only lineup conducted less than 34 hours after incident. Potential suggestiveness and translation issues under Neil v. Biggers factors.",
    status: "drafting",
  },
  {
    id: "prosecutorial-misconduct",
    rank: 7,
    title: "Prosecutorial Misconduct — Selective Video",
    statuteRule: "Brady; Rule 3.850",
    strength: 3,
    vehicle: "Rule 3.850 / Direct Appeal",
    deadline: "~February 2028",
    description: "Jury shown only fragments of video showing Marquis punching — not the full sequence showing driver initiating physical contact and arming with umbrella.",
    status: "drafting",
  },
  {
    id: "prr-window",
    rank: 8,
    title: "PRR 3-Year Window Verification",
    statuteRule: "F.S. § 775.082(9); Rule 3.800(a)",
    strength: 3,
    vehicle: "Rule 3.800(a) Motion",
    deadline: "NO TIME LIMIT",
    description: "Must verify that the qualifying prior conviction falls within the 3-year window required for PRR designation. DOC release records needed.",
    status: "pending",
  },
  {
    id: "hfo-enhancement",
    rank: 9,
    title: "HFO Enhancement — Qualifying Priors",
    statuteRule: "F.S. § 775.084(1)(a); Rule 3.800(a)",
    strength: 3,
    vehicle: "Rule 3.800(a) Motion",
    deadline: "NO TIME LIMIT",
    description: "Must verify that prior convictions properly qualify for Habitual Felony Offender enhancement under F.S. § 775.084(1)(a).",
    status: "pending",
  },
  {
    id: "sufficiency-evidence",
    rank: 10,
    title: "Sufficiency of Evidence (Jackson v. Virginia)",
    statuteRule: "Jackson v. Virginia; Direct Appeal Standard",
    strength: 2,
    vehicle: "Direct Appeal / Rule 3.850",
    deadline: "~February 2028",
    description: "Challenge whether evidence was sufficient to prove aggravated battery beyond reasonable doubt, given self-defense evidence.",
    status: "drafting",
  },
];

// ── Blockchain Anchoring Status ─────────────────────────────────────────────

export interface BlockchainAnchor {
  id: string;
  documentTitle: string;
  contentHash: string;
  anchoredAt: string;
  blockNumber: number;
  merkleRoot: string;
  verified: boolean;
  palletUsed: string;
}

export const BLOCKCHAIN_ANCHORS: BlockchainAnchor[] = [
  {
    id: "ba-1",
    documentTitle: "Sworn Statement — Marquis Delcampo",
    contentHash: "0xa7c3e9f2d81b4506c3d2e7f190ab38c6d5e4f712839a0b1c2d3e4f56a7b8c9d0",
    anchoredAt: "2026-04-03T14:22:10Z",
    blockNumber: 12,
    merkleRoot: "0x9f3c88a21b7d45e290c1f384d6e7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3a4e1",
    verified: true,
    palletUsed: "pallet-evidence",
  },
  {
    id: "ba-2",
    documentTitle: "Forensic Deep Dive Analysis",
    contentHash: "0xb8d4f0a3e92c5617d4e3f8a201bc49d7e6f5a823940b2c3d4e5f67a8b9c0d1e2",
    anchoredAt: "2026-04-03T14:25:30Z",
    blockNumber: 14,
    merkleRoot: "0x7b21d6e94ca538f1b0d2e3c4a5b6c7d8e9f001a2b3c4d5e6f7a8b9c0d1e2c8d0",
    verified: true,
    palletUsed: "pallet-documents",
  },
  {
    id: "ba-3",
    documentTitle: "Evidence Matrix — Full Inventory",
    contentHash: "0xc9e5a1b4f03d6728e5f4a9b312cd50e8f7a6b934a51c3d4e5f678a9b0c1d2e3f",
    anchoredAt: "2026-04-03T14:28:15Z",
    blockNumber: 15,
    merkleRoot: "0x5d19c7f83ba427e09e1d2c3b4a5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
    verified: true,
    palletUsed: "pallet-evidence",
  },
  {
    id: "ba-4",
    documentTitle: "Incident Timeline — Chronological Reconstruction",
    contentHash: "0xd0f6b2c5a14e7839f6a5b0c423de61f9a8b7ca45b62d4e5f6a789b0c1d2e3f4a",
    anchoredAt: "2026-04-05T09:12:45Z",
    blockNumber: 47,
    merkleRoot: "0x3c08b5f72a9316d8e0d1c2a3b495a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2a3",
    verified: true,
    palletUsed: "pallet-documents",
  },
  {
    id: "ba-5",
    documentTitle: "Contradiction Analysis — 10 Discrepancies",
    contentHash: "0xe1a7c3d6b25f8940a7b6c1d534ef72a0b9c8db56c73e5f6a7890b1c2d3e4f5a6",
    anchoredAt: "2026-04-05T09:15:20Z",
    blockNumber: 48,
    merkleRoot: "0x2b07a4e61982056d7f0c1b2a3b4a5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1b2",
    verified: true,
    palletUsed: "pallet-audit",
  },
  {
    id: "ba-6",
    documentTitle: "Legal Strategy & Motion Index",
    contentHash: "0xf2b8d4e7c36a9051b8c7d2e645fa83b1c0d9ec67d84f6a7b8901c2d3e4f5a6b7",
    anchoredAt: "2026-04-07T11:30:00Z",
    blockNumber: 102,
    merkleRoot: "0x1a06930508710458e6f0b1a2a3b4a5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0a1b2",
    verified: true,
    palletUsed: "pallet-documents",
  },
  {
    id: "ba-7",
    documentTitle: "Photo Lineup Challenge — Neil v. Biggers Analysis",
    contentHash: "0xa3c9e5f8d47b0162c9d8e3f756ab94c2d1e0fd78e95a7b8c9012d3e4f5a6b7c8",
    anchoredAt: "2026-04-08T16:45:00Z",
    blockNumber: 189,
    merkleRoot: "0x0905820407600347d5e0a1b2a3b4a5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
    verified: true,
    palletUsed: "pallet-evidence",
  },
  {
    id: "ba-8",
    documentTitle: "Uber Liability Civil Analysis — 8-Count Complaint",
    contentHash: "0xb4d0f6a9e58c1273d0e9f4a867bc05d3e2f1ae89f06b8c9d0123e4f5a6b7c8d9",
    anchoredAt: "2026-04-09T10:00:00Z",
    blockNumber: 231,
    merkleRoot: "0x8804710306500236c4d0a1b2a3b4a5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
    verified: true,
    palletUsed: "pallet-documents",
  },
];

// ── Stats Summary ───────────────────────────────────────────────────────────

export const CASE_STATS = {
  daysIncarcerated: Math.floor((Date.now() - new Date("2023-05-05").getTime()) / 86400000),
  daysToAppealDeadline: Math.max(0, Math.floor((new Date("2026-05-10").getTime() - Date.now()) / 86400000)),
  evidenceObtained: EVIDENCE_MATRIX.filter(e => e.status === "obtained").length,
  evidenceTotal: EVIDENCE_MATRIX.length,
  contradictionsFound: CASE_CONTRADICTIONS.length,
  criticalContradictions: CASE_CONTRADICTIONS.filter(c => c.severity === "critical").length,
  legalIssuesIdentified: LEGAL_ISSUES.length,
  motionsReadyToFile: LEGAL_ISSUES.filter(i => i.status === "ready-to-file").length,
  documentsAnchored: BLOCKCHAIN_ANCHORS.length,
  blocksVerified: BLOCKCHAIN_ANCHORS.filter(a => a.verified).length,
};
