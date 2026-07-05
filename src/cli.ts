#!/usr/bin/env node
import { existsSync } from "node:fs"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { stdin as input, stdout as output } from "node:process"
import { createInterface } from "node:readline/promises"
import { pathToFileURL } from "node:url"
import { type ClubConfigInput, ClubConfigSchema } from "./config"

type Answers = {
  readonly clubName: string
  readonly tagline: string
  readonly location: string
  readonly eventsSheetUrl: string
  readonly tournamentsSheetUrl: string
  readonly paypalCheckoutUrl: string
  readonly paypalEmail: string
  readonly paypalAmount: number | null
  readonly memberDirectory: boolean
  readonly pdgaLinks: boolean
  readonly memberGate: boolean
  readonly memberPassword: string
  readonly memberCodePhrase: string
}

export async function runCli(argv: readonly string[]): Promise<void> {
  const command = argv.at(2) ?? "setup"
  if (command !== "setup") {
    printHelp()
    return
  }

  const answers = await askSetupQuestions()
  const config = buildConfig(answers)
  const parsed = ClubConfigSchema.parse(config)
  const destination = join(process.cwd(), "open-disc-golf-club.config.json")

  if (existsSync(destination)) {
    const overwrite = await askYesNo(`Overwrite ${destination}?`, false)
    if (!overwrite) {
      console.log("Setup cancelled. Existing config was left untouched.")
      return
    }
  }

  await writeFile(destination, `${JSON.stringify(parsed, null, 2)}\n`, "utf8")
  console.log(`Wrote ${destination}`)
  console.log("")
  console.log("Embed this on your club site:")
  console.log("")
  console.log(
    '<script type="module" src="https://cdn.jsdelivr.net/gh/kgbrah/OpenDiscGolfClub@main/dist/index.mjs"></script>',
  )
  console.log(
    '<open-disc-golf-club config-url="/open-disc-golf-club.config.json"></open-disc-golf-club>',
  )
  console.log("")
  printIntegrationNotes(answers)
}

async function askSetupQuestions(): Promise<Answers> {
  const rl = createInterface({ input, output })
  try {
    const clubName = await askTextWithInterface(rl, "Club name", "Disc Golf Club")
    const location = await askTextWithInterface(rl, "Club location", "")
    const tagline = await askTextWithInterface(rl, "Short tagline", "")
    const eventsSheetUrl = (await askYesNoWithInterface(rl, "Use Google Sheets for events?", false))
      ? await askTextWithInterface(rl, "Events CSV URL", "")
      : ""
    const tournamentsSheetUrl = (await askYesNoWithInterface(
      rl,
      "Use Google Sheets for tournaments?",
      false,
    ))
      ? await askTextWithInterface(rl, "Tournaments CSV URL", "")
      : ""
    const usePaypal = await askYesNoWithInterface(rl, "Enable PayPal membership checkout?", false)
    const paypalCheckoutUrl = usePaypal
      ? await askTextWithInterface(rl, "PayPal hosted checkout URL, if you have one", "")
      : ""
    const paypalEmail =
      usePaypal && paypalCheckoutUrl.length === 0
        ? await askTextWithInterface(rl, "PayPal business email", "")
        : ""
    const paypalAmount =
      usePaypal && paypalCheckoutUrl.length === 0
        ? await askNumberWithInterface(rl, "Membership amount", 15)
        : null
    const memberDirectory = await askYesNoWithInterface(rl, "Enable member directory?", false)
    const pdgaLinks = memberDirectory
      ? await askYesNoWithInterface(rl, "Enable PDGA profile links?", true)
      : false
    const memberGate = memberDirectory
      ? await askYesNoWithInterface(rl, "Add a lightweight member password gate?", false)
      : false
    const memberPassword = memberGate
      ? await askTextWithInterface(rl, "Member password", "change-me")
      : ""
    const memberCodePhrase = memberGate
      ? await askTextWithInterface(rl, "Optional code phrase", "")
      : ""

    return {
      clubName,
      tagline,
      location,
      eventsSheetUrl,
      tournamentsSheetUrl,
      paypalCheckoutUrl,
      paypalEmail,
      paypalAmount,
      memberDirectory,
      pdgaLinks,
      memberGate,
      memberPassword,
      memberCodePhrase,
    }
  } finally {
    rl.close()
  }
}

async function askTextWithInterface(
  rl: ReturnType<typeof createInterface>,
  question: string,
  fallback: string,
): Promise<string> {
  const suffix = fallback ? ` [${fallback}]` : ""
  const answer = (await rl.question(`${question}${suffix}: `)).trim()
  return answer.length > 0 ? answer : fallback
}

async function askYesNoWithInterface(
  rl: ReturnType<typeof createInterface>,
  question: string,
  fallback: boolean,
): Promise<boolean> {
  const suffix = fallback ? " [Y/n]" : " [y/N]"
  const answer = (await rl.question(`${question}${suffix}: `)).trim().toLowerCase()
  if (answer.length === 0) {
    return fallback
  }
  return answer === "y" || answer === "yes"
}

async function askNumberWithInterface(
  rl: ReturnType<typeof createInterface>,
  question: string,
  fallback: number,
): Promise<number> {
  const answer = await askTextWithInterface(rl, question, String(fallback))
  const parsed = Number(answer)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

async function askYesNo(question: string, fallback: boolean): Promise<boolean> {
  const rl = createInterface({ input, output })
  try {
    return await askYesNoWithInterface(rl, question, fallback)
  } finally {
    rl.close()
  }
}

function buildConfig(answers: Answers): ClubConfigInput {
  return {
    club: {
      name: answers.clubName,
      ...(answers.tagline ? { tagline: answers.tagline } : {}),
      ...(answers.location ? { location: answers.location } : {}),
    },
    stats: [],
    courses: {
      title: "Courses",
      groups: [],
    },
    events: {
      title: "Upcoming Events",
      ...(answers.eventsSheetUrl
        ? { source: { kind: "googleSheetsCsv", url: answers.eventsSheetUrl } }
        : { items: [] }),
    },
    tournaments: {
      title: "Area Tournaments",
      ...(answers.tournamentsSheetUrl
        ? { source: { kind: "googleSheetsCsv", url: answers.tournamentsSheetUrl } }
        : { items: [] }),
    },
    membership: {
      title: "Become a Member",
      benefits: [],
      ...(paymentConfig(answers) ? { payment: paymentConfig(answers) } : {}),
    },
    contact: {
      title: "Get in Touch",
      items: [],
    },
    members: {
      title: "Member Directory",
      items: [],
      pdgaLinks: answers.pdgaLinks,
      ...(answers.memberGate
        ? {
            gate: {
              password: answers.memberPassword,
              ...(answers.memberCodePhrase ? { codePhrase: answers.memberCodePhrase } : {}),
            },
          }
        : {}),
    },
  }
}

function paymentConfig(
  answers: Answers,
): ClubConfigInput["membership"] extends infer Membership
  ? Membership extends { readonly payment?: infer Payment }
    ? Payment
    : never
  : never {
  if (answers.paypalCheckoutUrl) {
    return { provider: "paypal", checkoutUrl: answers.paypalCheckoutUrl }
  }

  if (answers.paypalEmail && answers.paypalAmount) {
    return {
      provider: "paypal",
      businessEmail: answers.paypalEmail,
      amount: answers.paypalAmount,
      itemName: `${answers.clubName} Membership`,
    }
  }

  return undefined
}

function printHelp(): void {
  console.log("Usage: open-disc-golf-club setup")
}

function printIntegrationNotes(answers: Answers): void {
  console.log("Integration guides:")
  if (answers.eventsSheetUrl || answers.tournamentsSheetUrl) {
    console.log("- Google Sheets: docs/integrations/google-sheets.md")
  }
  if (answers.paypalCheckoutUrl || answers.paypalEmail) {
    console.log("- PayPal: docs/integrations/paypal.md")
  }
  console.log("- Course actions: docs/integrations/course-actions.md")
  if (answers.pdgaLinks) {
    console.log("- PDGA links: docs/integrations/pdga.md")
  }
  if (answers.memberGate) {
    console.log("- Member gate: docs/integrations/member-gate.md")
  }
}

const entrypoint = process.argv.at(1)
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  runCli(process.argv).catch((error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message)
      process.exitCode = 1
      return
    }
    console.error("Unknown setup failure")
    process.exitCode = 1
  })
}
