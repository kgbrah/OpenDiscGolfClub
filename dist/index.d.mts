import { z } from "zod";

//#region src/config.d.ts
declare const DataSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  kind: z.ZodLiteral<"jsonUrl">;
  url: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
  kind: z.ZodLiteral<"googleSheetsCsv">;
  url: z.ZodString;
}, z.core.$strip>], "kind">;
declare const CoordinatesSchema: z.ZodObject<{
  lat: z.ZodNumber;
  lng: z.ZodNumber;
}, z.core.$strip>;
declare const CourseSchema: z.ZodObject<{
  name: z.ZodString;
  location: z.ZodString;
  holes: z.ZodOptional<z.ZodNumber>;
  rating: z.ZodOptional<z.ZodString>;
  time: z.ZodOptional<z.ZodString>;
  difficulty: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  imageUrl: z.ZodOptional<z.ZodString>;
  udiscUrl: z.ZodOptional<z.ZodString>;
  mapUrl: z.ZodOptional<z.ZodString>;
  youtubeUrl: z.ZodOptional<z.ZodString>;
  coordinates: z.ZodOptional<z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
  }, z.core.$strip>>;
}, z.core.$strip>;
declare const CourseGroupSchema: z.ZodObject<{
  title: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  courses: z.ZodDefault<z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    location: z.ZodString;
    holes: z.ZodOptional<z.ZodNumber>;
    rating: z.ZodOptional<z.ZodString>;
    time: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    udiscUrl: z.ZodOptional<z.ZodString>;
    mapUrl: z.ZodOptional<z.ZodString>;
    youtubeUrl: z.ZodOptional<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
      lat: z.ZodNumber;
      lng: z.ZodNumber;
    }, z.core.$strip>>;
  }, z.core.$strip>>>;
}, z.core.$strip>;
declare const EventItemSchema: z.ZodObject<{
  title: z.ZodString;
  date: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  url: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const EventsSectionSchema: z.ZodObject<{
  title: z.ZodDefault<z.ZodString>;
  source: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"jsonUrl">;
    url: z.ZodString;
  }, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"googleSheetsCsv">;
    url: z.ZodString;
  }, z.core.$strip>], "kind">>;
  items: z.ZodDefault<z.ZodArray<z.ZodObject<{
    title: z.ZodString;
    date: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
  }, z.core.$strip>>>;
  maxVisible: z.ZodDefault<z.ZodNumber>;
  showPast: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
declare const TournamentItemSchema: z.ZodObject<{
  name: z.ZodString;
  date: z.ZodString;
  location: z.ZodOptional<z.ZodString>;
  tier: z.ZodOptional<z.ZodString>;
  url: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const TournamentsSectionSchema: z.ZodObject<{
  title: z.ZodDefault<z.ZodString>;
  source: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"jsonUrl">;
    url: z.ZodString;
  }, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"googleSheetsCsv">;
    url: z.ZodString;
  }, z.core.$strip>], "kind">>;
  items: z.ZodDefault<z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    date: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
  }, z.core.$strip>>>;
  maxVisible: z.ZodDefault<z.ZodNumber>;
  externalUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const PaymentSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  provider: z.ZodLiteral<"paypal">;
  checkoutUrl: z.ZodOptional<z.ZodString>;
  businessEmail: z.ZodOptional<z.ZodString>;
  amount: z.ZodOptional<z.ZodNumber>;
  itemName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
  provider: z.ZodLiteral<"external">;
  label: z.ZodDefault<z.ZodString>;
  url: z.ZodString;
}, z.core.$strip>], "provider">;
declare const MemberGateSchema: z.ZodObject<{
  password: z.ZodString;
  codePhrase: z.ZodOptional<z.ZodString>;
  hint: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const MemberSchema: z.ZodObject<{
  firstName: z.ZodString;
  lastName: z.ZodString;
  yearJoined: z.ZodOptional<z.ZodNumber>;
  pdga: z.ZodOptional<z.ZodString>;
  special: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const LeagueDataSchema: z.ZodObject<{
  seasonOrder: z.ZodDefault<z.ZodArray<z.ZodString>>;
  champions: z.ZodDefault<z.ZodArray<z.ZodObject<{
    season: z.ZodString;
    name: z.ZodString;
    points: z.ZodNumber;
  }, z.core.$strip>>>;
  leaderboard: z.ZodDefault<z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    seasons: z.ZodNumber;
    totalPoints: z.ZodNumber;
    bestFinish: z.ZodNumber;
    wins: z.ZodDefault<z.ZodNumber>;
    top3: z.ZodDefault<z.ZodNumber>;
    weeks: z.ZodDefault<z.ZodNumber>;
    seasonResults: z.ZodDefault<z.ZodArray<z.ZodObject<{
      season: z.ZodString;
      totalPoints: z.ZodNumber;
      bestPoints: z.ZodOptional<z.ZodNumber>;
      placement: z.ZodNumber;
      weeksAttended: z.ZodOptional<z.ZodNumber>;
      avgScore: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
  }, z.core.$strip>>>;
}, z.core.$strip>;
declare const ClubConfigSchema: z.ZodObject<{
  club: z.ZodDefault<z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
  }, z.core.$strip>>;
  stats: z.ZodDefault<z.ZodArray<z.ZodObject<{
    label: z.ZodString;
    value: z.ZodString;
  }, z.core.$strip>>>;
  courses: z.ZodDefault<z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    groups: z.ZodDefault<z.ZodArray<z.ZodObject<{
      title: z.ZodString;
      description: z.ZodOptional<z.ZodString>;
      courses: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        location: z.ZodString;
        holes: z.ZodOptional<z.ZodNumber>;
        rating: z.ZodOptional<z.ZodString>;
        time: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        udiscUrl: z.ZodOptional<z.ZodString>;
        mapUrl: z.ZodOptional<z.ZodString>;
        youtubeUrl: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
          lat: z.ZodNumber;
          lng: z.ZodNumber;
        }, z.core.$strip>>;
      }, z.core.$strip>>>;
    }, z.core.$strip>>>;
  }, z.core.$strip>>;
  events: z.ZodDefault<z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    source: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      kind: z.ZodLiteral<"jsonUrl">;
      url: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
      kind: z.ZodLiteral<"googleSheetsCsv">;
      url: z.ZodString;
    }, z.core.$strip>], "kind">>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
      title: z.ZodString;
      date: z.ZodString;
      description: z.ZodOptional<z.ZodString>;
      url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    maxVisible: z.ZodDefault<z.ZodNumber>;
    showPast: z.ZodDefault<z.ZodBoolean>;
  }, z.core.$strip>>;
  tournaments: z.ZodDefault<z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    source: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      kind: z.ZodLiteral<"jsonUrl">;
      url: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
      kind: z.ZodLiteral<"googleSheetsCsv">;
      url: z.ZodString;
    }, z.core.$strip>], "kind">>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
      name: z.ZodString;
      date: z.ZodString;
      location: z.ZodOptional<z.ZodString>;
      tier: z.ZodOptional<z.ZodString>;
      url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    maxVisible: z.ZodDefault<z.ZodNumber>;
    externalUrl: z.ZodOptional<z.ZodString>;
  }, z.core.$strip>>;
  membership: z.ZodDefault<z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    priceLabel: z.ZodOptional<z.ZodString>;
    benefits: z.ZodDefault<z.ZodArray<z.ZodString>>;
    payment: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      provider: z.ZodLiteral<"paypal">;
      checkoutUrl: z.ZodOptional<z.ZodString>;
      businessEmail: z.ZodOptional<z.ZodString>;
      amount: z.ZodOptional<z.ZodNumber>;
      itemName: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
      provider: z.ZodLiteral<"external">;
      label: z.ZodDefault<z.ZodString>;
      url: z.ZodString;
    }, z.core.$strip>], "provider">>;
  }, z.core.$strip>>;
  contact: z.ZodDefault<z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
      label: z.ZodString;
      value: z.ZodString;
      url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    }, z.core.$strip>>>;
  }, z.core.$strip>>;
  members: z.ZodDefault<z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    source: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      kind: z.ZodLiteral<"jsonUrl">;
      url: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
      kind: z.ZodLiteral<"googleSheetsCsv">;
      url: z.ZodString;
    }, z.core.$strip>], "kind">>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
      firstName: z.ZodString;
      lastName: z.ZodString;
      yearJoined: z.ZodOptional<z.ZodNumber>;
      pdga: z.ZodOptional<z.ZodString>;
      special: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    pdgaLinks: z.ZodDefault<z.ZodBoolean>;
    foundingYear: z.ZodOptional<z.ZodNumber>;
    gate: z.ZodOptional<z.ZodObject<{
      password: z.ZodString;
      codePhrase: z.ZodOptional<z.ZodString>;
      hint: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
  }, z.core.$strip>>;
  league: z.ZodDefault<z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    source: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      kind: z.ZodLiteral<"jsonUrl">;
      url: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
      kind: z.ZodLiteral<"googleSheetsCsv">;
      url: z.ZodString;
    }, z.core.$strip>], "kind">>;
    data: z.ZodDefault<z.ZodObject<{
      seasonOrder: z.ZodDefault<z.ZodArray<z.ZodString>>;
      champions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        season: z.ZodString;
        name: z.ZodString;
        points: z.ZodNumber;
      }, z.core.$strip>>>;
      leaderboard: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        seasons: z.ZodNumber;
        totalPoints: z.ZodNumber;
        bestFinish: z.ZodNumber;
        wins: z.ZodDefault<z.ZodNumber>;
        top3: z.ZodDefault<z.ZodNumber>;
        weeks: z.ZodDefault<z.ZodNumber>;
        seasonResults: z.ZodDefault<z.ZodArray<z.ZodObject<{
          season: z.ZodString;
          totalPoints: z.ZodNumber;
          bestPoints: z.ZodOptional<z.ZodNumber>;
          placement: z.ZodNumber;
          weeksAttended: z.ZodOptional<z.ZodNumber>;
          avgScore: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
      }, z.core.$strip>>>;
    }, z.core.$strip>>;
  }, z.core.$strip>>;
}, z.core.$strip>;
type ClubConfigInput = z.input<typeof ClubConfigSchema>;
type ClubConfig = z.infer<typeof ClubConfigSchema>;
type Course = z.infer<typeof CourseSchema>;
type DataSource = z.infer<typeof DataSourceSchema>;
type EventItem = z.infer<typeof EventItemSchema>;
type TournamentItem = z.infer<typeof TournamentItemSchema>;
type Member = z.infer<typeof MemberSchema>;
type MemberGate = z.infer<typeof MemberGateSchema>;
type LeagueData = z.infer<typeof LeagueDataSchema>;
type Payment = z.infer<typeof PaymentSchema>;
declare function parseClubConfig(value: unknown): ClubConfig;
declare const defaultClubConfig: ClubConfig;
//#endregion
//#region src/define.d.ts
declare function defineOpenDiscGolfClubElements(): void;
//#endregion
//#region src/lib/course-actions.d.ts
declare const COURSE_ACTION_KIND: {
  readonly UDISC: "udisc";
  readonly MAP: "map";
  readonly VIDEO: "video";
};
type CourseActionKind = (typeof COURSE_ACTION_KIND)[keyof typeof COURSE_ACTION_KIND];
type CourseAction = {
  readonly kind: CourseActionKind;
  readonly label: string;
  readonly url: string;
};
declare function buildCourseActions(course: Course): readonly CourseAction[];
//#endregion
export { type ClubConfig, type ClubConfigInput, ClubConfigSchema, CoordinatesSchema, type Course, type CourseAction, CourseGroupSchema, CourseSchema, type DataSource, DataSourceSchema, type EventItem, EventItemSchema, EventsSectionSchema, type LeagueData, LeagueDataSchema, type Member, type MemberGate, MemberGateSchema, MemberSchema, type Payment, PaymentSchema, type TournamentItem, TournamentItemSchema, TournamentsSectionSchema, buildCourseActions, defaultClubConfig, defineOpenDiscGolfClubElements, parseClubConfig };
//# sourceMappingURL=index.d.mts.map