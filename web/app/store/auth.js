import { defineStore } from "pinia";
import timePlugin from "~/plugins/time.js";

const useAuthStore = defineStore("auth", {
  state: () => ({
    authenticated: false,
    appAuthenticated: false,
    loading: false,
  }),
  actions: {
    async authenticateUser(
      accessToken,
      accessTokenExp,
      refreshToken,
      refreshTokenExp,
    ) {
      let accessTokenCookie = useCookie("resumeLensAccessToken", {
        expires: new Date(
          timePlugin().provide.utcToLocal(
            accessTokenExp,
            "YYYY-MM-DD HH:mm:ss",
          ),
        ),
      });
      accessTokenCookie.value = accessToken;

      let refreshTokenCookie = useCookie("resumeLensRefreshToke", {
        expires: new Date(
          timePlugin().provide.utcToLocal(
            refreshTokenExp,
            "YYYY-MM-DD HH:mm:ss",
          ),
        ),
      });
      refreshTokenCookie.value = refreshToken;

      this.authenticated = true;
      this.appAuthenticated = true;

      return true;
    },
    async authenticateUserRefresh() {
      const refreshToken = useCookie("resumeLensRefreshToke");

      const res = await fetch(
        `${
          useRuntimeConfig().public.RESUME_LENS_API_URL
        }/resume-lens/api/auth/refresh-token`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: refreshToken.value,
          }),
        },
      ).then((res) => res.json());

      if (res.success) {
        const accessToken = useCookie("resumeLensAccessToken", {
          expires: new Date(
            timePlugin().provide.utcToLocal(
              res.accessTokenExp,
              "YYYY-MM-DD HH:mm:ss",
            ),
          ),
        });
        accessToken.value = res.accessToken;

        const refreshToken = useCookie("resumeLensRefreshToke", {
          expires: new Date(
            timePlugin().provide.utcToLocal(
              res.refreshTokenExp,
              "YYYY-MM-DD HH:mm:ss",
            ),
          ),
        });
        refreshToken.value = res.refreshToken;

        this.authenticated = true;
        this.appAuthenticated = true;

        return res;
      } else {
        return res;
      }
    },
    async logout() {
      this.authenticated = false;
      const accessToken = useCookie("resumeLensAccessToken");
      accessToken.value = null;
      const refreshToken = useCookie("resumeLensRefreshToke");
      refreshToken.value = null;
    },
  },
});

export default useAuthStore;
