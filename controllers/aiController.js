const Groq = require("groq-sdk");
const fs = require("fs");

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Base identity - The strict rules are added dynamically below
const SYSTEM_PROMPT =
  "You are a professional, polite technical interviewer. Your goal is to assess the candidate. Keep your answers concise (max 2 sentences) to keep the voice conversation natural. Do not be repetitive.";

/**
 * Transcribe audio file using Groq Whisper API
 */
const transcribeAudio = async (audioFilePath) => {
  try {
    const audioFile = fs.createReadStream(audioFilePath);
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: "en",
      temperature: 0.0,
    });
    return transcription.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
};

/**
 * Get AI chat response using Groq Llama API
 * Updated with STRICT INTERVIEWER RULES
 */
const getChatResponse = async (
  userMessage,
  conversationHistory = [],
  context = null,
  jobContext = null
) => {
  try {
    // Build dynamic system prompt
    let systemPrompt = SYSTEM_PROMPT;

    // Add job context if provided (takes priority)
    if (jobContext) {
      const jobPrefix = `You are interviewing for the role: ${jobContext.roleTitle}. 
Job Requirements: ${jobContext.jobDescription}
Difficulty Level: ${jobContext.difficulty}
Adjust your questions and expectations based on this ${jobContext.difficulty} difficulty level. `;
      systemPrompt = jobPrefix + SYSTEM_PROMPT;
      console.log("💼 Using job-specific context for interview");
    }

    // Add resume context if provided
    if (context) {
      const contextPrefix = `The candidate is ${context.fullName}. Skills: ${
        context.technicalSkills?.join(", ") || "Not specified"
      }. Focus questions on: ${
        context.mostImpressiveProject || "their experience"
      }. `;
      systemPrompt = contextPrefix + systemPrompt;
      console.log("📋 Using resume-aware context for interview");
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
      stream: false,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "";
    if (!aiResponse) throw new Error("Empty response from AI");
    return aiResponse;
  } catch (error) {
    console.error("Chat completion error:", error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};

/**
 * Analyze interview transcript using Groq (Llama 3)
 */
const analyzeInterview = async (conversationHistory, jobContext = null) => {
  try {
    const transcript = conversationHistory
      .map(
        (msg) =>
          `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}`
      )
      .join("\n\n");

    // Build analysis prompt with job context if available
    let analysisSystemPrompt = `You are an expert Technical Interviewer. `;

    if (jobContext) {
      analysisSystemPrompt += `You are analyzing an interview for: ${jobContext.roleTitle}
Role Requirements: ${jobContext.jobDescription}
Difficulty Level: ${jobContext.difficulty}
Adjust your scoring based on the ${jobContext.difficulty} difficulty level. `;
    }

    analysisSystemPrompt += `
        Analyze the following interview transcript. 
        Return a STRICT JSON object (no markdown, no plain text) with these fields:
        - "technical_score": (integer 0-100)
        - "communication_score": (integer 0-100)
        - "confidence_score": (integer 0-100)
        - "feedback": (array of 3 objects, each having: "topic", "feedback", "better_answer")
        
        CRITICAL: Return ONLY valid JSON.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: analysisSystemPrompt },
        {
          role: "user",
          content: `Here is the transcript:\n\n${transcript}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    // --- THE FIX IS HERE ---
    let rawContent = completion.choices[0]?.message?.content || "{}";

    // 1. Strip Markdown Code Blocks (```json ... ```)
    // This is what was breaking it before!
    let cleanJson = rawContent
      .replace(/```json/g, "") // Remove start tag
      .replace(/```/g, "") // Remove end tag
      .trim(); // Remove whitespace

    let analysis;
    try {
      analysis = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Failed on:", cleanJson);
      // Emergency fallback structure if AI outputs total garbage
      analysis = {
        technical_score: 0,
        communication_score: 0,
        confidence_score: 0,
        feedback: [],
      };
    }

    // 2. Validate & Fill Defaults (Safeguard)
    // If AI gives real scores, we use them. If missing, we default to 70 (passing).
    if (typeof analysis.technical_score !== "number")
      analysis.technical_score = 70;
    if (typeof analysis.communication_score !== "number")
      analysis.communication_score = 70;
    if (typeof analysis.confidence_score !== "number")
      analysis.confidence_score = 70;

    // Ensure feedback is valid
    if (!Array.isArray(analysis.feedback) || analysis.feedback.length === 0) {
      analysis.feedback = [
        {
          topic: "General",
          feedback: "Interview completed.",
          better_answer: "N/A",
        },
        {
          topic: "Communication",
          feedback: "Clear speech.",
          better_answer: "N/A",
        },
        {
          topic: "Technical",
          feedback: "Good effort.",
          better_answer: "N/A",
        },
      ];
    }

    return analysis;
  } catch (error) {
    console.error("Interview analysis error:", error);
    throw new Error(`Failed to analyze interview: ${error.message}`);
  }
};

// --- MIDDLEWARE FUNCTIONS ---

const transcribeAudioMiddleware = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No audio file provided",
        message: "Please upload an audio file",
      });
    }
    const transcription = await transcribeAudio(req.file.path);
    res.json({ success: true, transcription: transcription });
  } catch (error) {
    console.error("Transcription middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Transcription failed",
      message: error.message,
    });
  }
};

const getChatResponseMiddleware = async (req, res) => {
  try {
    const { message, history, context, jobContext } = req.body;
    if (!message) {
      return res.status(400).json({
        error: "No message provided",
        message: "Please provide a message",
      });
    }
    const response = await getChatResponse(
      message,
      history || [],
      context || null,
      jobContext || null
    );
    res.json({ success: true, response: response });
  } catch (error) {
    console.error("Chat middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Chat completion failed",
      message: error.message,
    });
  }
};

const analyzeInterviewMiddleware = async (req, res) => {
  try {
    const {
      history,
      jobContext,
      candidateName,
      jobRole,
      difficulty,
      duration,
      recruiterId, // NEW
      jobId, // NEW
    } = req.body;

    console.log("📊 Analyze Request Received:");
    console.log("  - Candidate:", candidateName);
    console.log("  - Recruiter ID:", recruiterId);
    console.log("  - Job ID:", jobId);
    console.log("  - History length:", history?.length);

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({
        error: "No conversation history",
        message: "Please provide history",
      });
    }

    // Validate required fields
    if (!recruiterId || !jobId) {
      return res.status(400).json({
        error: "Missing recruiter or job ID",
        message: "recruiterId and jobId are required",
      });
    }

    console.log(
      "📊 Analyzing interview for:",
      candidateName,
      "| Role:",
      jobRole,
      "| Recruiter:",
      recruiterId
    );

    // Analyze the interview
    const analysis = await analyzeInterview(history, jobContext || null);

    console.log("✅ Analysis complete. Scores:", {
      technical: analysis.technical_score,
      communication: analysis.communication_score,
      confidence: analysis.confidence_score,
    });

    // Build full transcript
    const fullTranscript = history.map((msg) => ({
      role: msg.role === "assistant" ? "interviewer" : "candidate",
      content: msg.content,
      timestamp: msg.timestamp || new Date(),
    }));

    // Save to database
    try {
      const {
        saveInterviewResult,
      } = require("../controllers/interviewResultsController");

      const interviewResultData = {
        jobId: jobId,
        recruiterId: recruiterId,
        candidateName: candidateName || "Anonymous",
        candidateEmail: null,
        technicalScore: analysis.technical_score || 70,
        communicationScore: analysis.communication_score || 70,
        confidenceScore: analysis.confidence_score || 70,
        feedback: analysis.feedback || [],
        fullTranscript: fullTranscript,
        jobRole: jobRole || "Practice Interview",
        difficulty: difficulty || "N/A",
        duration: duration || "N/A",
      };

      const savedInterview = await saveInterviewResult(interviewResultData);

      console.log("✅ Interview saved to database:", savedInterview._id);

      res.json({
        success: true,
        analysis: analysis,
        interviewId: savedInterview._id,
        message: "Interview completed and saved successfully",
      });
    } catch (dbError) {
      console.error("⚠️ Database save failed:", dbError.message);

      // Still return analysis even if save fails
      res.json({
        success: true,
        analysis: analysis,
        dbWarning: "Analysis completed but database save failed",
      });
    }
  } catch (error) {
    console.error("Analysis middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Analysis failed",
      message: error.message,
    });
  }
};

module.exports = {
  transcribeAudio,
  getChatResponse,
  transcribeAudioMiddleware,
  getChatResponseMiddleware,
  analyzeInterview,
  analyzeInterviewMiddleware,
};
