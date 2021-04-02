export function ArrayDelRepetition<T>(arr: T[]): T[] {
    return Array.from(new Set<T>(arr));
}