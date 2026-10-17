import { Router, Request, Response } from "express";
import { db } from "../db/client.js";

export const authRouter = Router();

// Demo accounts with hierarchy relationship built-in
export const DEMO_ACCOUNTS = [
  {
    role: "ADMIN",
    email: "admin@foundation.org",
    agentCode: "ADM-001",
    password: "adminPassword123",
    name: "Dr. Ramesh Prajapati",
    phone: "+91 98290 12345",
    description: "केंद्रीय प्रशासक (Super Administrator)",
  },
  {
    role: "AGENT",
    email: "agent@foundation.org",
    agentCode: "AGT-101",
    password: "agentPassword123",
    name: "Vikram Kumawat",
    phone: "+91 94140 54321",
    description: "वरिष्ठ क्षेत्रीय एजेंट (Senior Regional Agent)",
    subAgents: [
      {
        id: "demo-sub-1",
        name: "Suresh Prajapat",
        agentCode: "SUB-501",
        email: "subagent@foundation.org",
        phone: "+91 97820 98765",
        status: "ACTIVE",
        zone: "जोधपुर शहर (Jodhpur City)",
      },
      {
        id: "demo-sub-2",
        name: "Pooja Prajapati",
        agentCode: "SUB-502",
        email: "pooja.subagent@foundation.org",
        phone: "+91 98280 55443",
        status: "ACTIVE",
        zone: "लूणी / मण्डोर (Luni / Mandore)",
      },
    ],
  },
  {
    role: "SUB_AGENT",
    email: "subagent@foundation.org",
    agentCode: "SUB-501",
    password: "subPassword123",
    name: "Suresh Prajapat",
    phone: "+91 97820 98765",
    description: "संबद्ध उप-एजेंट (Assigned Sub-Agent)",
    parentAgent: {
      name: "Vikram Kumawat",
      agentCode: "AGT-101",
      phone: "+91 94140 54321",
      email: "agent@foundation.org",
      zone: "जोधपुर संभाग (Jodhpur Division)",
    },
  },
];

// GET /api/auth/demo-accounts
authRouter.get("/demo-accounts", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: DEMO_ACCOUNTS.map(({ password, ...acc }) => ({
      ...acc,
      demoPassword: password,
    })),
  });
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Identifier (Email or Agent Code) and password are required",
      });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const targetRole = role ? String(role).toUpperCase() : undefined;

    // Try finding in PostgreSQL database with parentAgent and subAgents relations
    let user = null;
    let isDatabaseConnected = true;

    try {
      user = await db.user.findFirst({
        where: {
          OR: [
            { email: cleanIdentifier },
            { agentCode: cleanIdentifier.toUpperCase() },
          ],
        },
        include: {
          parentAgent: {
            select: {
              id: true,
              name: true,
              agentCode: true,
              phone: true,
              email: true,
            },
          },
          subAgents: {
            select: {
              id: true,
              name: true,
              agentCode: true,
              phone: true,
              email: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } catch {
      // Database offline/unreachable; fallback to demo validation
      isDatabaseConnected = false;
    }

    // If user found in database
    if (user) {
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          error: "Invalid password. Please check your credentials.",
        });
      }

      if (targetRole && user.role !== targetRole) {
        return res.status(403).json({
          success: false,
          error: `Access denied. This account is registered as ${user.role}, not ${targetRole}.`,
        });
      }

      return res.status(200).json({
        success: true,
        source: "database",
        token: `session_${Buffer.from(`${user.id}:${Date.now()}`).toString("base64")}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agentCode: user.agentCode,
          phone: user.phone,
          parentAgent: user.parentAgent,
          subAgents: user.subAgents,
        },
      });
    }

    // Fallback: Check against demo accounts if not in DB
    const demoMatch = DEMO_ACCOUNTS.find(
      (demo) =>
        (demo.email.toLowerCase() === cleanIdentifier ||
          demo.agentCode.toLowerCase() === cleanIdentifier) &&
        demo.password === password
    );

    if (demoMatch) {
      if (targetRole && demoMatch.role !== targetRole) {
        return res.status(403).json({
          success: false,
          error: `Access denied. This demo credential belongs to ${demoMatch.role}, not ${targetRole}.`,
        });
      }

      return res.status(200).json({
        success: true,
        source: isDatabaseConnected ? "demo-mock" : "offline-fallback",
        token: `demo_session_${Buffer.from(`${demoMatch.agentCode}:${Date.now()}`).toString("base64")}`,
        user: {
          id: `demo_${demoMatch.agentCode.toLowerCase()}`,
          email: demoMatch.email,
          name: demoMatch.name,
          role: demoMatch.role,
          agentCode: demoMatch.agentCode,
          phone: demoMatch.phone,
          parentAgent: (demoMatch as any).parentAgent || null,
          subAgents: (demoMatch as any).subAgents || [],
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid credentials. Use demo accounts or register through your administrator.",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error during login",
    });
  }
});

// POST /api/auth/seed - Seed demo accounts into database with hierarchy
authRouter.post("/seed", async (_req: Request, res: Response) => {
  try {
    // 1. Admin
    const admin = await db.user.upsert({
      where: { email: "admin@foundation.org" },
      update: {
        role: "ADMIN",
        password: "adminPassword123",
        agentCode: "ADM-001",
        name: "Dr. Ramesh Prajapati",
        phone: "+91 98290 12345",
      },
      create: {
        email: "admin@foundation.org",
        role: "ADMIN",
        password: "adminPassword123",
        agentCode: "ADM-001",
        name: "Dr. Ramesh Prajapati",
        phone: "+91 98290 12345",
      },
    });

    // 2. Agent
    const agent = await db.user.upsert({
      where: { email: "agent@foundation.org" },
      update: {
        role: "AGENT",
        password: "agentPassword123",
        agentCode: "AGT-101",
        name: "Vikram Kumawat",
        phone: "+91 94140 54321",
      },
      create: {
        email: "agent@foundation.org",
        role: "AGENT",
        password: "agentPassword123",
        agentCode: "AGT-101",
        name: "Vikram Kumawat",
        phone: "+91 94140 54321",
      },
    });

    // 3. Sub-Agent linked to Agent
    const subAgent = await db.user.upsert({
      where: { email: "subagent@foundation.org" },
      update: {
        role: "SUB_AGENT",
        password: "subPassword123",
        agentCode: "SUB-501",
        name: "Suresh Prajapat",
        phone: "+91 97820 98765",
        parentAgentId: agent.id,
      },
      create: {
        email: "subagent@foundation.org",
        role: "SUB_AGENT",
        password: "subPassword123",
        agentCode: "SUB-501",
        name: "Suresh Prajapat",
        phone: "+91 97820 98765",
        parentAgentId: agent.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully seeded multi-role demo users with hierarchy into PostgreSQL",
      data: { admin, agent, subAgent },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      tip: "Verify that PostgreSQL is running and DATABASE_URL is set in .env.local or .env",
    });
  }
});
