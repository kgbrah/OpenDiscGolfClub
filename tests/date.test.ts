import { describe, expect, test } from "bun:test"
import { compareDateStrings, formatDisplayDate } from "../src/lib/date"

describe("formatDisplayDate", () => {
  test("formats ISO dates for event cards", () => {
    const date = formatDisplayDate("2026-08-08")

    expect(date.month).toBe("Aug")
    expect(date.day).toBe("8")
    expect(date.year).toBe("2026")
    expect(date.isTbd).toBe(false)
  })

  test("puts TBD dates last when sorting", () => {
    expect(compareDateStrings("TBD", "2026-08-08")).toBeGreaterThan(0)
  })
})
