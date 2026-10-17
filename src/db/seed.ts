import { db } from "./client.js";

async function seed() {
  console.log("🌱 Seeding Foundation database with multi-role accounts and hierarchy...");

  // 1. Seed Admin
  const admin = await db.user.upsert({
    where: { email: "admin@foundation.org" },
    update: {
      role: "ADMIN",
      password: "adminPassword123",
      agentCode: "ADM-001",
      name: "Dr. Ramesh Prajapati",
      phone: "+91 98290 12345",
      status: "ACTIVE",
    },
    create: {
      email: "admin@foundation.org",
      role: "ADMIN",
      password: "adminPassword123",
      agentCode: "ADM-001",
      name: "Dr. Ramesh Prajapati",
      phone: "+91 98290 12345",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Seeded ADMIN: ${admin.name} (${admin.agentCode})`);

  // 2. Seed Primary Regional Agent
  const agent = await db.user.upsert({
    where: { email: "agent@foundation.org" },
    update: {
      role: "AGENT",
      password: "agentPassword123",
      agentCode: "AGT-101",
      name: "Vikram Kumawat",
      phone: "+91 94140 54321",
      status: "ACTIVE",
    },
    create: {
      email: "agent@foundation.org",
      role: "AGENT",
      password: "agentPassword123",
      agentCode: "AGT-101",
      name: "Vikram Kumawat",
      phone: "+91 94140 54321",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Seeded AGENT: ${agent.name} (${agent.agentCode})`);

  // 3. Seed Sub-Agents explicitly linked under Agent (Vikram Kumawat)
  const subAgent1 = await db.user.upsert({
    where: { email: "subagent@foundation.org" },
    update: {
      role: "SUB_AGENT",
      password: "subPassword123",
      agentCode: "SUB-501",
      name: "Suresh Prajapat",
      phone: "+91 97820 98765",
      parentAgentId: agent.id,
      status: "ACTIVE",
    },
    create: {
      email: "subagent@foundation.org",
      role: "SUB_AGENT",
      password: "subPassword123",
      agentCode: "SUB-501",
      name: "Suresh Prajapat",
      phone: "+91 97820 98765",
      parentAgentId: agent.id,
      status: "ACTIVE",
    },
  });
  console.log(
    `✅ Seeded SUB_AGENT: ${subAgent1.name} (${subAgent1.agentCode}) under Agent ${agent.name}`
  );

  const subAgent2 = await db.user.upsert({
    where: { email: "pooja.subagent@foundation.org" },
    update: {
      role: "SUB_AGENT",
      password: "subPassword123",
      agentCode: "SUB-502",
      name: "Pooja Prajapati",
      phone: "+91 98280 55443",
      parentAgentId: agent.id,
      status: "ACTIVE",
    },
    create: {
      email: "pooja.subagent@foundation.org",
      role: "SUB_AGENT",
      password: "subPassword123",
      agentCode: "SUB-502",
      name: "Pooja Prajapati",
      phone: "+91 98280 55443",
      parentAgentId: agent.id,
      status: "ACTIVE",
    },
  });
  console.log(
    `✅ Seeded SUB_AGENT: ${subAgent2.name} (${subAgent2.agentCode}) under Agent ${agent.name}`
  );
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
