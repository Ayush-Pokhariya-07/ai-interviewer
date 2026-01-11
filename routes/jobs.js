const express = require("express");
const router = express.Router();
const {
  createJobMiddleware,
  getJobMiddleware,
  getRecruiterJobsMiddleware, // NEW: Add import
} = require("../controllers/jobController");

/**
 * POST /api/jobs/create
 * Create a new job posting
 */
router.post("/create", createJobMiddleware);

/**
 * GET /api/jobs/recruiter/all
 * Get all jobs for a recruiter
 * Query params: ?recruiterId=xxx
 */
router.get("/recruiter/all", getRecruiterJobsMiddleware);

/**
 * GET /api/jobs/:id
 * Get job details by ID
 */
router.get("/:id", getJobMiddleware);

/**
 * GET /api/jobs/check/health
 * Health check
 */
router.get("/check/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Jobs Service",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
