# Vercel Remix Web Vitals

Save Web Vitals to Vercel

## Installation

```sh
# npm
npm i @mcansh/remix-web-vitals

# pnpm
pnpm i @mcansh/remix-web-vitals

# yarn
yarn add @mcansh/remix-web-vitals

# bun
bun add @mcansh/remix-web-vitals
```

## Usage

```tsx
import { WebVitals } from "@mcansh/remix-web-vitals";

export async function loader() {
  return json({ analyticsId: process.env.VERCEL_ANALYTICS_ID });
}

export default function App() {
  let { analyticsId } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {analyticsId ? <WebVitals analyticsId={analyticsId} /> : null}
      </body>
    </html>
  );
}
```
