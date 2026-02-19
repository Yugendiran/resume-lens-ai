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
      <!-- Header -->
      <div v-if="step !== 'success'" class="text-center mb-8">
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
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-white tracking-tight">
          {{ step === "otp" ? "Verify OTP" : "Welcome Back" }}
        </h1>
        <p class="text-slate-400 text-sm mt-1.5">
          {{
            step === "otp"
              ? `Enter the 6-digit code sent to ${email}`
              : "Sign in with your email to continue"
          }}
        </p>
      </div>

      <!-- Email Step -->
      <div
        v-if="step === 'email'"
        class="rounded-3xl border border-white/5 bg-[#13141F]/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/10"
      >
        <form @submit.prevent="handleLoginRequest">
          <!-- Name field (shown for new users) -->
          <div v-if="showNameField" class="mb-5">
            <label class="block text-sm font-medium text-slate-300 mb-2"
              >Full Name</label
            >
            <input
              v-model="name"
              type="text"
              placeholder="Enter your full name"
              class="w-full px-4 py-3 rounded-xl bg-[#0B0C15]/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-200"
            />
          </div>

          <!-- Email field -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-300 mb-2"
              >Email Address</label
            >
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 rounded-xl bg-[#0B0C15]/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-200"
              required
            />
          </div>

          <!-- Error message -->
          <div
            v-if="errorMessage && step === 'email'"
            class="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p class="text-red-400 text-xs font-medium">{{ errorMessage }}</p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            :class="[
              'w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg',
              loading
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-white/5'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 active:scale-[0.98]',
            ]"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Sending OTP…
            </span>
            <span v-else>Continue with Email</span>
          </button>

          <!-- Toggle new user -->
          <p class="text-center mt-6 text-xs text-slate-500">
            <span v-if="!showNameField">
              New user?
              <button
                type="button"
                @click="showNameField = true"
                class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Create account
              </button>
            </span>
            <span v-else>
              Already have an account?
              <button
                type="button"
                @click="
                  showNameField = false;
                  name = '';
                "
                class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </span>
          </p>
        </form>
      </div>

      <!-- OTP Step -->
      <div
        v-if="step === 'otp'"
        class="rounded-3xl border border-white/5 bg-[#13141F]/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/10"
      >
        <form @submit.prevent="handleVerifyOtp">
          <!-- OTP inputs -->
          <div class="flex justify-center gap-3 mb-8">
            <input
              v-for="(digit, index) in otpDigits"
              :key="index"
              :ref="'otpInput' + index"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              inputmode="numeric"
              @input="handleOtpInput(index, $event)"
              @keydown="handleOtpKeydown(index, $event)"
              @paste="handleOtpPaste($event)"
              :class="[
                'w-12 h-14 text-center text-lg font-semibold rounded-xl border transition-all duration-200 bg-[#0B0C15]/50 text-white focus:outline-none shadow-sm',
                otpDigits[index]
                  ? 'border-indigo-500/50 ring-1 ring-indigo-500/25'
                  : 'border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25',
              ]"
            />
          </div>

          <!-- Error message -->
          <div
            v-if="errorMessage && step === 'otp'"
            class="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p class="text-red-400 text-xs font-medium">{{ errorMessage }}</p>
          </div>

          <!-- Verify button -->
          <button
            type="submit"
            :disabled="loading || otpCode.length !== 6"
            :class="[
              'w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg',
              loading || otpCode.length !== 6
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-white/5'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 active:scale-[0.98]',
            ]"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Verifying…
            </span>
            <span v-else>Verify OTP</span>
          </button>

          <!-- Resend / Back -->
          <div class="flex items-center justify-between mt-6">
            <button
              type="button"
              @click="goBackToEmail"
              class="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Change email
            </button>
            <button
              type="button"
              @click="resendOtp"
              :disabled="resendCooldown > 0"
              :class="[
                'text-xs font-medium transition-colors',
                resendCooldown > 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-indigo-400 hover:text-indigo-300',
              ]"
            >
              {{
                resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"
              }}
            </button>
          </div>
        </form>
      </div>

      <!-- Success State -->
      <div v-if="step === 'success'" class="success-container">
        <div class="flex justify-center mb-8">
          <div class="relative w-24 h-24">
            <!-- Outer pulse ring -->
            <div
              class="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow"
            />
            <!-- Inner icon container -->
            <div
              class="absolute inset-2 rounded-full bg-[#13141F] border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10"
            >
              <svg
                class="w-10 h-10 text-emerald-400 checkmark-animate"
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
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-white text-center mb-2">
          Welcome Back!
        </h2>
        <p class="text-emerald-400 text-sm font-medium text-center mb-8">
          Successfully authenticated
        </p>

        <!-- User info card -->
        <div
          class="rounded-2xl border border-white/5 bg-[#13141F]/80 p-6 mb-8 backdrop-blur-xl"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"
            >
              <span class="text-indigo-400 font-bold text-lg">{{
                userInitial
              }}</span>
            </div>
            <div>
              <p class="text-white text-base font-semibold">{{ email }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <p class="text-slate-500 text-xs font-medium">Verified</p>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="navigateToUpload"
          class="w-full py-3.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all duration-300"
        >
          Continue to Upload
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import useAuthStore from "~/store/auth.js";

export default {
  data() {
    return {
      authStore: useAuthStore(),
      step: "email", // 'email' | 'otp' | 'success'
      email: "",
      name: "",
      showNameField: true,
      loading: false,
      errorMessage: "",

      // OTP
      otpDigits: ["", "", "", "", "", ""],
      resendCooldown: 0,
      resendTimer: null,
    };
  },
  computed: {
    otpCode() {
      return this.otpDigits.join("");
    },
    userInitial() {
      if (this.name) return this.name.charAt(0).toUpperCase();
      return this.email.charAt(0).toUpperCase();
    },
  },
  methods: {
    // ──── Login Request ────
    async handleLoginRequest() {
      this.errorMessage = "";

      if (!this.email.trim()) {
        this.errorMessage = "Please enter your email address.";
        return;
      }

      if (this.showNameField && !this.name.trim()) {
        this.errorMessage = "Please enter your name.";
        return;
      }

      this.loading = true;

      try {
        const payload = { email: this.email.trim() };
        if (this.showNameField && this.name.trim()) {
          payload.name = this.name.trim();
        }

        const res = await this.$http.post("/auth/login-request", payload);

        if (!res.success) {
          // If name is required (new user), show the name field
          if (res.message === "Name not found") {
            this.showNameField = true;
            this.errorMessage =
              "Looks like you're new! Please enter your name.";
          } else {
            this.errorMessage = res.message || "Something went wrong.";
          }
          return;
        }

        // Move to OTP step
        this.step = "otp";
        this.errorMessage = "";
        this.startResendCooldown();

        // Auto-focus first OTP input
        this.$nextTick(() => {
          const firstInput = this.$refs.otpInput0;
          if (firstInput) {
            const el = Array.isArray(firstInput) ? firstInput[0] : firstInput;
            el?.focus();
          }
        });
      } catch (err) {
        this.errorMessage = err.message || "Network error. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    // ──── Verify OTP ────
    async handleVerifyOtp() {
      this.errorMessage = "";

      if (this.otpCode.length !== 6) {
        this.errorMessage = "Please enter the complete 6-digit code.";
        return;
      }

      this.loading = true;

      try {
        const res = await this.$http.post("/auth/verify-otp", {
          email: this.email.trim(),
          code: this.otpCode,
        });

        if (!res.success) {
          this.errorMessage = res.message || "Invalid OTP. Please try again.";
          return;
        }

        let authenticateUser = this.authStore.authenticateUser(
          res.accessToken,
          res.accessTokenExp,
          res.refreshToken,
          res.refreshTokenExp,
        );

        if (authenticateUser) {
          // Redirect to upload
          this.$router.push("/upload");
        }
      } catch (err) {
        this.errorMessage = err.message || "Network error. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    // ──── OTP Input Handlers ────
    handleOtpInput(index, event) {
      const value = event.target.value;

      // Only allow digits
      if (!/^\d$/.test(value)) {
        this.otpDigits[index] = "";
        return;
      }

      // Move to next input
      if (value && index < 5) {
        this.$nextTick(() => {
          const nextRef = this.$refs["otpInput" + (index + 1)];
          const el = Array.isArray(nextRef) ? nextRef[0] : nextRef;
          el?.focus();
        });
      }
    },

    handleOtpKeydown(index, event) {
      if (event.key === "Backspace" && !this.otpDigits[index] && index > 0) {
        this.$nextTick(() => {
          const prevRef = this.$refs["otpInput" + (index - 1)];
          const el = Array.isArray(prevRef) ? prevRef[0] : prevRef;
          el?.focus();
        });
      }
    },

    handleOtpPaste(event) {
      event.preventDefault();
      const pasted = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = pasted[i] || "";
      }
      // Focus last filled input
      const lastIndex = Math.min(pasted.length, 5);
      this.$nextTick(() => {
        const ref = this.$refs["otpInput" + lastIndex];
        const el = Array.isArray(ref) ? ref[0] : ref;
        el?.focus();
      });
    },

    // ──── Resend OTP ────
    async resendOtp() {
      if (this.resendCooldown > 0) return;
      this.errorMessage = "";
      this.otpDigits = ["", "", "", "", "", ""];

      await this.handleLoginRequest();
      if (!this.errorMessage) {
        this.step = "otp";
      }
    },

    startResendCooldown() {
      this.resendCooldown = 30;
      clearInterval(this.resendTimer);
      this.resendTimer = setInterval(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          clearInterval(this.resendTimer);
          this.resendTimer = null;
        }
      }, 1000);
    },

    // ──── Navigation ────
    goBackToEmail() {
      this.step = "email";
      this.otpDigits = ["", "", "", "", "", ""];
      this.errorMessage = "";
      clearInterval(this.resendTimer);
      this.resendCooldown = 0;
    },

    navigateToUpload() {
      this.$router.push("/upload");
    },
  },
  beforeUnmount() {
    clearInterval(this.resendTimer);
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

/* Checkmark draw animation */
.checkmark-animate {
  animation: draw-check 0.5s ease-out 0.3s both;
}

@keyframes draw-check {
  from {
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    opacity: 0;
  }
  to {
    stroke-dasharray: 30;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* Success container fade-in */
.success-container {
  animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
  }
}
</style>
