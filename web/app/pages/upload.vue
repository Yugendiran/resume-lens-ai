<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div
    class="min-h-screen bg-[#0B0C15] flex items-center justify-center p-6 font-['Outfit'] selection:bg-indigo-500/30 overflow-hidden relative"
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

    <div class="w-full max-w-lg relative z-10">
      <!-- Header (hidden during processing) -->
      <div v-if="uploadState !== 'success'" class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4 backdrop-blur-md shadow-lg shadow-indigo-500/10"
        >
          <svg
            class="w-7 h-7 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-white tracking-tight">
          Upload Resume
        </h1>
        <p class="text-slate-400 text-sm mt-1.5">
          Upload a PDF file to get started
        </p>
      </div>

      <!-- Drop Zone (idle, uploading, error) -->
      <div
        v-if="uploadState !== 'success'"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
        :class="[
          'relative rounded-3xl border transition-all duration-300 cursor-pointer group overflow-hidden',
          isDragging
            ? 'border-indigo-500/50 bg-[#13141F]/90 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
            : uploadState === 'error'
              ? 'border-red-500/20 bg-red-500/5'
              : 'border-white/5 bg-[#13141F]/80 shadow-2xl hover:border-white/10 hover:bg-[#13141F]/90 backdrop-blur-xl',
        ]"
      >
        <div
          v-if="isDragging"
          class="absolute inset-0 bg-indigo-500/5 pointer-events-none"
        ></div>

        <input
          ref="fileInput"
          type="file"
          accept=".pdf"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Idle State -->
        <div
          v-if="uploadState === 'idle'"
          class="flex flex-col items-center py-16 px-6"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-300 border border-white/5 group-hover:border-indigo-500/20"
          >
            <svg
              class="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p class="text-white font-medium text-lg mb-1">
            Drop your PDF here or
            <span class="text-indigo-400 underline decoration-indigo-400/30"
              >browse</span
            >
          </p>
          <p class="text-slate-500 text-sm">PDF files only, up to 10 MB</p>
        </div>

        <!-- Uploading State -->
        <div
          v-else-if="uploadState === 'uploading'"
          class="flex flex-col items-center py-16 px-6"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20"
          >
            <svg
              class="w-8 h-8 text-indigo-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="3"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p class="text-white font-medium text-base mb-6">
            Uploading {{ selectedFile?.name }}
          </p>
          <div class="w-full max-w-xs">
            <div class="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                class="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                :style="{ width: `${uploadProgress}%` }"
              />
            </div>
            <p class="text-slate-500 text-xs mt-3 text-center">
              {{ uploadProgress }}%
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="uploadState === 'error'"
          class="flex flex-col items-center py-16 px-6"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20"
          >
            <svg
              class="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p class="text-white font-medium text-lg">Upload Failed</p>
          <p class="text-red-400/80 text-sm mt-2 mb-6">{{ errorMessage }}</p>
          <button
            @click.stop="resetUpload"
            class="px-6 py-2.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Generated Reports (hidden during processing and when empty) -->
      <div
        v-if="
          uploadState !== 'success' && !loadingReports && reports.length > 0
        "
        class="mt-4"
      >
        <button
          @click="showReports = !showReports"
          class="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#13141F]/80 border border-white/5 hover:border-white/10 transition-all duration-300 backdrop-blur-xl group"
        >
          <span
            class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors"
          >
            Generated Reports
            <span class="text-indigo-400">({{ reports.length }}/5)</span>
          </span>
          <svg
            :class="[
              'w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-all duration-300',
              showReports ? 'rotate-180' : '',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Collapsible report list -->
        <transition name="reports-collapse">
          <div v-if="showReports" class="mt-2 space-y-2">
            <button
              v-for="report in reports"
              :key="report.slug"
              @click="$router.push(`/analysis/${report.slug}`)"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13141F]/60 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 text-left group/item cursor-pointer"
            >
              <div
                class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20"
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
                    stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium text-white truncate group-hover/item:text-indigo-300 transition-colors"
                >
                  {{ report.candidateName }}
                </p>
                <p class="text-xs text-slate-500 truncate">
                  {{ report.targetRole }}
                </p>
              </div>
              <svg
                class="w-4 h-4 text-slate-600 group-hover/item:text-indigo-400 transition-colors shrink-0"
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
            </button>
          </div>
        </transition>
      </div>

      <!-- AI Processing State -->
      <div v-if="uploadState === 'success'" class="processing-container">
        <!-- Animated glow ring -->
        <div class="flex justify-center mb-8">
          <div class="relative w-24 h-24">
            <!-- Outer pulse ring -->
            <div
              class="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping-slow"
            />
            <!-- Scanning ring -->
            <div
              class="absolute inset-0 rounded-full border-2 border-transparent scanning-ring"
            />
            <!-- Inner icon container -->
            <div
              class="absolute inset-2 rounded-full bg-[#13141F] flex items-center justify-center overflow-hidden border border-white/5"
            >
              <!-- Scan line -->
              <div class="absolute inset-0 scan-line" />
              <!-- Cycling icon -->
              <transition name="icon-swap" mode="out-in">
                <div
                  :key="currentIconIndex"
                  class="flex items-center justify-center"
                  v-html="processingIcons[currentIconIndex].svg"
                />
              </transition>
            </div>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-white text-center mb-2">
          Upload Complete
        </h2>
        <p class="text-indigo-400 text-sm font-medium text-center mb-8">
          AI is processing and reviewing your resume
        </p>

        <!-- Processing steps with icons -->
        <div class="space-y-3">
          <div
            v-for="(step, index) in processingIcons"
            :key="step.label"
            :class="[
              'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 border',
              currentIconIndex === index
                ? 'bg-indigo-500/10 border-indigo-500/20'
                : index < currentIconIndex
                  ? 'bg-emerald-500/5 border-emerald-500/10'
                  : 'bg-[#13141F]/40 border-white/5',
            ]"
          >
            <!-- Step icon -->
            <div
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500',
                currentIconIndex === index
                  ? 'bg-indigo-500/20'
                  : index < currentIconIndex
                    ? 'bg-emerald-500/15'
                    : 'bg-white/5',
              ]"
            >
              <!-- Completed checkmark -->
              <svg
                v-if="index < currentIconIndex"
                class="w-4 h-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <!-- Active spinner -->
              <svg
                v-else-if="index === currentIconIndex"
                class="w-4 h-4 text-indigo-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="3"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <!-- Pending dot -->
              <div v-else class="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>

            <!-- Label -->
            <span
              :class="[
                'text-sm font-medium transition-colors duration-500',
                currentIconIndex === index
                  ? 'text-white'
                  : index < currentIconIndex
                    ? 'text-emerald-400/70'
                    : 'text-slate-500',
              ]"
            >
              {{ step.label }}
            </span>
          </div>
        </div>

        <!-- Cycling random status text -->
        <div
          class="mt-8 h-6 flex items-center justify-center overflow-hidden relative"
        >
          <transition name="text-slide" mode="out-in">
            <p
              :key="currentStatusText"
              class="text-slate-400 text-xs text-center font-medium bg-white/5 px-4 py-1 rounded-full border border-white/5"
            >
              {{ currentStatusText }}
            </p>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDragging: false,
      selectedFile: null,
      uploadState: "idle",
      uploadProgress: 0,
      errorMessage: "",

      // Reports list
      reports: [],
      showReports: false,
      loadingReports: true,

      // AI processing animation state
      currentIconIndex: 0,
      currentStatusIndex: 0,
      iconInterval: null,
      textInterval: null,
      animationDone: false,
      apiDone: false,
      apiResponse: null,

      processingIcons: [
        {
          label: "Extracting text from PDF",
          svg: '<svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
        },
        {
          label: "Analyzing skills and experience",
          svg: '<svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
        },
        {
          label: "Evaluating strengths and risks",
          svg: '<svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
        },
        {
          label: "Generating interview questions",
          svg: '<svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
        {
          label: "Building your resume report",
          svg: '<svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
        },
      ],

      statusTexts: [
        "This usually takes 15–30 seconds…",
        "Parsing sections and formatting…",
        "Matching skills to industry standards…",
        "Cross-referencing job market data…",
        "Identifying key achievements…",
        "Scoring readability and structure…",
        "Almost there, wrapping things up…",
        "Reviewing career progression timeline…",
        "Benchmarking against top resumes…",
      ],
    };
  },
  computed: {
    currentStatusText() {
      return this.statusTexts[this.currentStatusIndex];
    },
  },
  methods: {
    triggerFileInput() {
      if (this.uploadState === "uploading") return;
      this.$refs.fileInput?.click();
    },
    handleFileSelect(event) {
      const file = event.target.files?.[0];
      if (file) this.processFile(file);
    },
    handleDrop(event) {
      this.isDragging = false;
      const file = event.dataTransfer.files?.[0];
      if (file) this.processFile(file);
    },
    processFile(file) {
      if (file.type !== "application/pdf") {
        this.uploadState = "error";
        this.errorMessage = "Only PDF files are allowed.";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.uploadState = "error";
        this.errorMessage = "File size must be under 10 MB.";
        return;
      }

      this.selectedFile = file;
      this.uploadFile(file);
    },
    async uploadFile(file) {
      this.uploadState = "uploading";
      this.uploadProgress = 0;

      try {
        const res = await this.$http.post("/upload/create-signed-url", {
          fileName: file.name,
          contentType: file.type,
        });

        if (!res.success) {
          throw new Error(res.message || "Failed to get signed URL.");
        }

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", res.signedUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              this.uploadProgress = Math.round((e.loaded / e.total) * 100);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Network error during upload.")),
          );
          xhr.send(file);
        });

        // Upload done — kick off animation + API in parallel
        this.uploadState = "success";
        this.startProcessing(res.key);
      } catch (err) {
        this.uploadState = "error";
        this.errorMessage = err.message || "Something went wrong.";
      }
    },

    /**
     * Run animation and API call in parallel.
     * Only call onProcessingComplete() when BOTH are done.
     */
    async startProcessing(fileKey) {
      this.animationDone = false;
      this.apiDone = false;
      this.apiResponse = null;

      const animationPromise = this.runChecklistAnimation();
      const apiPromise = this.processResume(fileKey);

      // Wait for both to complete
      const [, apiResult] = await Promise.all([animationPromise, apiPromise]);

      this.onProcessingComplete(apiResult);
    },

    /**
     * Runs the checklist animation through all steps.
     * Returns a promise that resolves once the last step has finished.
     */
    runChecklistAnimation() {
      return new Promise((resolve) => {
        this.currentIconIndex = 0;
        this.currentStatusIndex = 0;

        // Shuffle status texts
        this.statusTexts = [...this.statusTexts].sort(
          () => Math.random() - 0.5,
        );

        const stepDuration = 4000; // 4s per step
        let stepCount = 0;
        const totalSteps = this.processingIcons.length;

        // Advance checklist steps
        this.iconInterval = setInterval(() => {
          stepCount++;
          if (stepCount < totalSteps) {
            this.currentIconIndex = stepCount;
          } else {
            // All steps shown — mark the last as active, then resolve
            clearInterval(this.iconInterval);
            this.iconInterval = null;
            this.animationDone = true;
            resolve();
          }
        }, stepDuration);

        // Cycle status texts independently
        this.textInterval = setInterval(() => {
          this.currentStatusIndex =
            (this.currentStatusIndex + 1) % this.statusTexts.length;
        }, 3000);
      });
    },

    /**
     * Call the AI processing API.
     * Replace the simulated delay with your real API call later.
     */
    async processResume(fileKey) {
      // Call the API
      try {
        let result = await this.$http
          .post("/process", { fileKey })
          .then((res) => {
            if (res.success) {
              this.apiDone = true;
              const result = {
                success: true,
                slug: res.slug,
              };
              this.apiResponse = result;
              return result;
            } else {
              // API returned success: false — immediately show error
              this.stopProcessingAnimation();
              this.uploadState = "error";
              this.errorMessage = res.message || "Something went wrong.";
              this.apiDone = true;
              this.apiResponse = null;
              return { success: false };
            }
          });
        return result;
      } catch (error) {
        console.error("Error processing resume:", error);

        // Go to the error state with retry option
        this.stopProcessingAnimation();
        this.uploadState = "error";
        this.errorMessage = error.message || "Something went wrong.";
        this.apiDone = true;
        this.apiResponse = null;
        return {
          success: false,
          message: error.message || "Something went wrong.",
        };
      }
    },

    /**
     * Called when BOTH the animation and the API have completed.
     */
    onProcessingComplete(apiResult) {
      this.stopProcessingAnimation();

      if (!apiResult || !apiResult.success) return;
      this.$router.push(`/analysis/${apiResult.slug}`);
    },

    stopProcessingAnimation() {
      clearInterval(this.iconInterval);
      clearInterval(this.textInterval);
      this.iconInterval = null;
      this.textInterval = null;
    },
    resetUpload() {
      this.stopProcessingAnimation();
      this.uploadState = "idle";
      this.uploadProgress = 0;
      this.selectedFile = null;
      this.errorMessage = "";
      this.currentIconIndex = 0;
      this.currentStatusIndex = 0;
      this.animationDone = false;
      this.apiDone = false;
      this.apiResponse = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },
  async mounted() {
    try {
      const res = await this.$http.get("/reports");
      if (res.success) {
        this.reports = res.reports;
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      this.loadingReports = false;
    }
  },
  beforeUnmount() {
    this.stopProcessingAnimation();
  },
};
</script>

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

/* Scanning ring gradient rotation */
.scanning-ring {
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    #8b5cf5 30%,
    transparent 60%
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 2px),
    #fff calc(100% - 2px)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 2px),
    #fff calc(100% - 2px)
  );
  animation: rotate-ring 2s linear infinite;
}

@keyframes rotate-ring {
  to {
    transform: rotate(360deg);
  }
}

/* Slow pulse for outer ring */
.animate-ping-slow {
  animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.08;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}

/* Scan line sweeping top to bottom */
.scan-line {
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(99, 102, 241, 0.15) 45%,
    rgba(99, 102, 241, 0.4) 50%,
    rgba(99, 102, 241, 0.15) 55%,
    transparent 100%
  );
  animation: scan 2.5s ease-in-out infinite;
}

@keyframes scan {
  0%,
  100% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(100%);
  }
}

/* Icon swap transition */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-swap-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}

/* Status text slide transition */
.text-slide-enter-active,
.text-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.text-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Processing container fade-in */
.processing-container {
  animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reports collapse transition */
.reports-collapse-enter-active,
.reports-collapse-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.reports-collapse-enter-from,
.reports-collapse-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.reports-collapse-enter-to,
.reports-collapse-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
