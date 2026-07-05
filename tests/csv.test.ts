import { describe, expect, test } from "bun:test"
import { parseCsv } from "../src/lib/csv"

describe("parseCsv", () => {
  test("keeps commas inside quoted cells", () => {
    const rows = parseCsv(
      'title,date,description\n"Saturday Singles","2026-08-08","Check in, then play"',
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]?.["title"]).toBe("Saturday Singles")
    expect(rows[0]?.["description"]).toBe("Check in, then play")
  })
})
