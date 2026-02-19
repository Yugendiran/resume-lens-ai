import { storeToRefs } from "pinia";
import useAuthStore from "~/store/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const { appAuthenticated } = storeToRefs(authStore);

  const appAccessToken = useCookie("resumeLensAccessToken");
  const appRefreshToken = useCookie("resumeLensRefreshToke");

  // Check if user has resume-lens app access token
  if (!appAccessToken.value) {
    if (!appRefreshToken.value) {
      abortNavigation();
      return navigateTo("/login");
    }
  } else {
    appAuthenticated.value = true;
  }
});
