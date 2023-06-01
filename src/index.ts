import type { Metric } from "web-vitals";
import { onCLS, onFCP, onFID, onLCP, onINP, onTTFB } from "web-vitals";
import { useLocation } from "react-router-dom";

let isRegistered = false;

function onError(error: unknown) {
  console.error(`[@mcansh/remix-web-vitals]`, error);
}

function onDebug(label: string, ...args: any[]) {
  console.debug(label, ...args);
}

type Options = {
  debug?: boolean;
  analyticsId: string;
};

type FullOptions = Options & {
  fullPath: string;
  href: string;
};

function sendToAnalytics(metric: Metric, options: FullOptions) {
  let body = {
    dsn: options.analyticsId,
    id: metric.id,
    page: options.fullPath,
    href: options.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (options.debug) {
    onDebug(metric.name, JSON.stringify(body, null, 2));
  }

  let blob = new Blob([new URLSearchParams(body).toString()], {
    // This content type is necessary for `sendBeacon`:
    type: "application/x-www-form-urlencoded",
  });

  let vitalsUrl = "https://vitals.vercel-analytics.com/v1/vitals";

  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      method: "POST",
      body: blob,
      credentials: "omit",
      keepalive: true,
    }).catch(onError);
  }
}

export function getConnectionSpeed(): string {
  return (
    (typeof navigator !== "undefined" &&
      // @ts-expect-error
      navigator.connection &&
      // @ts-expect-error
      navigator.connection.effectiveType) ||
    ""
  );
}

export async function useWebVitals(options: Options) {
  let location = useLocation();

  // only register listeners once
  if (isRegistered) return;
  isRegistered = true;

  let fullOptions: FullOptions = {
    ...options,
    fullPath: location.pathname + location.search + location.hash,
    href: location.pathname,
  };

  try {
    onFID((metric) => sendToAnalytics(metric, fullOptions));
    onTTFB((metric) => sendToAnalytics(metric, fullOptions));
    onLCP((metric) => sendToAnalytics(metric, fullOptions));
    onCLS((metric) => sendToAnalytics(metric, fullOptions));
    onFCP((metric) => sendToAnalytics(metric, fullOptions));
    onINP((metric) => sendToAnalytics(metric, fullOptions));
  } catch (error) {
    onError(error);
  }
}
