import { z } from "zod"

const HttpUrlSchema = z.string().url()

export const DataSourceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("jsonUrl"),
    url: HttpUrlSchema,
  }),
  z.object({
    kind: z.literal("googleSheetsCsv"),
    url: HttpUrlSchema,
  }),
])

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const StatSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

export const CourseSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  holes: z.number().int().positive().optional(),
  rating: z.string().min(1).optional(),
  time: z.string().min(1).optional(),
  difficulty: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  imageUrl: HttpUrlSchema.optional(),
  udiscUrl: HttpUrlSchema.optional(),
  mapUrl: HttpUrlSchema.optional(),
  youtubeUrl: HttpUrlSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
})

export const CourseGroupSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  courses: z.array(CourseSchema).default([]),
})

export const CoursesSectionSchema = z.object({
  title: z.string().min(1).default("Courses"),
  groups: z.array(CourseGroupSchema).default([]),
})

export const EventItemSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  description: z.string().optional(),
  url: HttpUrlSchema.optional(),
})

export const EventsSectionSchema = z.object({
  title: z.string().min(1).default("Upcoming Events"),
  source: DataSourceSchema.optional(),
  items: z.array(EventItemSchema).default([]),
  maxVisible: z.number().int().positive().default(5),
  showPast: z.boolean().default(false),
})

export const TournamentItemSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  location: z.string().optional(),
  tier: z.string().optional(),
  url: HttpUrlSchema.optional(),
})

export const TournamentsSectionSchema = z.object({
  title: z.string().min(1).default("Area Tournaments"),
  source: DataSourceSchema.optional(),
  items: z.array(TournamentItemSchema).default([]),
  maxVisible: z.number().int().positive().default(5),
  externalUrl: HttpUrlSchema.optional(),
})

export const PaymentSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("paypal"),
    checkoutUrl: HttpUrlSchema.optional(),
    businessEmail: z.string().email().optional(),
    amount: z.number().positive().optional(),
    itemName: z.string().min(1).optional(),
  }),
  z.object({
    provider: z.literal("external"),
    label: z.string().min(1).default("Join Today"),
    url: HttpUrlSchema,
  }),
])

export const MembershipSectionSchema = z.object({
  title: z.string().min(1).default("Become a Member"),
  description: z.string().min(1).optional(),
  priceLabel: z.string().min(1).optional(),
  benefits: z.array(z.string().min(1)).default([]),
  payment: PaymentSchema.optional(),
})

export const ContactItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  url: z.string().url().or(z.string().startsWith("mailto:")).optional(),
})

export const ContactSectionSchema = z.object({
  title: z.string().min(1).default("Get in Touch"),
  items: z.array(ContactItemSchema).default([]),
})

export const MemberGateSchema = z.object({
  password: z.string().min(1),
  codePhrase: z.string().min(1).optional(),
  hint: z.string().min(1).optional(),
})

export const MemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  yearJoined: z.number().int().min(1900).max(2200).optional(),
  pdga: z.string().min(1).optional(),
  special: z.string().min(1).optional(),
})

export const MembersSectionSchema = z.object({
  title: z.string().min(1).default("Member Directory"),
  source: DataSourceSchema.optional(),
  items: z.array(MemberSchema).default([]),
  pdgaLinks: z.boolean().default(false),
  foundingYear: z.number().int().min(1900).max(2200).optional(),
  gate: MemberGateSchema.optional(),
})

export const SeasonResultSchema = z.object({
  season: z.string().min(1),
  totalPoints: z.number(),
  bestPoints: z.number().optional(),
  placement: z.number().int().positive(),
  weeksAttended: z.number().int().nonnegative().optional(),
  avgScore: z.number().optional(),
})

export const LeaguePlayerSchema = z.object({
  name: z.string().min(1),
  seasons: z.number().int().positive(),
  totalPoints: z.number(),
  bestFinish: z.number().int().positive(),
  wins: z.number().int().nonnegative().default(0),
  top3: z.number().int().nonnegative().default(0),
  weeks: z.number().int().nonnegative().default(0),
  seasonResults: z.array(SeasonResultSchema).default([]),
})

export const LeagueDataSchema = z.object({
  seasonOrder: z.array(z.string().min(1)).default([]),
  champions: z
    .array(
      z.object({
        season: z.string().min(1),
        name: z.string().min(1),
        points: z.number(),
      }),
    )
    .default([]),
  leaderboard: z.array(LeaguePlayerSchema).default([]),
})

export const LeagueSectionSchema = z.object({
  title: z.string().min(1).default("League Records"),
  source: DataSourceSchema.optional(),
  data: LeagueDataSchema.default({
    seasonOrder: [],
    champions: [],
    leaderboard: [],
  }),
})

export const ClubConfigSchema = z.object({
  club: z
    .object({
      name: z.string().min(1).default("Disc Golf Club"),
      tagline: z.string().min(1).optional(),
      location: z.string().min(1).optional(),
    })
    .default({ name: "Disc Golf Club" }),
  stats: z.array(StatSchema).default([]),
  courses: CoursesSectionSchema.default({ title: "Courses", groups: [] }),
  events: EventsSectionSchema.default({
    title: "Upcoming Events",
    items: [],
    maxVisible: 5,
    showPast: false,
  }),
  tournaments: TournamentsSectionSchema.default({
    title: "Area Tournaments",
    items: [],
    maxVisible: 5,
  }),
  membership: MembershipSectionSchema.default({ title: "Become a Member", benefits: [] }),
  contact: ContactSectionSchema.default({ title: "Get in Touch", items: [] }),
  members: MembersSectionSchema.default({ title: "Member Directory", items: [], pdgaLinks: false }),
  league: LeagueSectionSchema.default({
    title: "League Records",
    data: { seasonOrder: [], champions: [], leaderboard: [] },
  }),
})

export type ClubConfigInput = z.input<typeof ClubConfigSchema>
export type ClubConfig = z.infer<typeof ClubConfigSchema>
export type Course = z.infer<typeof CourseSchema>
export type DataSource = z.infer<typeof DataSourceSchema>
export type EventItem = z.infer<typeof EventItemSchema>
export type TournamentItem = z.infer<typeof TournamentItemSchema>
export type Member = z.infer<typeof MemberSchema>
export type MemberGate = z.infer<typeof MemberGateSchema>
export type LeagueData = z.infer<typeof LeagueDataSchema>
export type Payment = z.infer<typeof PaymentSchema>

export function parseClubConfig(value: unknown): ClubConfig {
  return ClubConfigSchema.parse(value)
}

export const defaultClubConfig: ClubConfig = ClubConfigSchema.parse({})
