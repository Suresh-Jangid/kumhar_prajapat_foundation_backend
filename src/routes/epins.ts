import { Router, Request, Response } from "express";
import { calculateAgePricing } from "./applications.js";
import { db } from "../db/client.js";

export const epinsRouter = Router();

// In-memory active E-Pin store fallback
const activeEpins: Map<string, { id: string; category: "100" | "200" | "300"; amount: number; assignedTo: string; assignedAgentCode: string; status: string; created: string }> = new Map();

// Seed initial active test epins for each category (10 for each category)
for (let i = 0; i < 10; i++) {
  const c100 = `EPIN-100-${88210 + i}`;
  activeEpins.set(c100, { id: c100, category: "100", amount: 100, assignedTo: "Central Pool (केंद्रीय भंडार)", assignedAgentCode: "CENTRAL", status: "ACTIVE", created: "2026-09-01" });

  const c200 = `EPIN-200-${55420 + i}`;
  activeEpins.set(c200, { id: c200, category: "200", amount: 200, assignedTo: "सुरेश जी (JOD-AG-101)", assignedAgentCode: "JOD-AG-101", status: "ACTIVE", created: "2026-09-05" });

  const c300 = `EPIN-300-${99120 + i}`;
  activeEpins.set(c300, { id: c300, category: "300", amount: 300, assignedTo: "दिनेश कुमार (BAR-AG-102)", assignedAgentCode: "BAR-AG-102", status: "ACTIVE", created: "2026-09-10" });
}

// GET /api/epins
epinsRouter.get("/", async (req: Request, res: Response) => {
  const list = Array.from(activeEpins.values());
  return res.json({ success: true, epins: list, total: list.length });
});

// POST /api/epins/verify
epinsRouter.post("/verify", async (req: Request, res: Response) => {
  const { code, age } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "ई-पिन कोड दर्ज करना अनिवार्य है।",
    });
  }

  const cleanCode = String(code).trim().toUpperCase();

  // Extract category from code prefix (e.g. EPIN-100-XXXXX or EPIN-200-XXXXX or EPIN-300-XXXXX)
  let category: "100" | "200" | "300" = "100";
  const match = cleanCode.match(/EPIN-(\d+)-/);
  if (match && ["100", "200", "300"].includes(match[1])) {
    category = match[1] as "100" | "200" | "300";
  } else if (cleanCode.includes("200")) {
    category = "200";
  } else if (cleanCode.includes("300")) {
    category = "300";
  }

  const epinAmount = parseInt(category, 10);

  // Age bracket description allowed by this pin category
  let allowedAgeGroup = "10 से 12 वर्ष";
  let defaultFee = 5100;
  if (category === "200") {
    allowedAgeGroup = "12 से 15 वर्ष";
    defaultFee = 7100;
  } else if (category === "300") {
    allowedAgeGroup = "15 वर्ष और अधिक";
    defaultFee = 9100; // base fee for 15-18
  }

  // If age is also provided, validate match
  let ageMatch = true;
  let calculatedFee = defaultFee;
  let validationMessage = `सत्यापित ई-पिन: Category ${category} (₹${epinAmount}) • मान्य आयु: ${allowedAgeGroup}`;

  if (age !== undefined && age !== null && String(age).trim() !== "") {
    const ageNum = parseInt(String(age), 10);
    if (!isNaN(ageNum)) {
      const pricing = calculateAgePricing(ageNum);
      if (!pricing) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: "आयु 10 वर्ष से कम के लिए आवेदन मान्य नहीं है।",
        });
      }

      calculatedFee = pricing.applicationFee;

      if (pricing.category !== category) {
        ageMatch = false;
        return res.status(400).json({
          success: false,
          valid: false,
          category,
          epinAmount,
          requiredCategory: pricing.category,
          requiredEpinAmount: pricing.epinAmount,
          applicationFee: pricing.applicationFee,
          ageGroup: pricing.ageGroup,
          error: `ई-पिन श्रेणी बेमेल! ${pricing.ageGroup} आयु वर्ग हेतु Category ${pricing.category} (₹${pricing.epinAmount}) ई-पिन आवश्यक है, जबकि आपका ई-पिन Category ${category} है।`,
        });
      }
    }
  }

  return res.json({
    success: true,
    valid: true,
    code: cleanCode,
    category,
    epinAmount,
    allowedAgeGroup,
    applicationFee: calculatedFee,
    message: validationMessage,
  });
});
