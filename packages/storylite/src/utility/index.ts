// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function __ignoreUnused(...args: any[]) {
  // does nothing. useful to pass variables that are not used, so eslint doesn't complain :P
  // it is helpful in some spread scenarios like: `const { a: excludeThis, ...allOtherProps } = obj`
}

// type Excluded<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type SimplifyObj<T> = { [K in keyof T]: T[K] }

export function excluded<T, K extends keyof T>(obj: T, keys: K[]): SimplifyObj<Omit<T, K>> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])

  return result
}

export function typedKeys<T extends object | Record<string, any>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isTruthy<T>(value: T | null | undefined | false): value is T {
  return value !== null && value !== undefined && value !== false
}

// type MembersOf<T> = { [K in keyof T]: T[K] }
// type NonFunctionPropertyNames<T> = {
//   [K in keyof T]: T[K] extends Function ? never : K
// }[keyof T]
// type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>
