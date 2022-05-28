import { coerce, instance, string } from "superstruct";
import { PublicKey } from "@mundis/sdk";

export const PublicKeyFromString = coerce(
  instance(PublicKey),
  string(),
  (value) => new PublicKey(value)
);
