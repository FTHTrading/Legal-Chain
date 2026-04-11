import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const adminHash = await bcrypt.hash("admin-change-me", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@unykorn.law" },
    update: {},
    create: {
      email: "admin@unykorn.law",
      name: "System Administrator",
      passwordHash: adminHash,
      role: UserRole.system_admin,
      active: true,
    },
  });
  console.log(`Admin user: ${admin.id} (${admin.email})`);

  // Create supervising attorney
  const attorneyHash = await bcrypt.hash("attorney-change-me", 12);
  const attorney = await prisma.user.upsert({
    where: { email: "attorney@unykorn.law" },
    update: {},
    create: {
      email: "attorney@unykorn.law",
      name: "Supervising Attorney",
      passwordHash: attorneyHash,
      role: UserRole.supervising_attorney,
      active: true,
    },
  });
  console.log(`Attorney user: ${attorney.id} (${attorney.email})`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
