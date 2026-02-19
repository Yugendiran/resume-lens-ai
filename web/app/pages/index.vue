<script setup>
definePageMeta({
  layout: "default",
});

const features = [
  {
    title: "AI-Powered Analysis",
    description:
      "Get instant feedback on your resume's strengths and weaknesses using advanced AI models.",
    icon: "chart-bar",
  },
  {
    title: "ATS Optimization",
    description:
      "Ensure your resume passes Applicant Tracking Systems with tailored keyword suggestions.",
    icon: "shield-check",
  },
  {
    title: "Smart Rewrites",
    description:
      "Transform bullet points into impactful achievements with one-click AI rewriting.",
    icon: "pencil-alt",
  },
];

const steps = [
  {
    title: "Upload PDF",
    description: "Drag and drop your resume to get started instantly.",
    number: "01",
  },
  {
    title: "Analyze",
    description: "Our AI scans for 50+ impact factors and ATS compatibility.",
    number: "02",
  },
  {
    title: "Improve",
    description: "Apply suggestions and download your polished resume.",
    number: "03",
  },
];
</script>

<template>
  <div
    class="min-h-screen bg-[#0B0C15] font-['Outfit'] text-white overflow-hidden relative"
  >
    <!-- Background Effects (Reused from upload.vue for consistency) -->
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

    <!-- Navigation -->
    <nav
      class="relative z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30"
        >
          <svg
            class="w-5 h-5 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight">Resume Lens</span>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/login"
          class="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >Sign In</NuxtLink
        >
        <NuxtLink
          to="/upload"
          class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
        >
          Get Started
        </NuxtLink>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative z-10 pt-20 pb-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-fade-in-up"
        >
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span class="text-xs font-medium text-indigo-300"
            >New: AI-Powered Rewrite Suggestions</span
          >
        </div>

        <h1
          class="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 animate-fade-in-up delay-100"
        >
          Craft the Perfect Resume <br />
          <span class="text-indigo-400">Analysis & Optimization</span>
        </h1>

        <p
          class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200"
        >
          Stop guessing what recruiters want. Our AI analyzes your resume
          against job descriptions to give you actionable feedback and instant
          improvements.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300"
        >
          <NuxtLink
            to="/upload"
            class="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Analyze My Resume
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </NuxtLink>
          <button
            class="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:-translate-y-1 backdrop-blur-sm"
          >
            View Sample Report
          </button>
        </div>

        <!-- Abstract Dashboard Preview -->
        <div class="mt-20 relative animate-fade-in-up delay-500">
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#0B0C15] via-transparent to-transparent z-10"
          ></div>
          <div
            class="rounded-2xl border border-white/10 bg-[#13141F]/50 backdrop-blur-xl p-4 md:p-8 shadow-2xl shadow-indigo-500/10 transform rotate-x-12 perspective-1000"
          >
            <!-- Mock UI Elements -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="col-span-2 space-y-4">
                <div
                  class="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse"
                ></div>
                <div class="h-4 w-1/2 bg-white/5 rounded-lg"></div>
                <div
                  class="h-32 w-full bg-white/5 rounded-xl mt-6 border border-white/5"
                ></div>
                <div
                  class="h-32 w-full bg-white/5 rounded-xl border border-white/5"
                ></div>
              </div>
              <div class="space-y-4">
                <div
                  class="h-full w-full bg-indigo-500/5 rounded-xl border border-indigo-500/20 p-4"
                >
                  <div class="flex justify-between items-center mb-4">
                    <div class="h-4 w-20 bg-indigo-500/20 rounded"></div>
                    <div class="h-8 w-12 bg-indigo-500/20 rounded-lg"></div>
                  </div>
                  <div class="space-y-3">
                    <div class="h-2 w-full bg-indigo-500/10 rounded"></div>
                    <div class="h-2 w-full bg-indigo-500/10 rounded"></div>
                    <div class="h-2 w-2/3 bg-indigo-500/10 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section
      class="relative z-10 py-24 px-6 bg-[#0B0C15]/50 border-t border-white/5"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold mb-4">
            Everything you need to get hired
          </h2>
          <p class="text-slate-400 max-w-2xl mx-auto">
            Complete toolkit to optimize your resume for both humans and
            machines.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group p-8 rounded-3xl bg-[#13141F] border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-white/5 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/10"
            >
              <!-- Icons -->
              <svg
                v-if="feature.icon === 'chart-bar'"
                class="w-7 h-7 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <svg
                v-else-if="feature.icon === 'shield-check'"
                class="w-7 h-7 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else
                class="w-7 h-7 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">
              {{ feature.title }}
            </h3>
            <p class="text-slate-400 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="relative z-10 py-24 px-6 overflow-hidden">
      <!-- Decoration -->
      <div
        class="absolute right-0 top-1/4 w-1/2 h-1/2 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"
      ></div>

      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-3xl md:text-5xl font-bold mb-6">
              Simple, Fast, Effective
            </h2>
            <p class="text-slate-400 text-lg mb-12">
              No sign-up required to get started. Just three steps to a better
              resume.
            </p>

            <div class="space-y-8">
              <div
                v-for="step in steps"
                :key="step.number"
                class="flex gap-6 group"
              >
                <div
                  class="text-5xl font-bold text-white/5 group-hover:text-indigo-500/20 transition-colors font-mono"
                >
                  {{ step.number }}
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-white">
                    {{ step.title }}
                  </h3>
                  <p class="text-slate-400">{{ step.description }}</p>
                </div>
              </div>
            </div>

            <div class="mt-12">
              <NuxtLink
                to="/upload"
                class="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors group"
              >
                Start Optimizing Now
                <span class="group-hover:translate-x-1 transition-transform"
                  >-></span
                >
              </NuxtLink>
            </div>
          </div>

          <div class="relative">
            <div
              class="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full transform scale-75 animate-pulse-slow"
            ></div>
            <div
              class="relative bg-[#13141F] border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
            >
              <!-- Abstract visual of a resume being scanned -->
              <div class="space-y-4 opacity-50">
                <div class="h-4 bg-white/10 rounded w-1/3"></div>
                <div
                  class="h-64 bg-white/5 rounded-xl border border-white/5 p-4 space-y-3"
                >
                  <div class="h-2 bg-white/10 rounded w-full"></div>
                  <div class="h-2 bg-white/10 rounded w-full"></div>
                  <div class="h-2 bg-white/10 rounded w-2/3"></div>
                  <div
                    class="h-20 bg-indigo-500/10 rounded-lg mt-4 border border-indigo-500/20 w-full animate-pulse"
                  ></div>
                </div>
              </div>
              <!-- Floating Badge -->
              <div
                class="absolute -bottom-6 -left-6 bg-[#0B0C15] border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3"
              >
                <div
                  class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-slate-400">ATS Score</p>
                  <p class="text-lg font-bold text-white">92/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
.delay-500 {
  animation-delay: 0.5s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
