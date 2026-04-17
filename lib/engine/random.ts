export type SeedInput = string | number | undefined;

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export class SeededRandom {
  private state: number;

  constructor(seed?: SeedInput) {
    const initial =
      seed === undefined
        ? Math.floor(Math.random() * 0xffffffff)
        : hashSeed(String(seed));
    this.state = initial === 0 ? 0x9e3779b9 : initial;
  }

  next(): number {
    this.state += 0x6d2b79f5;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from an empty array.");
    }
    return items[this.int(0, items.length - 1)];
  }

  shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

export function createSeededRandom(seed?: SeedInput): SeededRandom {
  return new SeededRandom(seed);
}

export function deriveSeed(seed: SeedInput, label: string): string {
  return `${seed ?? "unseeded"}:${label}`;
}
