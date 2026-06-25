type WithoutUndefined<T> = T extends undefined ? never : T;

export type PickDefined<T extends object> = {
  [K in keyof T as WithoutUndefined<T[K]> extends never ? never : K]: WithoutUndefined<T[K]>;
};

export function pickDefined<T extends object>(obj: T): PickDefined<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as PickDefined<T>;
}
