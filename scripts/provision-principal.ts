import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { provisionPrincipal } from "../src/lib/services/principal-provisioning";

async function main() {
  console.log("==================================================");
  console.log("PRINCIPAL / HEADMASTER ACCOUNT PROVISIONING");
  console.log("==================================================");

  const email = process.env.PRINCIPAL_EMAIL || "principal@codivex.tech";
  const password = process.env.PRINCIPAL_PASSWORD || "Principal@CodivexTechnologies";

  console.log(`Provisioning Principal for: ${email}`);

  const result = await provisionPrincipal({
    email,
    password,
    firstName: process.env.PRINCIPAL_FIRST_NAME || "Rev. Emmanuel",
    lastName: process.env.PRINCIPAL_LAST_NAME || "Mensah",
    schoolName: process.env.ADMIN_SCHOOL_NAME || "Achimota Basic School",
    schoolCode: process.env.ADMIN_SCHOOL_CODE || "ABS-2026",
  });

  if (result.success) {
    console.log("✅ SUCCESS:", result.message);
    console.log(`   School ID:    ${result.schoolId || "00000000-0000-0000-0000-000000000001"}`);
    console.log(`   Principal ID: ${result.principalId || "principal-demo-id"}`);
    console.log(`   Email:        ${email}`);
    console.log(`   Password:     ${password}`);
    console.log("\nYou can now log in at /login as Principal/Headmaster.");
  } else {
    console.error("❌ FAILURE:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal Provisioning Error:", err);
  process.exit(1);
});
