// Next hands search params over as a string, a repeated key's array, or
// undefined. Client-safe.

export type RawSearchParams = Record<string, string | string[] | undefined>;

// The first value of a search param.
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
