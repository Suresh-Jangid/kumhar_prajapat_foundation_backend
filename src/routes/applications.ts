import { Router, Request, Response } from "express";
import { db } from "../db/client.js";

export const applicationsRouter = Router();

// Pricing and E-Pin category calculation rule
export function calculateAgePricing(ageNum: number) {
  if (ageNum >= 10 && ageNum < 12) {
    return {
      category: "100" as const,
      epinAmount: 100,
      applicationFee: 5100,
      ageGroup: "10 से 12 वर्ष",
    };
  } else if (ageNum >= 12 && ageNum < 15) {
    return {
      category: "200" as const,
      epinAmount: 200,
      applicationFee: 7100,
      ageGroup: "12 से 15 वर्ष",
    };
  } else if (ageNum >= 15 && ageNum < 18) {
    return {
      category: "300" as const,
      epinAmount: 300,
      applicationFee: 9100,
      ageGroup: "15 से 18 वर्ष",
    };
  } else if (ageNum >= 18 && ageNum < 21) {
    return {
      category: "300" as const,
      epinAmount: 300,
      applicationFee: 10000,
      ageGroup: "18 से 21 वर्ष",
    };
  } else if (ageNum >= 21) {
    return {
      category: "300" as const,
      epinAmount: 300,
      applicationFee: 11000,
      ageGroup: "21 वर्ष और अधिक",
    };
  }
  return null;
}

// In-memory fallback seeded with realistic foundation applications
let memoryApplications: any[] = [
  {
    id: "app_seed_01",
    appNo: "GEN-101",
    type: "GENERAL_MARRIAGE",
    applicantName: "सुनीता कुमारी प्रजापत",
    fatherName: "रामेश्वर प्रजापत",
    motherName: "कमला देवी",
    gender: "महिला / Female",
    dob: "2005-04-12",
    age: 19,
    aadhar: "7845 1290 3341",
    gotra: "प्रजापत",
    mobile: "9829012345",
    village: "जसोल",
    pinCode: "344024",
    tehsil: "बालोतरा",
    district: "बाड़मेर",
    state: "राजस्थान",
    nomineeName: "रामेश्वर प्रजापत",
    nomineeRelation: "पिता",
    workerName: "सुरेश जी",
    epinCode: "EPIN-100-8812",
    epinCategory: "100",
    epinAmount: 100,
    applicationFee: 5100,
    isActive: true,
    createdAt: "2021-03-15T10:00:00.000Z",
  },
  {
    id: "app_seed_02",
    appNo: "GEN-102",
    type: "GENERAL_MARRIAGE",
    applicantName: "पूजा कुमारी सैन",
    fatherName: "मोहनलाल सैन",
    motherName: "शांति देवी",
    gender: "महिला / Female",
    dob: "2003-08-20",
    age: 21,
    aadhar: "8923 4451 9082",
    gotra: "सैन",
    mobile: "9414056789",
    village: "सिवाना",
    pinCode: "344044",
    tehsil: "सिवाना",
    district: "बाड़मेर",
    state: "राजस्थान",
    nomineeName: "मोहनलाल सैन",
    nomineeRelation: "पिता",
    workerName: "दिनेश कुमार",
    epinCode: "EPIN-200-9921",
    epinCategory: "200",
    epinAmount: 200,
    applicationFee: 7100,
    isActive: true,
    createdAt: "2020-06-10T10:00:00.000Z",
  },
  {
    id: "app_seed_03",
    appNo: "GEN-103",
    type: "GENERAL_MARRIAGE",
    applicantName: "आरती राठौड़",
    fatherName: "भंवर सिंह राठौड़",
    motherName: "सुशीला कंवर",
    gender: "महिला / Female",
    dob: "2002-11-05",
    age: 22,
    aadhar: "6712 3490 8821",
    gotra: "राठौड़",
    mobile: "9828034567",
    village: "लूणी",
    pinCode: "342012",
    tehsil: "लूणी",
    district: "जोधपुर",
    state: "राजस्थान",
    nomineeName: "भंवर सिंह",
    nomineeRelation: "पिता",
    workerName: "प्रकाश सिंह",
    epinCode: "EPIN-300-4412",
    epinCategory: "300",
    epinAmount: 300,
    applicationFee: 11000,
    isActive: true,
    createdAt: "2019-01-18T10:00:00.000Z",
  },
  {
    id: "app_seed_04",
    appNo: "GEN-104",
    type: "GENERAL_MARRIAGE",
    applicantName: "महेश कुमार सुथार",
    fatherName: "दुर्गाराम सुथार",
    motherName: "मोहिनी देवी",
    gender: "पुरुष / Male",
    dob: "2000-02-14",
    age: 24,
    aadhar: "5521 8890 1243",
    gotra: "सुथार",
    mobile: "9829987654",
    village: "आसोप",
    pinCode: "342901",
    tehsil: "भोपालगढ़",
    district: "जोधपुर",
    state: "राजस्थान",
    nomineeName: "दुर्गाराम सुथार",
    nomineeRelation: "पिता",
    workerName: "महेन्द्र सुथार",
    epinCode: "EPIN-300-5511",
    epinCategory: "300",
    epinAmount: 300,
    applicationFee: 11000,
    isActive: true,
    createdAt: "2018-09-12T10:00:00.000Z",
  },
  {
    id: "app_seed_05",
    appNo: "GEN-105",
    type: "GENERAL_MARRIAGE",
    applicantName: "विकास कुमार जांगिड़",
    fatherName: "जगदीश जांगिड़",
    motherName: "प्रेमलता जांगिड़",
    gender: "पुरुष / Male",
    dob: "2002-05-19",
    age: 22,
    aadhar: "4432 1198 7765",
    gotra: "जांगिड़",
    mobile: "9414432109",
    village: "समदड़ी",
    pinCode: "344021",
    tehsil: "समदड़ी",
    district: "बाड़मेर",
    state: "राजस्थान",
    nomineeName: "जगदीश जांगिड़",
    nomineeRelation: "पिता",
    workerName: "अनिल शर्मा",
    epinCode: "EPIN-200-7762",
    epinCategory: "200",
    epinAmount: 200,
    applicationFee: 7100,
    isActive: true,
    createdAt: "2020-11-25T10:00:00.000Z",
  },
  {
    id: "app_seed_06",
    appNo: "GEN-106",
    type: "GENERAL_MARRIAGE",
    applicantName: "राहुल कुमार कुमावत",
    fatherName: "नारायण लाल कुमावत",
    motherName: "धापू देवी",
    gender: "पुरुष / Male",
    dob: "2004-10-01",
    age: 20,
    aadhar: "3312 9087 6654",
    gotra: "कुमावत",
    mobile: "9602345678",
    village: "पीपाड़",
    pinCode: "342601",
    tehsil: "पीपाड़ सिटी",
    district: "जोधपुर",
    state: "राजस्थान",
    nomineeName: "नारायण लाल",
    nomineeRelation: "पिता",
    workerName: "कैलाश प्रजापत",
    epinCode: "EPIN-100-3342",
    epinCategory: "100",
    epinAmount: 100,
    applicationFee: 5100,
    isActive: true,
    createdAt: "2021-07-08T10:00:00.000Z",
  },
  // === MAYRA APPLICATIONS (मायरा सहायता आवेदन) ===
  {
    id: "app_mayra_01",
    appNo: "MYR-101",
    type: "MAYRA",
    applicantName: "गीता देवी कुमावत",
    fatherName: "भीमराज कुमावत",
    husbandName: "कमलेश कुमावत",
    motherName: "रूपा देवी",
    gender: "महिला / Female",
    dob: "2004-06-15",
    age: 20,
    aadhar: "9123 4567 8901",
    gotra: "कुमावत",
    mobile: "9461012345",
    village: "ओसियाँ",
    pinCode: "342305",
    tehsil: "ओसियाँ",
    district: "जोधपुर",
    state: "राजस्थान",
    nomineeName: "भीमराज कुमावत",
    nomineeRelation: "पिता",
    workerName: "रामप्रसाद जी",
    epinCode: "EPIN-300-1134",
    epinCategory: "300",
    epinAmount: 300,
    applicationFee: 10000,
    isActive: true,
    createdAt: "2021-05-20T10:00:00.000Z",
  },
  {
    id: "app_mayra_02",
    appNo: "MYR-102",
    type: "MAYRA",
    applicantName: "सरोज कुमारी प्रजापत",
    fatherName: "गोपाल प्रजापत",
    husbandName: "नरेश प्रजापत",
    motherName: "लक्ष्मी देवी",
    gender: "महिला / Female",
    dob: "2003-01-10",
    age: 21,
    aadhar: "8234 5678 9012",
    gotra: "प्रजापत",
    mobile: "9829123456",
    village: "तिवरी",
    pinCode: "342015",
    tehsil: "शेरगढ़",
    district: "जोधपुर",
    state: "राजस्थान",
    nomineeName: "गोपाल प्रजापत",
    nomineeRelation: "पिता",
    workerName: "भंवरलाल जी",
    epinCode: "EPIN-300-2245",
    epinCategory: "300",
    epinAmount: 300,
    applicationFee: 11000,
    isActive: true,
    createdAt: "2020-09-08T10:00:00.000Z",
  },
  {
    id: "app_mayra_03",
    appNo: "MYR-103",
    type: "MAYRA",
    applicantName: "कविता सैन",
    fatherName: "रतनलाल सैन",
    motherName: "बसन्ती देवी",
    gender: "महिला / Female",
    dob: "2006-03-25",
    age: 18,
    aadhar: "7345 6789 0123",
    gotra: "सैन",
    mobile: "9414234567",
    village: "बाड़मेर",
    pinCode: "344001",
    tehsil: "बाड़मेर",
    district: "बाड़मेर",
    state: "राजस्थान",
    nomineeName: "रतनलाल सैन",
    nomineeRelation: "पिता",
    workerName: "सुरेश कुमार",
    epinCode: "EPIN-300-3356",
    epinCategory: "300",
    epinAmount: 300,
    applicationFee: 10000,
    isActive: true,
    createdAt: "2022-01-15T10:00:00.000Z",
  },
];

// GET /api/applications?type=GENERAL_MARRIAGE
applicationsRouter.get("/", async (req: Request, res: Response) => {
  const { type } = req.query;
  try {
    // Try querying postgres
    const query = type
      ? `SELECT * FROM "applications" WHERE "type" = '${String(type).replace(/'/g, "''")}' ORDER BY "createdAt" DESC`
      : `SELECT * FROM "applications" ORDER BY "createdAt" DESC`;
    const rows = await (db as any).$queryRawUnsafe(query);
    if (Array.isArray(rows) && rows.length > 0) {
      return res.json({ success: true, applications: rows });
    }
    // Fallback to local memory store if database table is currently empty
    const filtered = type
      ? memoryApplications.filter((a) => a.type === type)
      : memoryApplications;
    return res.json({ success: true, applications: filtered });
  } catch {
    // Fallback to local memory store
    const filtered = type
      ? memoryApplications.filter((a) => a.type === type)
      : memoryApplications;
    return res.json({ success: true, applications: filtered });
  }
});

// POST /api/applications
applicationsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const {
      type = "GENERAL_MARRIAGE",
      applicantName,
      fatherName,
      motherName,
      gender,
      dob,
      age,
      aadhar,
      gotra,
      mobile,
      village,
      pinCode,
      tehsil,
      district,
      state,
      nomineeName,
      nomineeRelation,
      workerName,
      workerAgentCode,
      workerPhone,
      affidavit,
      epinCode,
      applicantPhoto,
    } = req.body;

    const isMayra = type === "MAYRA";
    if (!applicantName || !fatherName || age === undefined || age === null || !epinCode) {
      return res.status(400).json({
        success: false,
        error: isMayra
          ? "भाणेज/भाणजी का नाम, पिता का नाम, आयु एवं ई-पिन कोड अनिवार्य हैं।"
          : "आवेदक का नाम, पिता का नाम, आयु एवं ई-पिन कोड अनिवार्य हैं।",
      });
    }

    const ageNum = parseInt(String(age), 10);
    if (isNaN(ageNum) || ageNum < 10) {
      return res.status(400).json({
        success: false,
        error: "आयु 10 वर्ष से अधिक होना अनिवार्य है।",
      });
    }

    const pricing = calculateAgePricing(ageNum);
    if (!pricing) {
      return res.status(400).json({
        success: false,
        error: "आयु वर्ग हेतु निर्धारित ई-पिन एवं शुल्क नियम प्राप्त नहीं हुआ।",
      });
    }

    const upperPin = String(epinCode).trim().toUpperCase();
    const resolvedCategory = pricing.category || req.body.epinCategory || "100";
    const resolvedEpinAmount = pricing.epinAmount || (resolvedCategory === "200" ? 200 : resolvedCategory === "300" ? 300 : 100);
    const resolvedFee = req.body.applicationFee ? Number(req.body.applicationFee) : pricing.applicationFee;

    // Verify E-Pin format/category
    if (upperPin) {
      const pinCatMatch = upperPin.match(/EPIN-(\d+)-/);
      const pinCat = pinCatMatch ? pinCatMatch[1] : req.body.epinCategory || pricing.category;

      if (pinCat !== pricing.category) {
        return res.status(400).json({
          success: false,
          error: `आयु एवं ई-पिन श्रेणी बेमेल! दर्ज आयु (${ageNum} वर्ष) हेतु Category ${pricing.category} (₹${pricing.epinAmount}) ई-पिन आवश्यक है, जबकि आपका ई-पिन Category ${pinCat} है।`,
        });
      }
    }

    const prefix = type === "MAYRA" ? "MYR" : "GEN";
    const nextSeq = 100 + memoryApplications.length + 1;
    const appNo = `${prefix}-${nextSeq}`;

    const newApp = {
      id: `app_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      appNo,
      applicantName,
      fatherName,
      motherName: motherName || null,
      gender: gender || null,
      dob: dob || null,
      age: ageNum,
      aadhar: aadhar || null,
      gotra: gotra || null,
      mobile: mobile || null,
      village: village || null,
      pinCode: pinCode || null,
      tehsil: tehsil || null,
      district: district || null,
      state: state || null,
      nomineeName: nomineeName || null,
      nomineeRelation: nomineeRelation || null,
      workerName: workerName || null,
      workerAgentCode: workerAgentCode || null,
      workerPhone: workerPhone || null,
      affidavit: affidavit || null,
      applicantPhoto: applicantPhoto || null,
      epinCode: upperPin,
      epinCategory: resolvedCategory,
      epinAmount: resolvedEpinAmount,
      applicationFee: resolvedFee,
      paymentMode: req.body.paymentMode || "नकद (Cash)",
      paymentRef: req.body.paymentRef || null,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentStatus: "PAID",
      status: "PENDING",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to Postgres (with queryRawUnsafe fallback to memory)
    try {
      await (db as any).$executeRawUnsafe(
        `INSERT INTO "applications" (
          "id", "type", "appNo", "applicantName", "fatherName", "motherName",
          "gender", "dob", "age", "aadhar", "gotra", "mobile", "village",
          "pinCode", "tehsil", "district", "state", "nomineeName", "nomineeRelation",
          "workerName", "affidavit", "epinCode", "epinCategory", "epinAmount",
          "applicationFee", "paymentMode", "paymentDate", "paymentStatus", "status",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
          $29, NOW(), NOW()
        )`,
        newApp.id,
        newApp.type,
        newApp.appNo,
        newApp.applicantName,
        newApp.fatherName,
        newApp.motherName,
        newApp.gender,
        newApp.dob,
        newApp.age,
        newApp.aadhar,
        newApp.gotra,
        newApp.mobile,
        newApp.village,
        newApp.pinCode,
        newApp.tehsil,
        newApp.district,
        newApp.state,
        newApp.nomineeName,
        newApp.nomineeRelation,
        newApp.workerName,
        newApp.affidavit,
        newApp.epinCode,
        newApp.epinCategory,
        newApp.epinAmount,
        newApp.applicationFee,
        newApp.paymentMode,
        newApp.paymentDate,
        newApp.paymentStatus,
        newApp.status
      );
    } catch {
      // Memory store fallback
      memoryApplications.unshift(newApp);
    }

    return res.json({
      success: true,
      message: "आवेदन सफलतापूर्वक दर्ज हुआ।",
      application: newApp,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "आवेदन दर्ज करने में त्रुटि",
    });
  }
});
