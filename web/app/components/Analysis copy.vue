<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 font-['Outfit']"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="min-h-[60vh] flex flex-col items-center justify-center p-6 md:p-12 text-center"
      >
        <div class="relative w-20 h-20 mb-8">
          <div
            class="absolute inset-0 rounded-full border-4 border-slate-800"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <svg
              class="w-8 h-8 text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
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
        class="min-h-[60vh] flex flex-col items-center justify-center p-6 md:p-12 text-center"
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
      <div v-else-if="analysis" class="space-y-6 md:space-y-8 animate-fade-in">
        <!-- Header Section -->
        <div
          class="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end"
        >
          <div>
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-3"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-violet-500"
                ></span>
              </span>
              Analysis Complete
            </div>
            <h1
              class="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2"
            >
              {{ analysis.inferred_target_role }}
            </h1>
            <p class="text-slate-400 flex items-center gap-2">
              Confidence Score:
              <span class="text-emerald-400 font-semibold"
                >{{
                  Math.round(
                    analysis.confidence_and_notes?.confidence_score * 100,
                  )
                }}%</span
              >
            </p>
          </div>

          <div class="flex items-center gap-4">
            <button
              @click="$router.push('/upload')"
              class="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              Upload New Resume
            </button>
            <button
              class="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/25"
            >
              Download Report
            </button>
          </div>
        </div>

        <!-- 3-Column Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <!-- Left Column: Score & Summary -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Overall Fit Card -->
            <div
              class="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300"
            >
              <div
                class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"
              >
                <svg
                  class="w-32 h-32 text-violet-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  />
                </svg>
              </div>

              <div class="relative z-10 text-center">
                <p
                  class="text-slate-400 text-sm uppercase tracking-wider font-medium mb-4"
                >
                  Overall Fit Rating
                </p>
                <div class="flex items-center justify-center mb-4">
                  <div
                    class="text-6xl md:text-7xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent"
                  >
                    {{ analysis.overall_fit?.rating }}
                  </div>
                  <span class="text-2xl text-slate-500 self-end mb-2">/10</span>
                </div>
                <div
                  class="inline-block px-4 py-1.5 rounded-full bg-violet-500/20 text-violet-300 font-medium text-sm mb-6"
                >
                  {{ analysis.overall_fit?.category }}
                </div>
                <p class="text-slate-300 text-sm leading-relaxed">
                  {{ analysis.overall_fit?.reason }}
                </p>
              </div>
            </div>

            <!-- Executive Summary -->
            <div
              class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Executive Summary
              </h3>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">
                {{ analysis.executive_summary?.["3_sentence"] }}
              </p>
              <div
                class="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4"
              >
                <p class="text-violet-200 text-xs italic">
                  "{{ analysis.executive_summary?.one_line }}"
                </p>
              </div>
            </div>

            <!-- Interview Questions -->
            <div
              class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Recommended Interview Qs
              </h3>
              <ul class="space-y-4">
                <li
                  v-for="(q, idx) in analysis.recommended_interview_questions"
                  :key="idx"
                  class="flex gap-3 text-sm text-slate-300"
                >
                  <span
                    class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mt-0.5"
                    >{{ idx + 1 }}</span
                  >
                  {{ q }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Middle Column: Metrics & Analysis -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Section Scores -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(score, section) in analysis.section_scores"
                :key="section"
                class="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center"
              >
                <div class="text-2xl font-bold text-white mb-1">
                  {{ score
                  }}<span class="text-sm text-slate-500 font-normal">/10</span>
                </div>
                <div class="text-xs text-slate-400 capitalize">
                  {{ section.replace(/_/g, " ") }}
                </div>

                <!-- Mini Progress Bar -->
                <div
                  class="w-full h-1 bg-slate-700 rounded-full mt-3 overflow-hidden"
                >
                  <div
                    class="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                    :style="{ width: `${score * 10}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Strengths & Risks -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Strengths -->
              <div
                class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
              >
                <h3
                  class="text-white font-semibold mb-4 flex items-center gap-2"
                >
                  <svg
                    class="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Top Strengths
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(strength, idx) in analysis.top_strengths"
                    :key="idx"
                    class="flex items-start gap-3"
                  >
                    <svg
                      class="w-5 h-5 text-emerald-500/50 flex-shrink-0 mt-0.5"
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
                    <span class="text-sm text-slate-300 leading-snug">{{
                      strength
                    }}</span>
                  </li>
                </ul>
              </div>

              <!-- Risks -->
              <div
                class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
              >
                <h3
                  class="text-white font-semibold mb-4 flex items-center gap-2"
                >
                  <svg
                    class="w-5 h-5 text-amber-400"
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
                  Potential Risks
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(risk, idx) in analysis.top_risks_or_red_flags"
                    :key="idx"
                    class="flex items-start gap-3"
                  >
                    <svg
                      class="w-5 h-5 text-amber-500/50 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span class="text-sm text-slate-300 leading-snug">{{
                      risk
                    }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Optimization Opportunities -->
            <div
              class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 class="text-white font-semibold mb-5 flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Quantification Opportunities
              </h3>
              <div class="grid grid-cols-1 gap-4">
                <div
                  v-for="(opp, idx) in analysis.quantify_opportunities"
                  :key="idx"
                  class="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/30"
                >
                  <div class="md:w-1/3">
                    <span
                      class="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block"
                      >Context</span
                    >
                    <p class="text-sm text-violet-300 font-medium">
                      {{ opp.area }}
                    </p>
                  </div>
                  <div class="md:w-2/3">
                    <span
                      class="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block"
                      >Suggestion</span
                    >
                    <p class="text-sm text-slate-300">
                      {{ opp.how_to_quantify }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Missing Keywords -->
            <div
              class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 class="text-white font-semibold mb-4">
                Missing ATS Keywords
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="keyword in analysis.missing_ats_keywords"
                  :key="keyword"
                  class="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>

            <!-- Rewrite Recommendations -->
            <div
              v-if="analysis.rewrite_recommendations?.length"
              class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 class="text-white font-semibold mb-5">Rewrite Suggestions</h3>
              <div class="space-y-6">
                <div
                  v-for="(rec, idx) in analysis.rewrite_recommendations"
                  :key="idx"
                  class="relative pl-6 border-l-2 border-slate-700"
                >
                  <p
                    class="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium"
                  >
                    Why? {{ rec.why }}
                  </p>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      class="bg-red-900/10 p-4 rounded-xl border border-red-500/10"
                    >
                      <span class="text-xs text-red-400 font-bold block mb-2"
                        >BEFORE</span
                      >
                      <p
                        class="text-sm text-slate-400 line-through decoration-red-500/30 decoration-2"
                      >
                        {{ rec.original }}
                      </p>
                    </div>
                    <div
                      class="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/10"
                    >
                      <span
                        class="text-xs text-emerald-400 font-bold block mb-2"
                        >AFTER</span
                      >
                      <p class="text-sm text-emerald-100/90">
                        {{ rec.rewritten }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div
            class="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-6"
          >
            <h3 class="text-white font-semibold mb-3">
              Next Steps for Candidate
            </h3>
            <ul class="space-y-2">
              <li
                v-for="(
                  step, idx
                ) in analysis.recommended_next_steps_for_candidate"
                :key="idx"
                class="flex gap-2 text-sm text-slate-300"
              >
                <svg
                  class="w-5 h-5 text-violet-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {{ step }}
              </li>
            </ul>
          </div>

          <div
            class="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6"
          >
            <h3 class="text-white font-semibold mb-3">
              Hiring Manager's Perspective
            </h3>
            <ul class="space-y-2">
              <li
                v-for="(
                  step, idx
                ) in analysis.recommended_next_steps_for_hiring_team"
                :key="idx"
                class="flex gap-2 text-sm text-slate-300"
              >
                <svg
                  class="w-5 h-5 text-slate-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ step }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    slug: {
      type: String,
      required: true,
    },
    route: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isLoading: true,
      analysis: null,
      error: null,
    };
  },
  mounted() {
    this.getResumeAnalysis();
  },
  methods: {
    async getResumeAnalysis() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.$http.get(`${this.route}/${this.slug}`);
        if (response.success) {
          this.analysis = response.analysis;
        } else {
          this.error = response.message || "Failed to load analysis.";
        }
      } catch (error) {
        this.error = error.message || "An unexpected error occurred.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
