import crypto from "crypto";

const ITERATIONS_NEW = 310000;
const ITERATIONS_OLD = 10000;

function pbkdf2Hex(password, salt, iterations) {
  return crypto
    .pbkdf2Sync(password, salt, iterations, 64, "sha512")
    .toString("hex");
}

function validPassword(password, hash, salt) {
  // Try new iterations first, then fall back for backward compatibility
  const newHash = pbkdf2Hex(password, salt, ITERATIONS_NEW);
  if (hash === newHash) return true;
  const oldHash = pbkdf2Hex(password, salt, ITERATIONS_OLD);
  return hash === oldHash;
}

function genPassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const genHash = pbkdf2Hex(password, salt, ITERATIONS_NEW);
  return { salt, hash: genHash };
}

export { validPassword, genPassword };
