import type { Course } from "../config"
import { assertNever } from "./errors"

const COURSE_ACTION_KIND = {
  UDISC: "udisc",
  MAP: "map",
  VIDEO: "video",
} as const

type CourseActionKind = (typeof COURSE_ACTION_KIND)[keyof typeof COURSE_ACTION_KIND]

export type CourseAction = {
  readonly kind: CourseActionKind
  readonly label: string
  readonly url: string
}

export function buildCourseActions(course: Course): readonly CourseAction[] {
  const actions: CourseAction[] = []

  if (course.udiscUrl) {
    actions.push({ kind: COURSE_ACTION_KIND.UDISC, label: "UDisc", url: course.udiscUrl })
  }

  const mapUrl = course.mapUrl ?? directionsUrl(course)
  if (mapUrl) {
    actions.push({ kind: COURSE_ACTION_KIND.MAP, label: "Directions", url: mapUrl })
  }

  if (course.youtubeUrl) {
    actions.push({
      kind: COURSE_ACTION_KIND.VIDEO,
      label: "Course Preview",
      url: course.youtubeUrl,
    })
  }

  return actions
}

export function actionClassName(kind: CourseActionKind): string {
  switch (kind) {
    case COURSE_ACTION_KIND.UDISC:
      return "is-udisc"
    case COURSE_ACTION_KIND.MAP:
      return "is-map"
    case COURSE_ACTION_KIND.VIDEO:
      return "is-video"
    default:
      return assertNever(kind)
  }
}

function directionsUrl(course: Course): string | null {
  if (!course.coordinates) {
    return null
  }

  const destination = `${course.coordinates.lat},${course.coordinates.lng}`
  const params = new URLSearchParams({ api: "1", destination })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
