<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  route: {
    type: String,
    required: true,
  },
});

const { $http } = useNuxtApp();
const isLoading = ref(true);
const error = ref(null);
const analysis = ref(null);
const activeTab = ref("rewrites");
const expandedTip = ref(null);
const visibility = ref(null);
const isOwner = ref(false);
const isUpdatingVisibility = ref(false);
const showShareModal = ref(false);

const isShareRoute = computed(() => props.route === "/public/analysis");

const getSkillLevelWidth = (level) => {
  const map = { none: 0, beginner: 25, intermediate: 50, advanced: 100 };
  return map[level] || 0;
};

const getPriorityColor = (priority) => {
  const map = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    met: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return map[priority] || map.medium;
};

const getAtsColor = (score) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
};

const getAtsRingColor = (score) => {
  if (score >= 75) return "stroke-emerald-500";
  if (score >= 50) return "stroke-yellow-500";
  return "stroke-red-500";
};

const getVerdictBadge = (verdict) => {
  if (verdict?.includes("pass")) return "bg-emerald-500/20 text-emerald-400";
  if (verdict?.includes("Borderline"))
    return "bg-yellow-500/20 text-yellow-400";
  return "bg-red-500/20 text-red-400";
};

const getScoreColor = (score) => {
  if (score >= 9) return "text-emerald-400";
  if (score >= 7) return "text-indigo-400";
  if (score >= 5) return "text-yellow-400";
  return "text-red-400";
};

const getProgressColor = (score) => {
  if (score >= 9)
    return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  if (score >= 7) return "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]";
  if (score >= 5) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
  return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
};

const getResumeAnalysis = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await $http.get(`${props.route}/${props.slug}`);
    if (response.success) {
      analysis.value = response.analysis;
      visibility.value = response.visibility || "private";
      isOwner.value = response.isOwner || false;
    } else {
      error.value = response.message || "Failed to load analysis.";
    }
  } catch (err) {
    error.value = err.message || "An unexpected error occurred.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getResumeAnalysis();
});

const shareUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/share/${props.slug}`;
  }
  return "";
});

const toggleVisibility = async () => {
  if (isUpdatingVisibility.value) return;
  isUpdatingVisibility.value = true;
  try {
    const newVisibility = visibility.value === "private" ? "public" : "private";
    const response = await $http.put(`/analysis/${props.slug}/visibility`, {
      visibility: newVisibility,
    });
    if (response.success) {
      visibility.value = response.visibility;
      if (newVisibility === "public") {
        showShareModal.value = true;
      }
    }
  } catch (err) {
    console.error("Failed to update visibility:", err);
  } finally {
    isUpdatingVisibility.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-[#0B0C15] text-slate-300 font-[Outfit] selection:bg-indigo-500/30 overflow-x-hidden"
  >
    <!-- Deep Space Background with Noise & Mesh -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div
        class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"
      ></div>
      <div
        class="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-slow"
      ></div>
      <div
        class="absolute bottom-[-20%] right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[150px] animate-pulse-slow delay-1000"
      ></div>
    </div>

    <!-- Main Container -->
    <div class="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-12">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="min-h-[60vh] flex flex-col items-center justify-center text-center"
      >
        <div class="relative w-20 h-20 mb-8">
          <div
            class="absolute inset-0 rounded-full border-4 border-slate-800"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"
          ></div>
        </div>
        <h2 class="text-2xl font-semibold text-white mb-2">Analyzing Resume</h2>
        <p class="text-slate-400 max-w-md">
          Our AI is reviewing your experience, skills, and potential fit. This
          usually takes a few seconds...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="min-h-[60vh] flex flex-col items-center justify-center text-center"
      >
        <div
          class="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 ring-1 ring-red-500/20"
        >
          <svg
            class="w-10 h-10 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-white mb-2">Analysis Failed</h2>
        <p class="text-slate-400 max-w-md mb-8">
          {{ error }}
        </p>
        <button
          @click="getResumeAnalysis"
          class="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all duration-300 shadow-lg shadow-violet-500/25 active:scale-95"
        >
          Try Again
        </button>
      </div>

      <!-- Success State -->
      <div v-else-if="analysis" class="animate-fade-in space-y-12">
        <!-- Header Section -->
        <header
          class="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto relative group"
        >
          <!-- Spotlight Effect behind text -->
          <div
            class="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
          ></div>

          <div class="relative">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold tracking-widest uppercase shadow-lg backdrop-blur-md"
            >
              <span
                class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"
              ></span>
              AI Analysis Complete
            </span>
          </div>

          <h1
            class="relative text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight"
          >
            {{ analysis.candidate_name || "Candidate" }}
          </h1>
          <p class="text-lg text-indigo-300 font-medium">
            {{ analysis.inferred_target_role }}
          </p>

          <div class="flex flex-col items-center gap-2">
            <p class="text-lg text-indigo-200/80 max-w-2xl font-light">
              {{ analysis.executive_summary?.one_line }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4 relative z-20">
            <button
              v-if="!isShareRoute"
              @click="$router.push('/upload')"
              class="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium backdrop-blur-md"
            >
              Upload New Resume
            </button>
            <button
              v-if="isOwner && visibility === 'private'"
              @click="toggleVisibility"
              :disabled="isUpdatingVisibility"
              class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="isUpdatingVisibility"
                class="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg
                v-else
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
            <button
              v-else-if="isOwner && visibility === 'public'"
              @click="toggleVisibility"
              :disabled="isUpdatingVisibility"
              class="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-all text-sm font-medium backdrop-blur-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="isUpdatingVisibility"
                class="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg
                v-else
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Turn off sharing
            </button>
            <button
              v-if="isOwner && visibility === 'public'"
              @click="showShareModal = true"
              class="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-500/25"
              title="Open share link"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          </div>
        </header>

        <!-- Bento Grid Layout -->
        <main
          class="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-min"
        >
          <!-- 1. Overall Score (Large Card) - Top Left -->
          <div
            class="md:col-span-3 lg:col-span-4 row-span-2 relative group overflow-hidden rounded-3xl bg-[#13141F]/80 border border-white/5 backdrop-blur-xl shadow-2xl p-8 flex flex-col justify-between hover:border-indigo-500/30 transition-colors duration-500"
          >
            <div
              class="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            ></div>

            <div>
              <h3
                class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2"
              >
                Match Score
              </h3>
              <div class="flex items-baseline gap-2">
                <span
                  class="text-7xl font-bold text-white tracking-tighter drop-shadow-lg"
                  >{{ analysis.overall_fit?.rating }}</span
                >
                <span class="text-2xl text-slate-600">/10</span>
              </div>
              <div
                class="mt-2 text-xl text-emerald-400 font-medium flex items-center gap-2"
              >
                {{ analysis.overall_fit?.category }}
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>

            <div class="space-y-4 relative z-10">
              <div class="h-px w-full bg-white/5"></div>
              <div>
                <div class="text-xs text-slate-500 mb-1">Reasoning</div>
                <div class="text-sm text-slate-300 line-clamp-3">
                  {{ analysis.overall_fit?.reason }}
                </div>
              </div>
              <div>
                <div class="text-xs text-slate-500 mb-1">Confidence</div>
                <div class="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    class="bg-indigo-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    :style="{
                      width: `${
                        analysis.confidence_and_notes?.confidence_score * 100
                      }%`,
                    }"
                  ></div>
                </div>
              </div>
              <div v-if="analysis.confidence_and_notes?.assumptions">
                <div class="text-xs text-slate-500 mb-1">Assumptions</div>
                <div class="text-xs text-slate-400 leading-relaxed">
                  {{ analysis.confidence_and_notes.assumptions }}
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Analysis Summary - Top Middle -->
          <div
            class="md:col-span-3 lg:col-span-5 relative group rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:bg-[#13141F]/80 transition-colors"
          >
            <h3
              class="text-sm font-semibold text-white mb-3 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Executive Summary
            </h3>
            <p class="text-slate-400 leading-relaxed text-sm">
              {{ analysis.executive_summary?.["3_sentence"] }}
            </p>
          </div>

          <!-- 3. Section Scores (Vertical List) - Right Side -->
          <div
            class="md:col-span-6 lg:col-span-3 row-span-2 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 flex flex-col gap-4"
          >
            <h3 class="text-sm font-semibold text-white mb-2">
              Category Breakdown
            </h3>
            <div class="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="(score, section) in analysis.section_scores"
                :key="section"
                class="group"
              >
                <div class="flex justify-between items-center mb-1.5">
                  <span
                    class="text-xs text-slate-400 capitalize group-hover:text-white transition-colors"
                    >{{ section.replace(/_/g, " ") }}</span
                  >
                  <span
                    class="text-xs font-bold"
                    :class="getScoreColor(score)"
                    >{{ score }}</span
                  >
                </div>
                <div class="w-full bg-white/5 rounded-full h-1">
                  <div
                    class="h-1 rounded-full transition-all duration-1000 ease-out"
                    :class="getProgressColor(score)"
                    :style="{ width: `${score * 10}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Strengths - Middle Row -->
          <div
            class="md:col-span-3 lg:col-span-5 rounded-3xl bg-emerald-900/10 border border-emerald-500/10 backdrop-blur-md p-6 hover:border-emerald-500/20 transition-colors"
          >
            <h3
              class="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
              Strengths
            </h3>
            <ul class="space-y-3">
              <li
                v-for="(strength, i) in analysis.top_strengths"
                :key="i"
                class="flex gap-3 text-sm text-slate-300"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(16,185,129,0.8)]"
                ></div>
                {{ strength }}
              </li>
            </ul>
          </div>

          <div
            class="md:col-span-3 lg:col-span-6 rounded-3xl bg-red-900/5 border border-red-500/10 backdrop-blur-md p-6 hover:border-red-500/20 transition-colors"
          >
            <h3
              class="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              Critical Flags
            </h3>
            <ul class="space-y-3">
              <li
                v-for="(risk, i) in analysis.top_risks_or_red_flags"
                :key="i"
                class="flex gap-3 text-sm text-slate-300"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                ></div>
                {{ risk }}
              </li>
            </ul>
          </div>

          <!-- 5. Quantify Opportunities -->
          <div
            class="col-span-full md:col-span-6 lg:col-span-6 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6"
          >
            <h3 class="text-sm font-semibold text-white mb-4">
              Quantification Opportunities
            </h3>
            <div class="space-y-3">
              <div
                v-for="(opp, i) in analysis.quantify_opportunities"
                :key="i"
                class="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-colors"
              >
                <div class="text-xs text-violet-300 font-bold mb-1">
                  {{ opp.area }}
                </div>
                <div class="text-sm text-slate-400">
                  {{ opp.how_to_quantify }}
                </div>
              </div>
            </div>
          </div>

          <!-- 6. Missing Keywords (Tag Cloud) -->
          <div
            class="col-span-full md:col-span-6 lg:col-span-12 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-8 flex flex-col gap-6 relative overflow-hidden"
          >
            <!-- Background Decoration -->
            <div
              class="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"
            ></div>

            <div class="relative z-10">
              <h3 class="text-lg font-bold text-white mb-2">
                Missing Keywords
              </h3>
              <p class="text-sm text-slate-400 mb-4">
                Add these logic-based keywords to pass ATS filters for your
                target role.
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="keyword in analysis.missing_ats_keywords"
                  :key="keyword"
                  class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white hover:-translate-y-0.5 transition-all duration-300 cursor-default shadow-sm"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>

          <!-- 7. Salary Estimate & ATS Compatibility Row -->
          <div
            v-if="analysis.salary_estimate"
            class="md:col-span-3 lg:col-span-4 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors"
          >
            <div
              class="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"
            ></div>
            <div class="relative z-10">
              <h3
                class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Salary Estimate
              </h3>
              <div class="text-3xl font-bold text-white mb-1 tracking-tight">
                {{ analysis.salary_estimate.range }}
              </div>
              <div class="text-xs text-emerald-400 font-semibold mb-3">
                {{ analysis.salary_estimate.currency }}
              </div>
              <div class="h-px w-full bg-white/5 mb-3"></div>
              <p class="text-xs text-slate-400 leading-relaxed">
                {{ analysis.salary_estimate.basis }}
              </p>
            </div>
          </div>

          <!-- ATS Compatibility -->
          <div
            v-if="analysis.ats_compatibility"
            class="md:col-span-3 lg:col-span-4 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 relative overflow-hidden group hover:border-indigo-500/20 transition-colors"
          >
            <h3
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              ATS Compatibility
            </h3>
            <div class="flex items-center gap-6">
              <div class="relative w-20 h-20 shrink-0">
                <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke-width="6"
                    fill="none"
                    class="stroke-white/5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke-width="6"
                    fill="none"
                    stroke-linecap="round"
                    :class="getAtsRingColor(analysis.ats_compatibility.score)"
                    :stroke-dasharray="`${(analysis.ats_compatibility.score / 100) * 213.6} 213.6`"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span
                    class="text-lg font-bold"
                    :class="getAtsColor(analysis.ats_compatibility.score)"
                  >
                    {{ analysis.ats_compatibility.score }}
                  </span>
                </div>
              </div>
              <div class="flex-1">
                <span
                  class="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold mb-3"
                  :class="getVerdictBadge(analysis.ats_compatibility.verdict)"
                >
                  {{ analysis.ats_compatibility.verdict }}
                </span>
                <ul
                  v-if="analysis.ats_compatibility.issues?.length"
                  class="space-y-1.5"
                >
                  <li
                    v-for="(issue, i) in analysis.ats_compatibility.issues"
                    :key="i"
                    class="flex gap-2 text-xs text-slate-400"
                  >
                    <span class="text-red-400 shrink-0">•</span>
                    {{ issue }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Industry Benchmark & Word Count -->
          <div
            v-if="analysis.industry_benchmark"
            class="md:col-span-3 lg:col-span-4 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 relative overflow-hidden group hover:border-violet-500/20 transition-colors"
          >
            <h3
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Industry Benchmark
            </h3>
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-4xl font-bold text-white tracking-tighter">
                {{ analysis.industry_benchmark.percentile }}
              </span>
              <span class="text-sm text-slate-500">percentile</span>
            </div>
            <div class="text-xs text-violet-300 font-medium mb-3">
              vs {{ analysis.industry_benchmark.compared_to }}
            </div>
            <div class="w-full bg-white/5 rounded-full h-1.5 mb-3">
              <div
                class="bg-violet-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all duration-1000"
                :style="{ width: `${analysis.industry_benchmark.percentile}%` }"
              ></div>
            </div>
            <div class="h-px w-full bg-white/5 mb-3"></div>
            <div class="text-xs text-slate-500 mb-1">Standout Factor</div>
            <div class="text-xs text-slate-300">
              {{ analysis.industry_benchmark.standout_factor }}
            </div>
          </div>

          <!-- Word Count Analysis -->
          <div
            v-if="analysis.word_count_analysis"
            class="md:col-span-3 lg:col-span-4 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:border-white/10 transition-colors"
          >
            <h3
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Word Count
            </h3>
            <div class="flex items-baseline gap-3 mb-2">
              <span class="text-3xl font-bold text-white">
                {{ analysis.word_count_analysis.total_words }}
              </span>
              <span class="text-xs text-slate-500">words</span>
            </div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-slate-500">Ideal:</span>
              <span class="text-xs text-slate-400 font-medium">
                {{ analysis.word_count_analysis.ideal_range }}
              </span>
              <span
                class="ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                :class="
                  analysis.word_count_analysis.verdict === 'Within range'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                "
              >
                {{ analysis.word_count_analysis.verdict }}
              </span>
            </div>
            <p
              v-if="analysis.word_count_analysis.suggestion"
              class="text-xs text-slate-400 leading-relaxed"
            >
              {{ analysis.word_count_analysis.suggestion }}
            </p>
          </div>

          <!-- Action Verb Analysis -->
          <div
            v-if="analysis.action_verb_analysis"
            class="md:col-span-3 lg:col-span-4 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:border-white/10 transition-colors"
          >
            <div class="flex items-center justify-between mb-4">
              <h3
                class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Action Verbs
              </h3>
              <span
                class="text-lg font-bold"
                :class="getScoreColor(analysis.action_verb_analysis.score)"
              >
                {{ analysis.action_verb_analysis.score }}/10
              </span>
            </div>
            <div
              v-if="analysis.action_verb_analysis.strong_verbs?.length"
              class="mb-3"
            >
              <div
                class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1.5"
              >
                Strong
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="verb in analysis.action_verb_analysis.strong_verbs"
                  :key="verb"
                  class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20"
                >
                  {{ verb }}
                </span>
              </div>
            </div>
            <div v-if="analysis.action_verb_analysis.weak_verbs?.length">
              <div
                class="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1.5"
              >
                Weak
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="verb in analysis.action_verb_analysis.weak_verbs"
                  :key="verb"
                  class="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs border border-red-500/20 line-through"
                >
                  {{ verb }}
                </span>
              </div>
            </div>
          </div>

          <!-- Experience Timeline -->
          <div
            v-if="analysis.experience_timeline?.length"
            class="col-span-full lg:col-span-8 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:border-white/10 transition-colors"
          >
            <h3
              class="text-sm font-semibold text-white mb-6 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Career Timeline
            </h3>
            <div class="relative">
              <div
                class="absolute left-[7px] top-2 bottom-2 w-px bg-indigo-500/20"
              ></div>
              <div class="space-y-6">
                <div
                  v-for="(entry, i) in analysis.experience_timeline"
                  :key="i"
                  class="flex gap-4 relative"
                >
                  <div class="relative z-10 mt-1 shrink-0">
                    <div
                      class="w-[15px] h-[15px] rounded-full border-2 border-indigo-500 bg-[#13141F] flex items-center justify-center"
                    >
                      <div
                        class="w-[5px] h-[5px] rounded-full bg-indigo-500"
                      ></div>
                    </div>
                  </div>
                  <div class="flex-1 pb-1">
                    <div
                      class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-0.5"
                    >
                      {{ entry.period }}
                    </div>
                    <div class="text-sm text-white font-medium">
                      {{ entry.role }}
                    </div>
                    <div class="text-xs text-slate-500 mb-1">
                      {{ entry.company }}
                    </div>
                    <div class="text-xs text-slate-400 leading-relaxed">
                      {{ entry.growth_note }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cultural Fit Signals -->
          <div
            v-if="analysis.cultural_fit_signals?.length"
            class="col-span-full lg:col-span-4 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:border-white/10 transition-colors"
          >
            <h3
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Cultural Fit Signals
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="signal in analysis.cultural_fit_signals"
                :key="signal"
                class="px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-medium hover:bg-pink-500/20 transition-colors"
              >
                {{ signal }}
              </span>
            </div>
          </div>

          <!-- Skill Gap Analysis -->
          <div
            v-if="analysis.skill_gap_analysis?.length"
            class="col-span-full lg:col-span-12 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:border-white/10 transition-colors"
          >
            <h3
              class="text-sm font-semibold text-white mb-6 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Skill Gap Analysis
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(item, i) in analysis.skill_gap_analysis"
                :key="i"
                class="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm text-white font-medium">{{
                    item.skill
                  }}</span>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                    :class="getPriorityColor(item.priority)"
                  >
                    {{ item.priority }}
                  </span>
                </div>
                <div class="space-y-2">
                  <div>
                    <div
                      class="flex justify-between text-[10px] text-slate-500 mb-1"
                    >
                      <span>Current</span>
                      <span class="capitalize">{{ item.current_level }}</span>
                    </div>
                    <div class="w-full bg-white/5 rounded-full h-1">
                      <div
                        class="bg-cyan-500 h-1 rounded-full transition-all duration-700"
                        :style="{
                          width: `${getSkillLevelWidth(item.current_level)}%`,
                        }"
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div
                      class="flex justify-between text-[10px] text-slate-500 mb-1"
                    >
                      <span>Required</span>
                      <span class="capitalize">{{ item.required_level }}</span>
                    </div>
                    <div class="w-full bg-white/5 rounded-full h-1">
                      <div
                        class="bg-indigo-500/50 h-1 rounded-full transition-all duration-700"
                        :style="{
                          width: `${getSkillLevelWidth(item.required_level)}%`,
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Role Match Alternatives -->
          <div
            v-if="analysis.role_match_alternatives?.length"
            class="col-span-full lg:col-span-12 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:border-white/10 transition-colors"
          >
            <h3
              class="text-sm font-semibold text-white mb-6 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Also a Good Fit For
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                v-for="(alt, i) in analysis.role_match_alternatives"
                :key="i"
                class="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all group"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="relative w-12 h-12 shrink-0">
                    <svg class="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke-width="3"
                        fill="none"
                        class="stroke-white/5"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke-width="3"
                        fill="none"
                        stroke-linecap="round"
                        class="stroke-amber-500"
                        :stroke-dasharray="`${(alt.fit_score / 10) * 125.6} 125.6`"
                      />
                    </svg>
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <span class="text-xs font-bold text-amber-400">{{
                        alt.fit_score
                      }}</span>
                    </div>
                  </div>
                  <div class="text-sm text-white font-semibold">
                    {{ alt.role }}
                  </div>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed">
                  {{ alt.reason }}
                </p>
              </div>
            </div>
          </div>

          <!-- Tailoring Tips -->
          <div
            v-if="analysis.tailoring_tips?.length"
            class="col-span-full lg:col-span-12 rounded-3xl bg-[#13141F]/60 border border-white/5 backdrop-blur-md p-6 hover:border-white/10 transition-colors"
          >
            <h3
              class="text-sm font-semibold text-white mb-6 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              Resume Tailoring Tips
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="(tip, i) in analysis.tailoring_tips"
                :key="i"
                class="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden hover:border-teal-500/20 transition-colors"
              >
                <div class="p-5">
                  <div class="mb-3">
                    <span class="text-sm text-teal-300 font-bold">
                      {{ tip.target }}
                    </span>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="(change, j) in tip.changes"
                      :key="j"
                      class="flex gap-2 text-xs text-slate-400"
                    >
                      <span class="text-teal-500 shrink-0">→</span>
                      {{ change }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. Deep Dive Tabs (Rewrites & Prep & Action) -->
          <div class="col-span-full space-y-8 mt-4">
            <div class="flex justify-center">
              <div
                class="p-1 rounded-full bg-white/5 border border-white/5 flex gap-1 flex-wrap justify-center"
              >
                <button
                  @click="activeTab = 'rewrites'"
                  :class="{
                    'bg-indigo-600 text-white shadow-lg':
                      activeTab === 'rewrites',
                    'text-slate-400 hover:text-white': activeTab !== 'rewrites',
                  }"
                  class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
                >
                  Smart Rewrites
                </button>
                <button
                  @click="activeTab = 'prep'"
                  :class="{
                    'bg-indigo-600 text-white shadow-lg': activeTab === 'prep',
                    'text-slate-400 hover:text-white': activeTab !== 'prep',
                  }"
                  class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
                >
                  Interview Prep
                </button>
                <button
                  @click="activeTab = 'action'"
                  :class="{
                    'bg-indigo-600 text-white shadow-lg':
                      activeTab === 'action',
                    'text-slate-400 hover:text-white': activeTab !== 'action',
                  }"
                  class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
                >
                  Action Plan
                </button>
              </div>
            </div>

            <!-- Content for Tabs -->
            <div
              v-if="activeTab === 'rewrites'"
              class="grid gap-6 animate-fade-in"
            >
              <div
                v-for="(rewrite, i) in analysis.rewrite_recommendations"
                :key="i"
                class="group relative bg-[#13141F] rounded-2xl border border-white/5 overflow-hidden"
              >
                <div class="grid md:grid-cols-2">
                  <div
                    class="p-8 border-b md:border-b-0 md:border-r border-white/5 relative"
                  >
                    <div
                      class="absolute top-4 left-4 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider"
                    >
                      Before
                    </div>
                    <p
                      class="text-slate-400 text-sm leading-relaxed mt-6 line-through decoration-red-500/30"
                    >
                      {{ rewrite.original }}
                    </p>
                  </div>
                  <div
                    class="p-8 bg-linear-to-br from-indigo-500/5 to-transparent relative"
                  >
                    <div
                      class="absolute top-4 left-4 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider"
                    >
                      After
                    </div>
                    <p
                      class="text-indigo-100 text-sm leading-relaxed mt-6 font-medium"
                    >
                      {{ rewrite.rewritten }}
                    </p>
                  </div>
                </div>
                <div
                  class="px-8 py-3 bg-black/20 text-xs text-slate-500 flex items-center gap-2 border-t border-white/5"
                >
                  <span class="text-indigo-400 font-bold">Why:</span>
                  {{ rewrite.why }}
                </div>
              </div>
            </div>

            <div
              v-if="activeTab === 'prep'"
              class="grid md:grid-cols-2 gap-4 animate-fade-in"
            >
              <div
                v-for="(
                  question, i
                ) in analysis.recommended_interview_questions"
                :key="i"
                class="p-6 rounded-2xl bg-[#13141F] border border-white/5 hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300"
              >
                <div class="flex gap-4">
                  <div
                    class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0"
                  >
                    {{ i + 1 }}
                  </div>
                  <p class="text-slate-300 text-sm leading-relaxed">
                    {{ question }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="activeTab === 'action'"
              class="grid md:grid-cols-2 gap-8 animate-fade-in"
            >
              <div class="p-8 rounded-3xl bg-[#13141F] border border-white/5">
                <h3 class="text-lg font-bold text-white mb-6">
                  Candidate Next Steps
                </h3>
                <ul class="space-y-4">
                  <li
                    v-for="(
                      step, i
                    ) in analysis.recommended_next_steps_for_candidate"
                    :key="i"
                    class="flex gap-4 items-start"
                  >
                    <div
                      class="w-6 h-6 rounded-full border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0 mt-0.5"
                    >
                      <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                    </div>
                    <span class="text-sm text-slate-300">{{ step }}</span>
                  </li>
                </ul>
              </div>
              <div class="p-8 rounded-3xl bg-[#13141F] border border-white/5">
                <h3 class="text-lg font-bold text-white mb-6">
                  Hiring Team Notes
                </h3>
                <ul class="space-y-4">
                  <li
                    v-for="(
                      step, i
                    ) in analysis.recommended_next_steps_for_hiring_team"
                    :key="i"
                    class="flex gap-4 items-start"
                  >
                    <div
                      class="w-6 h-6 rounded-full border border-slate-500/30 flex items-center justify-center text-slate-500 shrink-0 mt-0.5"
                    >
                      <div class="w-2 h-2 rounded-full bg-slate-500"></div>
                    </div>
                    <span class="text-sm text-slate-400">{{ step }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        <!-- CTA Banner for Share Route -->
        <div
          v-if="isShareRoute"
          class="mt-12 relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-[#13141F] to-violet-600/20 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] animate-fade-in"
        >
          <!-- Animated glow orbs -->
          <div
            class="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-indigo-500/20 blur-[80px] animate-pulse-slow"
          ></div>
          <div
            class="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-violet-500/20 blur-[80px] animate-pulse-slow"
            style="animation-delay: 1s"
          ></div>
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-indigo-400/10 blur-[60px]"
          ></div>

          <!-- Shimmer lines -->
          <div
            class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"
          ></div>
          <div
            class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"
          ></div>

          <!-- Content -->
          <div
            class="relative z-10 flex flex-col items-center text-center px-8 py-14 md:py-16 space-y-6"
          >
            <!-- Badge -->
            <span
              class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md"
            >
              <span
                class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"
              ></span>
              Free AI Analysis
            </span>

            <!-- Headline -->
            <h2
              class="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight max-w-2xl"
            >
              Want to know
              <span
                class="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent"
              >
                your resume score?
              </span>
            </h2>

            <!-- Subtext -->
            <p
              class="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed"
            >
              Upload your resume and get an instant AI-powered analysis with
              personalized insights, ATS compatibility score, and actionable
              improvements.
            </p>

            <!-- Feature pills -->
            <div class="flex flex-wrap justify-center gap-3 pt-2">
              <span
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm"
              >
                <svg
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                ATS Score
              </span>
              <span
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm"
              >
                <svg
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Skill Gap Analysis
              </span>
              <span
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm"
              >
                <svg
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Smart Rewrites
              </span>
            </div>

            <!-- CTA Button -->
            <a
              href="/login"
              class="group/btn relative mt-4 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-base transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:scale-[1.03] active:scale-95 overflow-hidden inline-flex items-center gap-3 no-underline"
            >
              <span class="relative z-10 flex items-center gap-3">
                Analyze My Resume
                <svg
                  class="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <!-- Button shine effect -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"
              ></div>
            </a>

            <p class="text-slate-500 text-xs pt-1">
              No credit card required · Takes 30 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- Share Modal -->
    <ShareModal
      :visible="showShareModal"
      :shareUrl="shareUrl"
      @close="showShareModal = false"
    />
  </div>
</template>

<style>
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
