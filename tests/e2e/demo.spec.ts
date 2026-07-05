import { expect, test } from "@playwright/test"

test("renders the full club suite and filters members", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto("http://localhost:4174/", { waitUntil: "networkidle" })

  const result = await page.locator("open-disc-golf-club").evaluate((element) => {
    const root = element.shadowRoot
    if (!root) {
      return { ok: false, sectionCount: 0, cardCount: 0, hiddenMembers: 0 }
    }

    const search = root.querySelector("[data-member-search]")
    if (search instanceof HTMLInputElement) {
      search.value = "Morgan"
      search.dispatchEvent(new Event("input", { bubbles: true }))
    }

    return {
      ok: true,
      sectionCount: root.querySelectorAll("section").length,
      cardCount: root.querySelectorAll(".odgc-card").length,
      hiddenMembers: root.querySelectorAll("[data-member-card].odgc-hidden").length,
    }
  })

  expect(result.ok).toBe(true)
  expect(result.sectionCount).toBeGreaterThanOrEqual(8)
  expect(result.cardCount).toBeGreaterThanOrEqual(15)
  expect(result.hiddenMembers).toBe(1)
})
