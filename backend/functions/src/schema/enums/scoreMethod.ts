import { Enum } from "../core/helpers/enum";

export class scoreMethodEnum extends Enum {
  static readonly STANDARD = new scoreMethodEnum("STANDARD");
  static readonly FMC = new scoreMethodEnum("FMC");
  static readonly MBLD = new scoreMethodEnum("MBLD");
}
