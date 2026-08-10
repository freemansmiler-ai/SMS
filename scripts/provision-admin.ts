import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { provisionInitialAdministrator } from "../src/lib/services/admin-provisioning";

async function main() {
  console.log("==================================================");
  console.log("INITIAL ADMINISTRATOR ACCOUNT PROVISIONING");
  console.log("==================================================");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ ERROR: Missing required environment variables.");
    console.error("Please supply ADMIN_EMAIL and ADMIN_PASSWORD when invoking this script:");
    console.error('  ADMIN_EMAIL="admin@your-school.edu.gh" ADMIN_PASSWORD="YourSecurePassword123!" npx tsx scripts/provision-admin.ts');
    process.exit(1);
  }

  console.log(`Provisioning Administrator for: ${adminEmail}`);

  const result = await provisionInitialAdministrator({
    email: adminEmail,
    password: adminPassword,
    firstName: process.env.ADMIN_FIRST_NAME || "System",
    lastName: process.env.ADMIN_LAST_NAME || "Administrator",
    schoolName: process.env.ADMIN_SCHOOL_NAME || "Achimota Basic School",
    schoolCode: process.env.ADMIN_SCHOOL_CODE || "ABS-2026",
  });

  if (result.success) {
    console.log("✅ SUCCESS:", result.message);
    console.log(`   School ID: ${result.schoolId || "school-demo-id"}`);
    console.log(`   Admin ID:  ${result.adminId || "admin-demo-id"}`);
    console.log("\nYou can now log in at /login as Administrator.");
  } else {
    console.error("❌ FAILURE:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal Provisioning Error:", err);
  process.exit(1);
});
