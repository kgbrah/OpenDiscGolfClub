export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function escapeAttribute(value: string): string {
  return escapeHtml(value)
}

export function optionalText(value: string | undefined): string {
  return value ? escapeHtml(value) : ""
}

export function joinClasses(classes: readonly (string | false | undefined)[]): string {
  return classes.filter((className) => typeof className === "string").join(" ")
}
