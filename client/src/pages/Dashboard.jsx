import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import {
  BarChart3,
  ArrowLeft,
  Plus,
  User,
  Briefcase,
  Award,
  Search,
  Filter,
} from "lucide-react";
import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* ================= UTILS ================= */

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GlassPanel = ({ children, className }) => (
  <div
    className={cn(
      "bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl",
      className
    )}
  >
    {children}
  </div>
);

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
    ></div>
  </div>
);

/* ================= COMPONENT ================= */

const Dashboard = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH DATA ================= */

  // UPDATED: Added auto-refresh every 10 seconds
  useEffect(() => {
    fetchInterviews();
    // Refresh every 10 seconds to see new interviews
    const interval = setInterval(fetchInterviews, 10000);
    return () => clearInterval(interval);
  }, []);

  // UPDATED: Added console logs for debugging
  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get recruiter ID from localStorage
      const recruiterId = localStorage.getItem("recruiterId");
      console.log("📊 Fetching interviews for recruiter:", recruiterId); // NEW

      if (!recruiterId) {
        setInterviews([]);
        setError("No recruiter ID found. Please create a job first.");
        setIsLoading(false);
        return;
      }

      // Fetch interviews for this recruiter
      const response = await axios.get("/api/interview/recruiter-interviews", {
        params: { recruiterId },
      });

      console.log("✅ Interviews fetched:", response.data.data?.length); // NEW
      setInterviews(response.data.data || []);

      // Fetch statistics
      try {
        const statsResponse = await axios.get(
          "/api/interview/recruiter-stats",
          {
            params: { recruiterId },
          }
        );

        if (statsResponse.data.success) {
          console.log("✅ Stats fetched:", statsResponse.data.data); // NEW
          setStats(statsResponse.data.data);
        }
      } catch (statsErr) {
        console.warn("Failed to fetch stats:", statsErr);
      }
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setInterviews([]);
      if (err.response?.status !== 404) {
        setError("Unable to load interviews.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= CLICK HANDLER ================= */

  const handleViewInterview = async (interviewId) => {
    try {
      const recruiterId = localStorage.getItem("recruiterId");

      const response = await axios.get(
        `/api/interview/${interviewId}/details`,
        { params: { recruiterId } }
      );

      if (response.data.success) {
        console.log("Interview Details:", response.data.data);

        // Option 2: Navigate to detail page (you can create this page)
        // navigate(`/interview/${interviewId}/details`, {
        //     state: { interview: response.data.data }
        // });
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
    }
  };

  /* ================= HELPERS ================= */

  const getScoreBadgeColor = (score) => {
    if (score >= 80)
      return "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20";
    if (score >= 60) return "bg-white/5 text-white border-white/10";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const calculateAverageScore = () => {
    if (!interviews.length) return 0;
    const sum = interviews.reduce((acc, i) => acc + (i.technicalScore || 0), 0);
    return Math.round(sum / interviews.length);
  };

  const activeJobs = interviews.filter(
    (i) => i.jobRole && i.jobRole !== "Practice"
  ).length;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <GridPattern />

      {/* HEADER */}
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg bg-white/5 border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-lg font-medium">
              Recruiter <span className="text-white/40">Dashboard</span>
            </h1>
          </div>

          <button
            onClick={() => navigate("/recruiter")}
            className="px-6 py-2 bg-[#ccff00] text-black rounded-full font-bold"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            New Job
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <GlassPanel className="rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <User className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-white/40 font-mono text-xs uppercase tracking-widest mb-2">
                Total Candidates
              </p>
              <div className="text-5xl font-bold tracking-tight text-white mb-2">
                {stats?.totalInterviews || interviews.length}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#ccff00]">
                <span className="bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/20">
                  {
                    interviews.filter(
                      (i) => i.result === "Pass" || i.result === "Excellent"
                    ).length
                  }
                </span>
                <span className="text-white/40">candidates passed</span>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-8 rounded-2xl">
            <p className="text-white/40 text-xs uppercase">Active Roles</p>
            <div className="text-5xl font-bold">{activeJobs}</div>
          </GlassPanel>

          <GlassPanel className="rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award className="w-24 h-24 text-[#ccff00]" />
            </div>
            <div className="relative z-10">
              <p className="text-white/40 font-mono text-xs uppercase tracking-widest mb-2">
                Avg. Score
              </p>
              <div className="text-5xl font-bold tracking-tight text-[#ccff00] mb-2">
                {stats?.averageScore || 0}%
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <span className="bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  {stats?.passRate || 0}% pass rate
                </span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* NEW: Refresh Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium tracking-tight">
            Recent Interviews
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchInterviews()}
              className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm font-mono"
            >
              🔄 Refresh
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors w-64"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <GlassPanel className="rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center">Loading...</div>
          ) : error ? (
            <div className="p-20 text-center text-red-400">{error}</div>
          ) : interviews.length === 0 ? (
            <div className="p-20 text-center">No interviews yet.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-8 py-4 text-left text-xs text-white/40">
                    Candidate
                  </th>
                  <th className="px-8 py-4 text-left text-xs text-white/40">
                    Role
                  </th>
                  <th className="px-8 py-4 text-left text-xs text-white/40">
                    Email
                  </th>
                  <th className="px-8 py-4 text-left text-xs text-white/40">
                    Result
                  </th>
                  <th className="px-8 py-4 text-left text-xs text-white/40">
                    Score
                  </th>
                  <th className="px-8 py-4 text-left text-xs text-white/40">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {interviews.map((interview) => (
                  <tr
                    key={interview.id}
                    onClick={() => handleViewInterview(interview.id)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-black flex items-center justify-center font-bold">
                          {(interview.candidateName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium text-white group-hover:text-[#ccff00] transition-colors">
                          {interview.candidateName || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-white/80">
                        {interview.jobRole || "Practice"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-white/80">
                        {interview.candidateEmail || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border",
                          interview.result === "Excellent"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : interview.result === "Pass"
                            ? "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20"
                            : interview.result === "Review"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}
                      >
                        {interview.result || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-[#ccff00]/10 border-[#ccff00]/20 text-[#ccff00]">
                        {interview.overallScore || 0}%
                      </span>
                    </td>
                    <td className="px-8 py-5 text-white/40 text-sm font-mono">
                      {interview.completedAt
                        ? new Date(interview.completedAt).toLocaleDateString()
                        : "In Progress"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassPanel>
      </div>
    </div>
  );
};

export default Dashboard;
