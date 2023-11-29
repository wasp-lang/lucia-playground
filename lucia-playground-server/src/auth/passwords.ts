import { Argon2id } from "oslo/password";

const argon2id = new Argon2id();

export function hashPassword(password: string) {
  return argon2id.hash(password);
}

export function verifyPassword({
  hash,
  password,
}: {
  hash: string;
  password: string;
}) {
  return argon2id.verify(hash, password);
}
