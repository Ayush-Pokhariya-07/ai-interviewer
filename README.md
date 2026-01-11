🎙️ TalenTrack:
AI-Powered Interview & Screening SystemNote: This project is currently in the Beta phase. We are actively refining the voice latency and resume parsing logic.

🎯 Problem Statement
In high-volume recruitment, Human Resources teams are often overwhelmed. Screening thousands of resumes manually leads to fatigue, unconscious bias, and slow hiring cycles. Furthermore, scheduling initial screening rounds is a logistical nightmare, and static text-based forms fail to capture a candidate's communication skills or personality.

The Gap: There is no centralized system that automates the entire initial screening process—from parsing a resume to conducting a conversational, voice-based technical interview—without human intervention.

💡 Solution Overview
TalenTrack is an automated hiring pipeline. It accepts a candidate's resume, analyzes it to generate a relevant question bank, and conducts a real-time, voice-based interview using a generative AI avatar.

Key capabilities:
Resume Parsing: Extracts skills and experience to tailor the interview.
Contextual Questioning: The AI adapts follow-up questions based on candidate answers, not just a static list.Voice Interaction: Uses low-latency Text-to-Speech (TTS) and Speech-to-Text (STT) for a natural conversational flow.
Automated Scoring: Provides HR with a breakdown of technical accuracy and soft skills.

🧱 System Components
The architecture follows a microservices-inspired approach to ensure the heavy AI processing doesn't block the user interface.
Frontend (Client):

> Built with React.js (Vite) + Tailwind CSS.
> Handles real-time audio recording and visualization (Web Audio API).

Backend API (Orchestrator):
Node.js / Express. Acts as the traffic controller.
Manages WebSocket connections for streaming audio.

AI Logic Layer:
Python (FastAPI) wrapper around LLMs (OpenAI GPT-4 / LLaMA).
Generates dynamic interview questions and analyzes responses.

Voice Generation Service:
Integration with ElevenLabs/OpenAI Whisper.
Handles the conversion of text responses into realistic audio streams.

Database:
MongoDB: Stores user profiles, structured resume data, and interview logs.
Redis: Used for caching active session states to reduce latency.

🏗️ High-Level System Architecture
We utilize an event-driven architecture to handle the asynchronous nature of voice processing.
The Flow:

1. User uploads PDF → Backend parses text → Stored in MongoDB.
2. Interview Start → WebSocket connection established.
3. User speaks → Audio chunks sent to Backend → Forwarded to STT Service.
4. Text sent to AI Logic Layer → Generates response.
5. Response sent to TTS Service → Audio stream played back to user.

🔄 Data Flow Diagrams (DFDs)

Level 0 (Context Diagram)
The user interacts with the Interview System. The system interacts with external entities: OpenAI API (Logic) and ElevenLabs (Voice).

Level 1 (Process Decomposition)

1. Auth Module: Verifies JWT tokens.
2. Upload Handler: Sanity checks PDF files, passes to parser.
3. Interview Engine:
   Input: Audio Stream.
   Process: Transcribe -> Context Lookup -> LLM Query -> Audio Gen.
   Output: Audio Stream + Text Log.
4. Reporting Module: Aggregates scores and serves the dashboard.

🗄️ Database Design
We chose MongoDB (NoSQL) because interview contexts and resume structures are highly variable (schema-less nature fits best).
Key Collections:
users: Auth details and role (Candidate/Recruiter).
interviews: Stores the session ID, timestamp, and final score.
messages: Array of objects containing { sender: "AI"|"User", text: "...", timestamp: "..." }.
resumes: Parsed JSON data from the uploaded PDF.

Relationships:
One User has many Resumes.
One Resume triggers one or many Interviews.

📈 Scalability & Future Growth
This section addresses how we plan to move from a prototype to production.

1. Horizontal Scaling: The Node.js backend is stateless. We can spin up multiple instances behind an Nginx Load Balancer to handle thousands of concurrent interviews.
2. Queue Management: Currently, resume parsing is synchronous. In production, we will implement RabbitMQ or BullMQ. When a user uploads a resume, it goes into a queue, decoupling the heavy parsing logic from the immediate API response.
3. WebSocket Optimization: To support 10k+ concurrent voice streams, we plan to migrate from standard Socket.io to a specialized Redis Adapter to broadcast messages across clustered server instances.
4. Database Sharding: As the log data grows, we will shard the MongoDB instance based on interview_id to speed up write operations.

🛡️ Failure Handling & Reliability
Reliability is critical during a live interview.We have implemented:
Graceful Degradation: If the Voice Generation service (ElevenLabs) times out, the system automatically falls back to a text-only chat interface so the interview doesn't crash.
Circuit Breakers: Implemented on the Python AI service. If the LLM API starts throwing 500 errors, we stop sending requests for 30 seconds to prevent cascading failures.
Session Recovery: If a user disconnects (internet loss), the interview state is saved in Redis. When they reconnect, the system pulls the context immediately, allowing them to resume exactly where they left off.
Data Validation: Strict Zod schema validation on the backend prevents malformed JSON from the AI service crashing the frontend.

🧪 Current Implementation Status
FeatureStatusNotesUser Auth (JWT)
✅ DoneResume PDF Parsing
✅ DoneUses PDF-ParseVoice-to-Text (STT)
✅ DoneOpenAI WhisperAI Response Logic
✅ DonePrompt engineering refinedText-to-Voice (TTS)
⚠️ PartialLatency optimization needed (<2s)Reporting Dashboard
📝 PlannedVisualization of scores

🔁 Git Workflow & Team Collaboration
We follow the Gitflow Workflow to ensure code stability.
main: Production-ready code.
develop: Integration branch for all new features.
feature/feature-name: Developers work here.
Pull Requests (PRs): Must pass linting checks and require 1 peer review before merging into develop.

📁 Repository StructureBash/root
├── /client # React Frontend
│ ├── /src
│ └── /public
├── /server # Node.js API Gateway
│ ├── /controllers
│ ├── /models
│ └── /routes
├── /ai-service # Python/FastAPI Microservice
│ ├── /prompts # System prompts for the Interviewer Persona
│ └── main.py
├── docker-compose.yml
└── README.md
▶️ DemoLive Link:
[Insert Vercel/Netlify Link Here]
Video Walkthrough: [Insert YouTube/Loom Link Here]
