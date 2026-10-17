import { Router, Request, Response } from "express";
import { db } from "../db/client.js";

export const agentsRouter = Router();

// Default active agents list for field work and commission tracking
export const DEFAULT_AGENTS = [
  {
    id: "AGT-101",
    name: "सुरेश जी",
    agentCode: "JOD-AG-101",
    phone: "9829011223",
    zone: "जोधपुर (Jodhpur)",
    area: "जोधपुर शहर व जसोल",
    role: "मुख्य एजेंट (Regional Coordinator)",
  },
  {
    id: "AGT-102",
    name: "दिनेश कुमार",
    agentCode: "BAR-AG-102",
    phone: "9414022334",
    zone: "बाड़मेर (Barmer)",
    area: "सिवाना व बालोतरा",
    role: "मुख्य एजेंट (Regional Coordinator)",
  },
  {
    id: "AGT-103",
    name: "प्रकाश सिंह",
    agentCode: "JOD-AG-103",
    phone: "9828033445",
    zone: "जोधपुर (Jodhpur)",
    area: "लूणी",
    role: "मुख्य एजेंट (Field Coordinator)",
  },
  {
    id: "AGT-104",
    name: "महेन्द्र सुथार",
    agentCode: "JOD-AG-104",
    phone: "9829944556",
    zone: "जोधपुर (Jodhpur)",
    area: "भोपालगढ़ व आसोप",
    role: "मुख्य एजेंट (Field Coordinator)",
  },
  {
    id: "AGT-105",
    name: "अनिल शर्मा",
    agentCode: "BAR-AG-105",
    phone: "9414455667",
    zone: "बाड़मेर (Barmer)",
    area: "समदड़ी",
    role: "मुख्य एजेंट (Field Coordinator)",
  },
  {
    id: "AGT-106",
    name: "कैलाश प्रजापत",
    agentCode: "JOD-AG-106",
    phone: "9602366778",
    zone: "जोधपुर (Jodhpur)",
    area: "पीपाड़ सिटी",
    role: "मुख्य एजेंट (Field Coordinator)",
  },
  {
    id: "AGT-107",
    name: "रामप्रसाद जी",
    agentCode: "JOD-AG-107",
    phone: "9461077889",
    zone: "जोधपुर (Jodhpur)",
    area: "ओसियाँ",
    role: "कार्यकर्ता (Field Worker)",
  },
  {
    id: "AGT-108",
    name: "भंवरलाल जी",
    agentCode: "JOD-AG-108",
    phone: "9829188990",
    zone: "जोधपुर (Jodhpur)",
    area: "तिवरी व शेरगढ़",
    role: "कार्यकर्ता (Field Worker)",
  },
  {
    id: "AGT-109",
    name: "सुरेश कुमार सैन",
    agentCode: "BAR-AG-109",
    phone: "9414299001",
    zone: "बाड़मेर (Barmer)",
    area: "बाड़मेर सिटी",
    role: "कार्यकर्ता (Field Worker)",
  },
];

// GET /api/agents - List all active agents & coordinators for selection and commission tracking
agentsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const dbAgents = await db.user.findMany({
      where: { role: { in: ["AGENT", "ADMIN", "SUB_AGENT"] } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        agentCode: true,
        role: true,
        status: true,
      },
    });

    if (Array.isArray(dbAgents) && dbAgents.length > 0) {
      return res.status(200).json({
        success: true,
        count: dbAgents.length,
        agents: dbAgents,
      });
    }

    return res.status(200).json({
      success: true,
      count: DEFAULT_AGENTS.length,
      agents: DEFAULT_AGENTS,
    });
  } catch {
    return res.status(200).json({
      success: true,
      count: DEFAULT_AGENTS.length,
      agents: DEFAULT_AGENTS,
    });
  }
});

// GET /api/agents/:agentId/sub-agents - List all sub-agents managed under this agent
agentsRouter.get("/:agentId/sub-agents", async (req: Request, res: Response) => {
  try {
    const rawAgentId = Array.isArray(req.params.agentId)
      ? req.params.agentId[0]
      : req.params.agentId;

    // Agent can be queried by ID or by agentCode (e.g. AGT-101)
    const agent = await db.user.findFirst({
      where: {
        OR: [{ id: rawAgentId }, { agentCode: rawAgentId.toUpperCase() }],
        role: { in: ["AGENT", "ADMIN"] },
      },
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: "Agent not found with given ID or code",
      });
    }

    const subAgents = await db.user.findMany({
      where: { parentAgentId: agent.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        agentCode: true,
        status: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        agentCode: agent.agentCode,
        role: agent.role,
      },
      count: subAgents.length,
      data: subAgents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/agents/:agentId/sub-agents - Agent creates a new sub-agent under him
agentsRouter.post("/:agentId/sub-agents", async (req: Request, res: Response) => {
  try {
    const rawAgentId = Array.isArray(req.params.agentId)
      ? req.params.agentId[0]
      : req.params.agentId;
    const { name, email, phone, password } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: "Sub-agent name and valid email are required",
      });
    }

    // Verify parent agent exists
    const agent = await db.user.findFirst({
      where: {
        OR: [{ id: rawAgentId }, { agentCode: rawAgentId.toUpperCase() }],
        role: { in: ["AGENT", "ADMIN"] },
      },
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: "Parent agent not found. Only authorized agents can create sub-agents.",
      });
    }

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Generate unique sub-agent code (e.g. SUB-714)
    const randomCodeNum = Math.floor(100 + Math.random() * 900);
    const subAgentCode = `SUB-${randomCodeNum}`;

    const newSubAgent = await db.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        password: password ? String(password).trim() : "subPassword123",
        role: "SUB_AGENT",
        agentCode: subAgentCode,
        parentAgentId: agent.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        agentCode: true,
        role: true,
        status: true,
        parentAgentId: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Sub-agent created successfully under Agent ${agent.name} (${agent.agentCode})`,
      data: newSubAgent,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/agents/:agentId/sub-agents/:subAgentId/status - Update sub-agent status
agentsRouter.patch(
  "/:agentId/sub-agents/:subAgentId/status",
  async (req: Request, res: Response) => {
    try {
      const rawAgentId = Array.isArray(req.params.agentId)
        ? req.params.agentId[0]
        : req.params.agentId;
      const rawSubAgentId = Array.isArray(req.params.subAgentId)
        ? req.params.subAgentId[0]
        : req.params.subAgentId;
      const { status } = req.body;

      if (!status || !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Allowed: ACTIVE, INACTIVE, SUSPENDED",
        });
      }

      // Verify ownership
      const subAgent = await db.user.findFirst({
        where: {
          id: rawSubAgentId,
          parentAgent: {
            OR: [{ id: rawAgentId }, { agentCode: rawAgentId.toUpperCase() }],
          },
        },
      });

      if (!subAgent) {
        return res.status(404).json({
          success: false,
          error: "Sub-agent not found under this agent's management",
        });
      }

      const updated = await db.user.update({
        where: { id: subAgent.id },
        data: { status },
      });

      res.status(200).json({
        success: true,
        message: `Sub-agent status updated to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
