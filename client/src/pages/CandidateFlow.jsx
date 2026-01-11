import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import InterviewRoom from "../components/InterviewRoom";
import ResumeUpload from "../components/ResumeUpload";
import { Loader2, AlertCircle, Briefcase, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* ================= UTILS ================= */

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// FIX 1: Changed 'absolute' to 'fixed' to prevent background from scrolling away or causing overflow
const GridPattern = () => (
  <div className="absolute inset-0 z-0 pointer-events-none fixed">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

/* ================= COMPONENT ================= */

const CandidateFlow = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* 🔴 NEW: recruiterId from query param */
  const recruiterId = searchParams.get("recruiter");

  const [resumeData, setResumeData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [jobError, setJobError] = useState(null);

  /* ================= FETCH JOB ================= */

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, recruiterId]);

  useEffect(() => {
    console.log("🔍 Job data:", jobData);
  }, [jobData]);

  const fetchJobDetails = async () => {
    setIsLoadingJob(true);
    setJobError(null);

    try {
      const response = await axios.get(`/api/jobs/${jobId}`, {
        params: { recruiter: recruiterId }, // ✅ recruiterId passed
      });

      if (response.data.success) {
        setJobData(response.data.data);
        console.log("💼 Job loaded:", response.data.data);
      }
    } catch (err) {
      console.error("Failed to load job:", err);
      setJobError(err.response?.data?.message || "Failed to load job details");
    } finally {
      setIsLoadingJob(false);
    }
  };

  const handleUploadSuccess = (data) => {
    console.log("Resume uploaded successfully:", data);
    setResumeData(data);
  };

  /* ================= LAYOUT WRAPPER ================= */

  const BackgroundWrapper = ({ children }) => (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <GridPattern />

      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#ccff00] rounded-full blur-[180px] opacity-[0.05]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#10b981] rounded-full blur-[150px] opacity-[0.03]" />

      <div className="relative z-10">{children}</div>
    </div>
  );

  /* ================= LOADING ================= */

  if (jobId && isLoadingJob) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#ccff00]/20 border-t-[#ccff00] animate-spin mx-auto"></div>
              <Loader2 className="w-8 h-8 text-[#ccff00] absolute inset-0 m-auto animate-pulse" />
            </div>
            <h2 className="text-2xl font-medium">Loading Job Details…</h2>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  /* ================= ERROR ================= */

  if (jobId && jobError) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111] rounded-2xl p-10 border border-white/10 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-medium mb-2">Connection Failed</h2>
            <p className="text-white/40 mb-6">{jobError}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-[#ccff00]"
            >
              Return Home
            </button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  /* ================= MAIN ================= */

  return (
    <BackgroundWrapper>
      {!resumeData ? (
        <div className="min-h-screen flex flex-col">
          {/* Top Nav */}
          <div className="p-6 flex justify-between items-center">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm text-white/60">BACK</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center pb-20">
            {jobData && (
              <div className="max-w-xl mx-auto mb-8 px-4">
                <div className="bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-xl p-4 flex items-center gap-4">
                  <Briefcase className="w-5 h-5 text-[#ccff00]" />
                  <div>
                    <div className="text-xs text-[#ccff00] uppercase font-mono">
                      Applying For
                    </div>
                    <div className="text-lg font-medium">
                      {jobData.roleTitle}
                    </div>
                  </div>
                  <div className="ml-auto text-xs bg-white/5 px-3 py-1 rounded-full">
                    {jobData.difficulty}
                  </div>
                </div>
              </div>
            )}

            <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      ) : (
        <>
          {/* Interview Header */}
          <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#ccff00] rounded-xl flex items-center justify-center font-bold text-black">
                  AI
                </div>
                <span className="text-sm text-white/40 font-mono">
                  INTERVIEW SESSION
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-white/40">Candidate</div>
                  <div className="text-sm font-medium">
                    {resumeData.fullName}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#ccff00] text-black flex items-center justify-center font-bold">
                  {resumeData.fullName.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto py-8 px-4 md:px-8">
            <InterviewRoom
              resumeData={resumeData}
              jobRole={jobData?.roleTitle}
              jobDescription={jobData?.jobDescription}
              difficulty={jobData?.difficulty}
              duration={jobData?.duration}
              jobId={jobId} /* ✅ NEW */
              recruiterId={recruiterId} /* ✅ NEW */
            />
          </main>
        </>
      )}
    </BackgroundWrapper>
  );
};

export default CandidateFlow;
