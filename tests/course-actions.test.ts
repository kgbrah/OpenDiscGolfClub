import { describe, expect, test } from "bun:test"
import { CourseSchema } from "../src/config"
import { buildCourseActions } from "../src/lib/course-actions"

describe("buildCourseActions", () => {
  test("does not enable third-party course actions until configured", () => {
    const course = CourseSchema.parse({
      name: "North Park",
      location: "River City, NC",
    })

    expect(buildCourseActions(course)).toEqual([])
  })

  test("builds maps and UDisc actions from optional fields", () => {
    const course = CourseSchema.parse({
      name: "North Park",
      location: "River City, NC",
      udiscUrl: "https://udisc.com/courses/example",
      coordinates: { lat: 35.631092, lng: -77.319923 },
    })

    const actions = buildCourseActions(course)

    expect(actions.map((action) => action.kind)).toEqual(["udisc", "map"])
    expect(actions[1]?.url).toContain("google.com/maps/dir")
  })
})
