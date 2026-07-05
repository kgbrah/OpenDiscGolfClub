export class DataSourceLoadError extends Error {
  readonly name = "DataSourceLoadError"

  constructor(
    readonly source: string,
    options?: ErrorOptions,
  ) {
    super(`Unable to load data source: ${source}`, options)
  }
}

export class UnexpectedVariantError extends Error {
  readonly name = "UnexpectedVariantError"

  constructor(readonly value: never) {
    super(`Unexpected variant: ${JSON.stringify(value)}`)
  }
}

export function assertNever(value: never): never {
  throw new UnexpectedVariantError(value)
}
