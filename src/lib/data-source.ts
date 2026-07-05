import ky from "ky"
import { z } from "zod"
import {
  type DataSource,
  type EventItem,
  EventItemSchema,
  type LeagueData,
  LeagueDataSchema,
  type Member,
  MemberSchema,
  type TournamentItem,
  TournamentItemSchema,
} from "../config"
import { type CsvRow, parseCsv } from "./csv"
import { compareDateStrings, formatDisplayDate } from "./date"
import { assertNever, DataSourceLoadError } from "./errors"

export async function loadEvents(
  source: DataSource | undefined,
  inlineItems: readonly EventItem[],
  showPast: boolean,
): Promise<readonly EventItem[]> {
  const remoteItems = source
    ? await loadSource<EventItem>(source, z.array(EventItemSchema), rowsToEvents)
    : []
  const allItems = [...inlineItems, ...remoteItems]
  return allItems
    .filter((item) => showPast || !formatDisplayDate(item.date).isPast)
    .sort((left, right) => compareDateStrings(left.date, right.date))
}

export async function loadTournaments(
  source: DataSource | undefined,
  inlineItems: readonly TournamentItem[],
): Promise<readonly TournamentItem[]> {
  const remoteItems = source
    ? await loadSource<TournamentItem>(source, z.array(TournamentItemSchema), rowsToTournaments)
    : []
  return [...inlineItems, ...remoteItems].sort((left, right) =>
    compareDateStrings(left.date, right.date),
  )
}

export async function loadMembers(
  source: DataSource | undefined,
  inlineItems: readonly Member[],
): Promise<readonly Member[]> {
  const remoteItems = source
    ? await loadSource<Member>(source, z.array(MemberSchema), rowsToMembers)
    : []
  return [...inlineItems, ...remoteItems].sort((left, right) => {
    const leftName = `${left.lastName} ${left.firstName}`.toLowerCase()
    const rightName = `${right.lastName} ${right.firstName}`.toLowerCase()
    return leftName.localeCompare(rightName)
  })
}

export async function loadLeagueData(
  source: DataSource | undefined,
  inlineData: LeagueData,
): Promise<LeagueData> {
  if (!source) {
    return inlineData
  }

  return loadJson(source, LeagueDataSchema)
}

async function loadSource<T>(
  source: DataSource,
  jsonSchema: z.ZodType<readonly T[]>,
  csvMapper: (rows: readonly CsvRow[]) => readonly T[],
): Promise<readonly T[]> {
  switch (source.kind) {
    case "jsonUrl":
      return loadJson(source, jsonSchema)
    case "googleSheetsCsv": {
      const csv = await loadText(source.url)
      return csvMapper(parseCsv(csv))
    }
    default:
      return assertNever(source)
  }
}

async function loadJson<T>(source: DataSource, schema: z.ZodType<T>): Promise<T> {
  try {
    const payload: unknown = await ky.get(source.url).json()
    return schema.parse(payload)
  } catch (error) {
    if (error instanceof Error) {
      throw new DataSourceLoadError(source.url, { cause: error })
    }
    throw new DataSourceLoadError(source.url)
  }
}

async function loadText(url: string): Promise<string> {
  try {
    return await ky.get(url).text()
  } catch (error) {
    if (error instanceof Error) {
      throw new DataSourceLoadError(url, { cause: error })
    }
    throw new DataSourceLoadError(url)
  }
}

function rowsToEvents(rows: readonly CsvRow[]): readonly EventItem[] {
  const items: EventItem[] = []

  for (const row of rows) {
    if (isInactive(row)) {
      continue
    }
    const title = row["title"]?.trim() ?? ""
    const date = row["date"]?.trim() ?? ""
    if (title.length === 0 || date.length === 0) {
      continue
    }

    const description = row["description"]?.trim()
    const url = row["url"]?.trim()
    items.push(
      EventItemSchema.parse({
        title,
        date,
        ...(description ? { description } : {}),
        ...(url ? { url } : {}),
      }),
    )
  }

  return items
}

function rowsToTournaments(rows: readonly CsvRow[]): readonly TournamentItem[] {
  const items: TournamentItem[] = []

  for (const row of rows) {
    if (isInactive(row)) {
      continue
    }
    const name = row["name"]?.trim() ?? row["title"]?.trim() ?? ""
    const date = row["date"]?.trim() ?? ""
    if (name.length === 0 || date.length === 0) {
      continue
    }

    const location = row["location"]?.trim()
    const tier = row["tier"]?.trim()
    const url = row["url"]?.trim()
    items.push(
      TournamentItemSchema.parse({
        name,
        date,
        ...(location ? { location } : {}),
        ...(tier ? { tier } : {}),
        ...(url ? { url } : {}),
      }),
    )
  }

  return items
}

function rowsToMembers(rows: readonly CsvRow[]): readonly Member[] {
  const items: Member[] = []

  for (const row of rows) {
    if (isInactive(row)) {
      continue
    }
    const firstName = row["firstname"]?.trim() ?? row["first name"]?.trim() ?? ""
    const lastName = row["lastname"]?.trim() ?? row["last name"]?.trim() ?? ""
    if (firstName.length === 0 || lastName.length === 0) {
      continue
    }

    const pdga = row["pdga"]?.trim()
    const special = row["special"]?.trim()
    const yearJoined = optionalNumber(row["yearjoined"] ?? row["year joined"])
    items.push(
      MemberSchema.parse({
        firstName,
        lastName,
        ...(yearJoined ? { yearJoined } : {}),
        ...(pdga ? { pdga } : {}),
        ...(special ? { special } : {}),
      }),
    )
  }

  return items
}

function isInactive(row: CsvRow): boolean {
  return (row["active"] ?? "").trim().toUpperCase() === "FALSE"
}

function optionalNumber(value: string | undefined): number | undefined {
  const parsed = value ? Number(value) : Number.NaN
  return Number.isFinite(parsed) ? parsed : undefined
}
