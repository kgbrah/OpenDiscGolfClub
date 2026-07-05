const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const MONTH_INDEX: Readonly<Record<string, number>> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

export type DisplayDate = {
  readonly day: string
  readonly month: string
  readonly year: string
  readonly isPast: boolean
  readonly isTbd: boolean
  readonly sortTime: number
}

export function formatDisplayDate(input: string): DisplayDate {
  const parsed = parseClubDate(input)
  if (!parsed) {
    return tbdDate()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const month = MONTH_LABELS[parsed.getMonth()] ?? ""

  return {
    day: String(parsed.getDate()),
    month,
    year: String(parsed.getFullYear()),
    isPast: parsed < today,
    isTbd: false,
    sortTime: parsed.getTime(),
  }
}

export function compareDateStrings(left: string, right: string): number {
  return formatDisplayDate(left).sortTime - formatDisplayDate(right).sortTime
}

function tbdDate(): DisplayDate {
  return {
    day: "TBD",
    month: "",
    year: "",
    isPast: false,
    isTbd: true,
    sortTime: Number.MAX_SAFE_INTEGER,
  }
}

function parseClubDate(input: string): Date | null {
  const trimmed = input.trim()
  if (trimmed.length === 0 || trimmed.toUpperCase() === "TBD") {
    return null
  }

  return (
    parseYearMonthDay(trimmed) ??
    parseMonthDayYear(trimmed) ??
    parseShortSlashDate(trimmed) ??
    parseNativeDate(trimmed)
  )
}

function parseYearMonthDay(input: string): Date | null {
  const match = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return validDate(year, month - 1, day)
}

function parseMonthDayYear(input: string): Date | null {
  const match = input.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})?/)
  if (!match) {
    return null
  }

  const monthName = match[1]?.toLowerCase() ?? ""
  const month = MONTH_INDEX[monthName]
  if (month === undefined) {
    return null
  }

  const day = Number(match[2])
  const year = match[3] ? Number(match[3]) : new Date().getFullYear()
  return validDate(year, month, day)
}

function parseShortSlashDate(input: string): Date | null {
  const match = input.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/)
  if (!match) {
    return null
  }

  const month = Number(match[1])
  const day = Number(match[2])
  const rawYear = match[3]
  const currentYear = new Date().getFullYear()
  const year = rawYear ? expandYear(Number(rawYear)) : currentYear
  const candidate = validDate(year, month - 1, day)
  if (!candidate || rawYear) {
    return candidate
  }

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  return candidate < sixtyDaysAgo ? validDate(year + 1, month - 1, day) : candidate
}

function parseNativeDate(input: string): Date | null {
  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function validDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    Number.isNaN(date.getTime())
  ) {
    return null
  }

  return date
}

function expandYear(year: number): number {
  if (year >= 100) {
    return year
  }

  return year < 50 ? 2000 + year : 1900 + year
}
