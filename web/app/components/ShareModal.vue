<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="$emit('close')"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full max-w-md rounded-3xl bg-[#13141F]/95 border border-white/10 backdrop-blur-xl shadow-2xl p-8 space-y-6 animate-modal-in"
        >
          <!-- Close Button -->
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Header -->
          <div class="text-center space-y-2">
            <div
              class="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto ring-1 ring-indigo-500/20"
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
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white">Share Your Analysis</h3>
            <p class="text-sm text-slate-400">
              Anyone with the link can view your resume analysis
            </p>
          </div>

          <!-- Share Link -->
          <div class="space-y-2">
            <label
              class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Share Link
            </label>
            <div
              class="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10"
            >
              <input
                type="text"
                :value="shareUrl"
                readonly
                ref="linkInput"
                class="flex-1 bg-transparent text-sm text-slate-300 px-3 py-2 outline-none font-mono truncate"
              />
              <button
                @click="copyLink"
                class="shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                :class="
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                "
              >
                {{ copied ? "Copied!" : "Copy" }}
              </button>
            </div>
          </div>

          <!-- Divider -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-white/5"></div>
            <span class="text-xs text-slate-500 font-medium">or share via</span>
            <div class="flex-1 h-px bg-white/5"></div>
          </div>

          <!-- Social Share Icons -->
          <div class="flex justify-center gap-4">
            <!-- WhatsApp -->
            <button
              @click="shareViaWhatsApp"
              class="w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center hover:bg-[#25D366]/20 hover:border-[#25D366]/30 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <svg
                class="w-6 h-6 text-[#25D366]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
            </button>

            <!-- LinkedIn -->
            <button
              @click="shareViaLinkedIn"
              class="w-14 h-14 rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-center hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/30 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <svg
                class="w-6 h-6 text-[#0A66C2]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                />
              </svg>
            </button>

            <!-- X / Twitter -->
            <button
              @click="shareViaTwitter"
              class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <svg
                class="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </button>

            <!-- Instagram -->
            <button
              @click="shareViaInstagram"
              class="w-14 h-14 rounded-2xl bg-[#E4405F]/10 border border-[#E4405F]/20 flex items-center justify-center hover:bg-[#E4405F]/20 hover:border-[#E4405F]/30 hover:-translate-y-0.5 transition-all duration-300 group relative"
            >
              <svg
                class="w-6 h-6 text-[#E4405F]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"
                />
              </svg>
              <span
                v-if="instagramCopied"
                class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold whitespace-nowrap border border-emerald-500/30"
              >
                Link copied!
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: "ShareModal",

  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    shareUrl: {
      type: String,
      default: "",
    },
  },

  emits: ["close"],

  data() {
    return {
      copied: false,
      copyTimeout: null,
      instagramCopied: false,
      instagramCopyTimeout: null,
    };
  },

  computed: {
    shareMessage() {
      return `Check out my AI resume analysis on ResumeLens! ${this.shareUrl}`;
    },
  },

  methods: {
    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        this.copied = true;
        if (this.copyTimeout) clearTimeout(this.copyTimeout);
        this.copyTimeout = setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch {
        // Fallback for older browsers
        const input = this.$refs.linkInput;
        if (input) {
          input.select();
          document.execCommand("copy");
          this.copied = true;
          if (this.copyTimeout) clearTimeout(this.copyTimeout);
          this.copyTimeout = setTimeout(() => {
            this.copied = false;
          }, 2000);
        }
      }
    },

    shareViaWhatsApp() {
      const url = `https://wa.me/?text=${encodeURIComponent(this.shareMessage)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    },

    shareViaLinkedIn() {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    },

    shareViaTwitter() {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareMessage)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    },

    async shareViaInstagram() {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "My Resume Analysis",
            text: this.shareMessage,
            url: this.shareUrl,
          });
          return;
        } catch {
          // User cancelled or share failed, fall through to clipboard
        }
      }
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(this.shareUrl);
      } catch {
        const input = this.$refs.linkInput;
        if (input) {
          input.select();
          document.execCommand("copy");
        }
      }
      this.instagramCopied = true;
      if (this.instagramCopyTimeout) clearTimeout(this.instagramCopyTimeout);
      this.instagramCopyTimeout = setTimeout(() => {
        this.instagramCopied = false;
      }, 2000);
    },
  },

  beforeUnmount() {
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    if (this.instagramCopyTimeout) clearTimeout(this.instagramCopyTimeout);
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.animate-modal-in {
  animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
