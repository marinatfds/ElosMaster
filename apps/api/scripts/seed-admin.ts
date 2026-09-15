import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client.js";
import { users } from "../src/db/schema.js";

async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error("Uso: tsx scripts/seed-admin.ts \"Nome\" email@exemplo.com senha123");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    await db.update(users).set({ passwordHash, role: "admin" }).where(eq(users.id, existing.id));
    console.log(`Usuário admin atualizado: ${email}`);
  } else {
    await db.insert(users).values({ name, email, passwordHash, role: "admin" });
    console.log(`Usuário admin criado: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
