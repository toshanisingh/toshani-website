// Generate a bcrypt hash for the admin password.
// Usage:  node scripts/hash-password.mjs 'your-password'
// Then paste the output into ADMIN_PASSWORD_HASH in your .env file.

import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs 'your-password'");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
