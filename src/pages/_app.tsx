import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";

import { api } from "~/utils/api";
import { env } from "~/env.mjs";
import "~/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: env.NEXT_PUBLIC_FP_API_KEY || "",
      }}
    >
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </FpjsProvider>
  );
};

export default api.withTRPC(MyApp);
