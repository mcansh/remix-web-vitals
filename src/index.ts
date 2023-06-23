import * as React from "react";
import type { Metric } from "web-vitals";
import type { Params } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";
import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from "web-vitals";

let vitalsUrl = "https://vitals.vercel-analytics.com/v1/vitals";

type Options = {
  analyticsId: string;
  debug?: boolean;
};

type FullOptions = Options & {
  params: Readonly<Params<string>>;
  path: string;
};

function sendToAnalytics(metric: Metric, options: FullOptions) {
  let page = Object.entries(options.params).reduce((acc, [key, value]) => {
    return value ? acc.replace(value, `[${key}]`) : ``;
  }, options.path);

  let body = {
    dsn: options.analyticsId, // qPgJqYH9LQX5o31Ormk8iWhCxZO
    id: metric.id, // v2-1653884975443-1839479248192
    page, // /blog/[slug]
    href: location.href, // https://{my-example-app-name-here}/blog/my-test
    event_name: metric.name, // TTFB
    value: metric.value.toString(), // 60.20000000298023
    speed: getConnectionSpeed(), // 4g
  };

  if (options.debug) {
    onDebug(metric.name, body);
  }

  let blob = new Blob([new URLSearchParams(body).toString()], {
    // This content type is necessary for `sendBeacon`
    type: "application/x-www-form-urlencoded",
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      method: "POST",
      body: blob,
      credentials: "omit",
      keepalive: true,
    });
  }
}

let isRegistered = false;
export function WebVitals(options: Options) {
  let location = useLocation();
  let params = useParams();

  React.useEffect(() => {
    (() => {
      if (isRegistered) {
        return;
      }

      let fullOptions = {
        ...options,
        params,
        path: location.pathname,
      } as const;

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
    })();
  }, [location.hash, location.pathname, location.search, options, params]);

  return null;
}

function getConnectionSpeed(): string {
  // @ts-expect-error
  return "connection" in navigator &&
    navigator["connection"] &&
    // @ts-expect-error
    "effectiveType" in navigator["connection"]
    ? navigator["connection"]["effectiveType"]
    : "";
}

function onError(error: unknown) {
  console.error(`[@mcansh/remix-web-vitals]`, error);
}

function onDebug(label: string, ...args: any[]) {
  console.debug(label, ...args);
}
