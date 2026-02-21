import { config } from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load dari .env.local (bukan .env)
config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
