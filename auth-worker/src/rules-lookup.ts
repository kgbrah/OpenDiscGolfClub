// Club-helper notes for rules questions. Original wording, not the PDGA rulebook.
// Section links point at the public 2026 rules. The card or TD still makes the call.

export interface RuleNote {
  id: string;
  title: string;
  href: string;
  keywords: readonly string[];
  note: string;
}

export const PDGA_RULES_HOME = "https://www.pdga.com/rules/official-rules-disc-golf";

const RULES_BASE = "https://www.pdga.com/rules/official-rules-disc-golf";

export const RULE_NOTES: readonly RuleNote[] = [
  {
    id: "ob",
    title: "Out of bounds",
    href: RULES_BASE + "/806",
    keywords: ["ob", "o.b", "out of bounds", "out-of-bounds", "water", "pond", "creek", "lake", "rope", "painted", "paint", "fence", "hazard"],
    note: "Judge the disc where it came to rest, not where it flew over. If that spot is out, the throw costs one penalty stroke and the next lie is the previous lie or the drop zone the course marked. A photo can show a disc next to a line. It cannot see a line outside the frame, or a local note on the tee sign.",
  },
  {
    id: "lost",
    title: "Lost disc",
    href: RULES_BASE + "/805",
    keywords: ["lost", "can't find", "cannot find", "cant find", "missing disc", "search"],
    note: "The group gets a short search. If the disc stays missing, it is abandoned: a penalty stroke, and the next throw comes from the previous lie unless a drop zone is marked. Agree the search is over before anyone throws the next shot.",
  },
  {
    id: "mando",
    title: "Mandatory",
    href: RULES_BASE + "/804",
    keywords: ["mando", "mandatory", "double mando"],
    note: "A mandatory means the disc has to pass the marked side. Missing it is a penalty, and play continues from the drop zone or the previous lie, whichever the hole marks. An arrow in a photo is a clue. The card still has to agree which side the disc actually went.",
  },
  {
    id: "mark",
    title: "Marking the lie",
    href: RULES_BASE + "/805",
    keywords: ["mark", "mini", "marker", "lie", "where it landed"],
    note: "The lie is the spot the thrown disc came to rest. Mark it with a mini before you lift the disc. The next throw is played from behind that mark.",
  },
  {
    id: "stance",
    title: "Stance and putting",
    href: RULES_BASE + "/802",
    keywords: ["foot fault", "footfault", "putting", "putt", "circle", "stance", "step", "jump putt"],
    note: "Inside about 10 meters of the basket, a supporting point stays behind the mark until the disc is at rest. Farther out, you may follow through after the disc is released. A still frame cannot prove a foot fault by itself. Say what the frame shows and what it cannot show.",
  },
  {
    id: "relief",
    title: "Relief",
    href: RULES_BASE + "/803",
    keywords: ["relief", "casual", "unplayable", "tree", "stuck", "dangerous", "puddle"],
    note: "Casual water, a dangerous lie, or an obstacle the rules name can move to the nearest playable lie, no closer to the hole, with no penalty. A tree or another course object in the way is not a free drop. Declaring a lie unplayable costs a penalty stroke. The old two-meter rule is not in the current rules. A disc up a tree is still in play where it is, unless it is out of bounds.",
  },
  {
    id: "order",
    title: "Who throws next",
    href: RULES_BASE + "/802",
    keywords: ["away", "order", "honors", "who throws", "tee order"],
    note: "The player farthest from the basket throws next after the tee shots. Honors on the next tee follow the rules for who won the previous hole. If the card is unsure, play a provisional and sort it out before anyone tees the next hole.",
  },
  {
    id: "provisional",
    title: "Provisional",
    href: RULES_BASE + "/809",
    keywords: ["provisional", "second throw", "not sure"],
    note: "If the group is unsure of a ruling, throw a second provisional shot and say which one you are keeping before anyone picks a disc up. The group, or the TD if the group cannot agree, decides which throw counts.",
  },
  {
    id: "misplay",
    title: "Misplay",
    href: RULES_BASE + "/811",
    keywords: ["misplay", "wrong basket", "wrong hole", "wrong target", "wrong lie"],
    note: "Playing from the wrong lie or at the wrong target is a misplay. Correct it when the group notices, under the misplay rule, instead of guessing a score. A photo of the wrong basket is a reason to stop and fix it, not a finished hole.",
  },
  {
    id: "practice",
    title: "Practice throws",
    href: RULES_BASE + "/812",
    keywords: ["practice throw", "extra throw", "warm up", "warmup"],
    note: "A practice throw during the round can be a courtesy penalty. Don't throw extra shots at the basket while the card is playing the hole.",
  },
  {
    id: "complete",
    title: "Holing out",
    href: RULES_BASE + "/807",
    keywords: ["in the basket", "holed", "spit out", "spitout", "hanging", "chains", "complete", "ace"],
    note: "The hole is complete when the disc comes to rest supported by the tray or the chains. Sitting on top, or bouncing out, is not in. A photo of a disc in the basket is strong. A photo of a disc on the top band is not holed out.",
  },
];

const IMAGE_CORE = ["ob", "mark", "mando", "relief"] as const;

function haystack(message: string): string {
  return message.toLowerCase().replace(/[^a-z0-9.]+/g, " ");
}

function matches(note: RuleNote, text: string): boolean {
  return note.keywords.some((word) => text.includes(word));
}

/** Notes to inject. Empty when the message is not a rules question and there is no photo. */
export function rulesForQuestion(message: string, hasImage: boolean): RuleNote[] {
  const text = haystack(message);
  const picked: RuleNote[] = [];
  const seen = new Set<string>();
  const add = (note: RuleNote | undefined) => {
    if (!note || seen.has(note.id) || picked.length >= 5) return;
    seen.add(note.id);
    picked.push(note);
  };
  for (const note of RULE_NOTES) {
    if (matches(note, text)) add(note);
  }
  if (hasImage) {
    for (const id of IMAGE_CORE) add(RULE_NOTES.find((note) => note.id === id));
  }
  return picked;
}

export function formatRulesContext(notes: readonly RuleNote[]): string {
  if (!notes.length) return "";
  const lines = [
    "Rules helper notes (use these for a rules question; they outrank general knowledge):",
    "This is a club helper, not a tournament director and not the official rulebook. Tell the player the card agrees the facts, and the TD decides if the card cannot. Do not quote the rulebook at length. Name the section and give the link.",
    "Official rules: " + PDGA_RULES_HOME,
  ];
  for (const note of notes) {
    lines.push("- " + note.title + " (" + note.href + "): " + note.note);
  }
  return lines.join("\n");
}

export function formatPhotoContext(descriptions: readonly string[], mediaKind: string): string {
  const clean = descriptions.map((line) => line.trim()).filter(Boolean).slice(0, 3);
  const lines = ["Attached media for a rules question:"];
  if (mediaKind === "video") {
    lines.push("The player sent a short video. You are looking at still frames from it, not the motion. Say that you cannot judge a foot fault, a spit-out, or the flight from a still.");
  } else if (clean.length) {
    lines.push("The player sent a photo. Describe only what the notes below say is visible.");
  }
  if (!clean.length) {
    lines.push("The attachment could not be read. Ask them to describe the lie, the line, and where the disc stopped.");
    return lines.join("\n");
  }
  lines.push("What is visible (a description, not a ruling):");
  clean.forEach((line, index) => lines.push(String(index + 1) + ". " + line.slice(0, 700)));
  return lines.join("\n");
}
