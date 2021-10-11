export abstract class Kenum {
  static get values(): Kenum[] {
    return Object.values(this);
  }

  static fromName(name: string): Kenum {
    const value = (this as any)[name];
    if (value) {
      return value;
    }

    throw new RangeError(
      `Illegal argument passed to fromName(): ${name} does not correspond to any instance of the enum ${
        (this as any).prototype.constructor.name
      }`
    );
  }

  static fromIndex(index: number): Kenum {
    const value = this.values.find((ele) => ele.index === index);
    if (value) {
      return value;
    }

    throw new RangeError(
      `Illegal argument passed to fromIndex(): ${index} does not correspond to any instance of the enum ${
        (this as any).prototype.constructor.name
      }`
    );
  }

  static fromUnknown(key: unknown): Kenum {
    if (typeof key === "number") return this.fromIndex(key);

    if (typeof key === "string") return this.fromName(key);

    throw new Error(
      "Invalid key type for kenum. Only Number or String allowed"
    );
  }

  public get parsed(): number {
    return this.index;
  }

  constructor(
    public readonly name: string,
    public readonly index: number,
    public readonly description: string = ""
  ) {}

  public toJSON(): string {
    return this.name;
  }
}

export abstract class Enum {
  static get values(): Enum[] {
    return Object.values(this);
  }

  static fromName(name: string): Enum {
    const value = (this as any)[name];
    if (value) {
      return value;
    }

    throw new RangeError(
      `Illegal argument passed to fromName(): ${name} does not correspond to any instance of the enum ${
        (this as any).prototype.constructor.name
      }`
    );
  }

  public get parsed(): string {
    return this.name;
  }

  constructor(
    public readonly name: string,
    public readonly description: string = ""
  ) {}

  public toJSON(): string {
    return this.name;
  }
}
