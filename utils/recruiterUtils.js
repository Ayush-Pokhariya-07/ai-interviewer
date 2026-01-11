const crypto = require("crypto");

/**
 * Generate a unique recruiter ID
 * Format: REC_<timestamp>_<random>
 * @returns {string} Unique recruiter ID
 */
const generateRecruiterId = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `REC_${timestamp}_${random}`;
};

/**
 * Generate interview link for sharing
 * @param {string} recruiterId - Recruiter's unique ID
 * @param {string} jobId - Job/Interview ID from MongoDB
 * @param {string} baseUrl - Frontend base URL (from env or config)
 * @returns {string} Full interview link
 */
const generateInterviewLink = (recruiterId, jobId, baseUrl = "") => {
  const frontendUrl =
    baseUrl || process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}/interview/${jobId}?recruiter=${recruiterId}`;
};

/**
 * Validate recruiter ID format
 * @param {string} recruiterId - Recruiter ID to validate
 * @returns {boolean}
 */
const isValidRecruiterId = (recruiterId) => {
  return /^REC_[a-z0-9]+_[a-f0-9]+$/.test(recruiterId);
};

module.exports = {
  generateRecruiterId,
  generateInterviewLink,
  isValidRecruiterId,
};
