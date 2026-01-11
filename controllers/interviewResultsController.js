const Interview = require("../models/Interview");
const Job = require("../models/Job");

/**
 * Save completed interview with scores and transcript
 */
const saveInterviewResult = async (interviewData) => {
  try {
    const {
      jobId,
      recruiterId,
      candidateName,
      candidateEmail,
      technicalScore,
      communicationScore,
      confidenceScore,
      feedback,
      fullTranscript,
      jobRole,
      difficulty,
      duration,
    } = interviewData;

    // Calculate overall score
    const overallScore = Math.round(
      (technicalScore + communicationScore + confidenceScore) / 3
    );

    // Determine result
    const result = getResult(overallScore);

    // Create interview record
    const interview = new Interview({
      jobId,
      recruiterId,
      candidateName,
      candidateEmail: candidateEmail || null,
      technicalScore,
      communicationScore,
      confidenceScore,
      overallScore,
      result,
      feedback,
      fullTranscript,
      jobRole,
      difficulty,
      duration,
      status: "completed",
      completedAt: new Date(),
    });

    await interview.save();
    console.log("✅ Interview saved:", interview._id);

    // Update job interview count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { interviewCount: 1 },
    });

    return interview;
  } catch (error) {
    console.error("Interview save error:", error);
    throw new Error(`Failed to save interview: ${error.message}`);
  }
};

/**
 * Get all interviews for a recruiter
 */
const getRecruiterInterviews = async (recruiterId, jobId = null) => {
  try {
    const query = { recruiterId };
    if (jobId) {
      query.jobId = jobId;
    }

    const interviews = await Interview.find(query)
      .sort({ completedAt: -1, createdAt: -1 })
      .populate("jobId", "roleTitle difficulty");

    return interviews;
  } catch (error) {
    console.error("Error fetching recruiter interviews:", error);
    throw new Error(`Failed to fetch interviews: ${error.message}`);
  }
};

/**
 * Get single interview details
 */
const getInterviewDetails = async (interviewId, recruiterId = null) => {
  try {
    const interview = await Interview.findById(interviewId).populate("jobId");

    if (!interview) {
      throw new Error("Interview not found");
    }

    // Validate recruiter ownership if provided
    if (recruiterId && interview.recruiterId !== recruiterId) {
      throw new Error(
        "Unauthorized: Interview does not belong to this recruiter"
      );
    }

    return interview;
  } catch (error) {
    console.error("Error fetching interview details:", error);
    throw new Error(`Failed to fetch interview: ${error.message}`);
  }
};

/**
 * Determine result based on overall score
 */
const getResult = (overallScore) => {
  if (overallScore >= 90) return "Excellent";
  if (overallScore >= 75) return "Pass";
  if (overallScore >= 60) return "Review";
  return "Fail";
};

/**
 * Get interview statistics for recruiter
 */
const getRecruiterStats = async (recruiterId) => {
  try {
    const interviews = await Interview.find({
      recruiterId,
      status: "completed",
    });

    if (interviews.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        passRate: 0,
        resultBreakdown: { Excellent: 0, Pass: 0, Review: 0, Fail: 0 },
      };
    }

    const totalInterviews = interviews.length;
    const averageScore = Math.round(
      interviews.reduce((sum, i) => sum + i.overallScore, 0) / totalInterviews
    );

    const passCount = interviews.filter(
      (i) => i.result === "Pass" || i.result === "Excellent"
    ).length;
    const passRate = Math.round((passCount / totalInterviews) * 100);

    const resultBreakdown = {
      Excellent: interviews.filter((i) => i.result === "Excellent").length,
      Pass: interviews.filter((i) => i.result === "Pass").length,
      Review: interviews.filter((i) => i.result === "Review").length,
      Fail: interviews.filter((i) => i.result === "Fail").length,
    };

    return {
      totalInterviews,
      averageScore,
      passRate,
      resultBreakdown,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    throw new Error(`Failed to calculate stats: ${error.message}`);
  }
};

// === MIDDLEWARE FUNCTIONS ===

/**
 * Middleware: Save interview result
 */
const saveInterviewMiddleware = async (req, res) => {
  try {
    const {
      jobId,
      recruiterId,
      candidateName,
      candidateEmail,
      technicalScore,
      communicationScore,
      confidenceScore,
      feedback,
      fullTranscript,
      jobRole,
      difficulty,
      duration,
    } = req.body;

    // Validation
    if (!jobId || !recruiterId || !candidateName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "jobId, recruiterId, and candidateName are required",
      });
    }

    const interview = await saveInterviewResult({
      jobId,
      recruiterId,
      candidateName,
      candidateEmail,
      technicalScore,
      communicationScore,
      confidenceScore,
      feedback,
      fullTranscript,
      jobRole,
      difficulty,
      duration,
    });

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview._id,
        candidateName: interview.candidateName,
        overallScore: interview.overallScore,
        result: interview.result,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    console.error("Save interview middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save interview",
      message: error.message,
    });
  }
};

/**
 * Middleware: Get recruiter interviews
 */
const getRecruiterInterviewsMiddleware = async (req, res) => {
  try {
    const { recruiterId, jobId } = req.query;

    if (!recruiterId) {
      return res.status(400).json({
        success: false,
        error: "Missing recruiter ID",
        message: "Recruiter ID is required",
      });
    }

    const interviews = await getRecruiterInterviews(recruiterId, jobId);

    res.json({
      success: true,
      data: interviews.map((interview) => ({
        id: interview._id,
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        jobRole: interview.jobRole || "Practice Interview",
        overallScore: interview.overallScore,
        result: interview.result,
        completedAt: interview.completedAt,
        technicalScore: interview.technicalScore,
        communicationScore: interview.communicationScore,
        confidenceScore: interview.confidenceScore,
      })),
    });
  } catch (error) {
    console.error("Get recruiter interviews error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch interviews",
      message: error.message,
    });
  }
};

/**
 * Middleware: Get interview details
 */
const getInterviewDetailsMiddleware = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { recruiterId } = req.query;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        error: "Missing interview ID",
        message: "Interview ID is required",
      });
    }

    const interview = await getInterviewDetails(interviewId, recruiterId);

    res.json({
      success: true,
      data: {
        id: interview._id,
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        duration: interview.duration,
        technicalScore: interview.technicalScore,
        communicationScore: interview.communicationScore,
        confidenceScore: interview.confidenceScore,
        overallScore: interview.overallScore,
        result: interview.result,
        feedback: interview.feedback,
        fullTranscript: interview.fullTranscript,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    console.error("Get interview details error:", error);
    res.status(404).json({
      success: false,
      error: "Interview not found",
      message: error.message,
    });
  }
};

/**
 * Middleware: Get recruiter statistics
 */
const getRecruiterStatsMiddleware = async (req, res) => {
  try {
    const { recruiterId } = req.query;

    if (!recruiterId) {
      return res.status(400).json({
        success: false,
        error: "Missing recruiter ID",
        message: "Recruiter ID is required",
      });
    }

    const stats = await getRecruiterStats(recruiterId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
};

module.exports = {
  saveInterviewResult,
  getRecruiterInterviews,
  getInterviewDetails,
  getRecruiterStats,
  saveInterviewMiddleware,
  getRecruiterInterviewsMiddleware,
  getInterviewDetailsMiddleware,
  getRecruiterStatsMiddleware,
};
