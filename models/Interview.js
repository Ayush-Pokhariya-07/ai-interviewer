const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  // Linking information
  recruiterId: {
    type: String,
    required: true,
    index: true, // For dashboard queries
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
    index: true,
  },

  // Candidate information
  candidateName: {
    type: String,
    required: true,
  },
  candidateEmail: {
    type: String,
    default: null,
  },

  // Job context
  jobRole: {
    type: String,
    default: "Practice Interview",
  },
  difficulty: {
    type: String,
    default: "N/A",
  },
  duration: {
    type: String,
    default: "N/A",
  },

  // Scoring
  technicalScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  communicationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  confidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // Derived overall score
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // Result
  result: {
    type: String,
    enum: ["Pass", "Fail", "Review", "Excellent"],
    default: "Review",
  },

  // Feedback and transcript
  feedback: {
    type: Array,
    default: [],
  },
  fullTranscript: {
    type: Array,
    default: [],
  },

  // Status
  status: {
    type: String,
    enum: ["in-progress", "completed", "abandoned"],
    default: "in-progress",
  },

  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient dashboard queries
InterviewSchema.index({ recruiterId: 1, createdAt: -1 });
InterviewSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model("Interview", InterviewSchema);
