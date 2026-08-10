import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { provisionInitialAdministrator } from "../src/lib/services/admin-provisioning";

async function main() {
  console.log("==================================================");
  console.log("INITIAL ADMINISTRATOR ACCOUNT PROVISIONING");
  console.log("==================================================");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@codivex.tech";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@CodivexTechnologies";

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
    console.log(`   School ID: ${result.schoolId || "00000000-0000-0000-0000-000000000001"}`);
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
