export type Class = new (...args: any[]) => any
export type ClassOf<T> = new (...args: any[]) => T