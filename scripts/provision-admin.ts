/**
 * SERVER-ONLY ONE-TIME ADMINISTRATOR PROVISIONING SCRIPT
 * Run via: npx tsx scripts/provision-admin.ts
 */

import { provisionInitialAdministrator } from "../src/lib/services/admin-provisioning";

async function main() {
  console.log("==================================================");
  console.log("INITIAL ADMINISTRATOR ACCOUNT PROVISIONING");
  console.log("==================================================");

  const adminEmail = process.env.ADMIN_EMAIL || "administrator@academy.edu";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass2026!";

  console.log(`Provisioning Administrator for: ${adminEmail}`);

  const result = await provisionInitialAdministrator({
    email: adminEmail,
    password: adminPassword,
    firstName: "System",
    lastName: "Administrator",
    schoolName: "Achimota Basic School",
    schoolCode: "ABS-2026",
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
