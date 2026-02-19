import express from "express";
import { AuthController, ResumeController } from "../controllers/index.js";
import authenticateToken from "../middlewares/auth_middleware.js";
const router = express.Router();

// Auth routes
router.post("/auth/login-request", AuthController.loginRequest);
router.post("/auth/verify-otp", AuthController.verifyOtp);
router.post("/auth/refresh-token", AuthController.refreshToken);

router.get("/public/analysis/:slug", ResumeController.getResumeAnalysis);

router.use(authenticateToken);

// Upload
router.post("/upload/create-signed-url", ResumeController.createSignedUrl);

// Process
router.post("/process", ResumeController.processResume);
router.get("/reports", ResumeController.getUserReports);
router.get("/analysis/:slug", ResumeController.getResumeAnalysis);
router.put(
  "/analysis/:slug/visibility",
  ResumeController.updateReportVisibility,
);

export default router;
