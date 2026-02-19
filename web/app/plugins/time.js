import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default defineNuxtPlugin((nuxtApp) => {
  const utcToLocal = (utc, format) => {
    return dayjs
      .utc(utc)
      .tz(dayjs.tz.guess())
      .format(format || "YYYY-MM-DD hh:mm:ss A");
  };

  const localToUtc = (local, format) => {
    return dayjs(local)
      .utc()
      .format(format || "YYYY-MM-DD hh:mm:ss A");
  };

  return {
    provide: {
      utcToLocal,
      localToUtc,
    },
  };
});
