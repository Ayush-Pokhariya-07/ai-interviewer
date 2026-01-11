const Job = require("../models/Job");

/**
 * Create a new job posting and return the ID
 *
 * @param {Object} jobData - Job details {roleTitle, jobDescription, difficulty, recruiterId}
 * @returns {Promise<Object>} - Created job object with ID
 */
const createJob = async (jobData) => {
  try {
    const job = new Job(jobData);
    await job.save();

    console.log("✅ Job created:", job._id);
    return job;
  } catch (error) {
    console.error("Job creation error:", error);
    throw new Error(`Failed to create job: ${error.message}`);
  }
};

/**
 * Get job details by ID
 *
 * @param {string} jobId - MongoDB ObjectId of the job
 * @returns {Promise<Object>} - Job details
 */
const getJob = async (jobId) => {
  try {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    console.log("📋 Job retrieved:", job.roleTitle);
    return job;
  } catch (error) {
    console.error("Job retrieval error:", error);
    throw new Error(`Failed to retrieve job: ${error.message}`);
  }
};

/**
 * Express middleware for creating a job
 */
const createJobMiddleware = async (req, res) => {
  try {
    const { roleTitle, jobDescription, difficulty, recruiterId } = req.body; // UPDATED: Added recruiterId

    // Validation
    if (!roleTitle || !jobDescription || !difficulty) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "Please provide roleTitle, jobDescription, and difficulty",
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: "Invalid difficulty",
        message: "Difficulty must be Easy, Medium, or Hard",
      });
    }

    const job = await createJob({
      roleTitle,
      jobDescription,
      difficulty,
      recruiterId, // UPDATED: Include recruiterId
    });

    res.status(201).json({
      success: true,
      data: {
        id: job._id,
        roleTitle: job.roleTitle,
        difficulty: job.difficulty,
        recruiterId: job.recruiterId, // UPDATED: Return recruiterId
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Create job middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Job creation failed",
      message: error.message,
    });
  }
};

/**
 * Express middleware for getting a job
 */
const getJobMiddleware = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Missing job ID",
        message: "Please provide a job ID",
      });
    }

    const job = await getJob(id);

    res.json({
      success: true,
      data: {
        id: job._id,
        roleTitle: job.roleTitle,
        jobDescription: job.jobDescription,
        difficulty: job.difficulty,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Get job middleware error:", error);
    res.status(404).json({
      success: false,
      error: "Job not found",
      message: error.message,
    });
  }
};

/**
 * NEW: Express middleware for getting all jobs for a recruiter
 */
const getRecruiterJobsMiddleware = async (req, res) => {
  try {
    const { recruiterId } = req.query;

    if (!recruiterId) {
      return res.status(400).json({
        success: false,
        error: "Missing recruiter ID",
        message: "Please provide a recruiterId query parameter",
      });
    }

    const jobs = await Job.find({ recruiterId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs.map((job) => ({
        id: job._id,
        roleTitle: job.roleTitle,
        jobDescription: job.jobDescription,
        difficulty: job.difficulty,
        duration: job.duration,
        createdAt: job.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get recruiter jobs error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch jobs",
      message: error.message,
    });
  }
};


/**
 * Get all jobs
 */
const getAllJobs = async (req, res) => {
    try {
        const { recruiterId } = req.query;

        // Filter by recruiterId if provided
        const filter = recruiterId ? { recruiterId } : {};

        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .select('recruiterId roleTitle jobDescription difficulty duration createdAt');

        // Get interview count for each job
        const Interview = require('../models/Interview');
        const jobsWithStats = await Promise.all(
            jobs.map(async (job) => {
                const interviewCount = await Interview.countDocuments({ jobId: job._id });
                const interviews = await Interview.find({ jobId: job._id })
                    .select('technicalScore communicationScore confidenceScore');

                const avgScore = interviews.length > 0
                    ? Math.round(interviews.reduce((acc, i) =>
                        acc + ((i.technicalScore + i.communicationScore + i.confidenceScore) / 3), 0) / interviews.length)
                    : 0;

                return {
                    id: job._id,
                    roleTitle: job.roleTitle,
                    jobDescription: job.jobDescription,
                    difficulty: job.difficulty,
                    duration: job.duration,
                    createdAt: job.createdAt,
                    interviewCount,
                    avgScore
                };
            })
        );

        res.json({
            success: true,
            data: jobsWithStats
        });
    } catch (error) {
        console.error('Get all jobs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch jobs',
            message: error.message
        });
    }
};

/**
 * Update a job
 */
const updateJobMiddleware = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleTitle, jobDescription, difficulty, duration } = req.body;

        const job = await Job.findByIdAndUpdate(
            id,
            { roleTitle, jobDescription, difficulty, duration },
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        console.log('✏️ Job updated:', job._id);
        res.json({
            success: true,
            data: {
                id: job._id,
                roleTitle: job.roleTitle,
                jobDescription: job.jobDescription,
                difficulty: job.difficulty,
                duration: job.duration,
                createdAt: job.createdAt
            }
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update job',
            message: error.message
        });
    }
};

/**
 * Delete a job (also deletes associated interviews)
 */
const deleteJobMiddleware = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findByIdAndDelete(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Delete associated interviews
        const Interview = require('../models/Interview');
        const deletedInterviews = await Interview.deleteMany({ jobId: id });

        console.log('🗑️ Job deleted:', id, `(${deletedInterviews.deletedCount} interviews)`);
        res.json({
            success: true,
            message: `Job deleted along with ${deletedInterviews.deletedCount} interviews`
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete job',
            message: error.message
        });
    }
};

/**
 * Get interviews for a specific job
 */
const getJobInterviews = async (req, res) => {
    try {
        const { id } = req.params;
        const Interview = require('../models/Interview');

        const interviews = await Interview.find({ jobId: id })
            .sort({ createdAt: -1 })
            .select('candidateName technicalScore communicationScore confidenceScore feedback createdAt');

        res.json({
            success: true,
            data: interviews.map(i => ({
                id: i._id,
                candidateName: i.candidateName,
                technicalScore: i.technicalScore,
                communicationScore: i.communicationScore,
                confidenceScore: i.confidenceScore,
                averageScore: Math.round((i.technicalScore + i.communicationScore + i.confidenceScore) / 3),
                feedback: i.feedback,
                createdAt: i.createdAt
            }))
        });
    } catch (error) {
        console.error('Get job interviews error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch interviews',
            message: error.message
        });
    }
};

module.exports = {
  createJob,
  getJob,
  createJobMiddleware,
  getJobMiddleware,
  getRecruiterJobsMiddleware, // NEW: Export the new function
};
