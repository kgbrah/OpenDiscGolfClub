export type CsvRow = Readonly<Record<string, string>>

export function parseCsv(csv: string): readonly CsvRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const headerLine = lines.at(0)
  if (!headerLine) {
    return []
  }

  const headers = parseCsvLine(headerLine).map((header) => header.trim().toLowerCase())
  const rows: CsvRow[] = []

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values.at(index)?.trim() ?? ""
    })
    rows.push(row)
  }

  return rows
}

export function parseCsvLine(line: string): readonly string[] {
  const values: string[] = []
  let current = ""
  let insideQuote = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]
    if (character === '"' && insideQuote && nextCharacter === '"') {
      current += '"'
      index += 1
    } else if (character === '"') {
      insideQuote = !insideQuote
    } else if (character === "," && !insideQuote) {
      values.push(current.trim())
      current = ""
    } else if (character) {
      current += character
    }
  }

  values.push(current.trim())
  return values
}
