import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AppProvider } from "../context/AppContext";
import { ToastProvider } from "../context/ToastContext";
import ErrorBoundary from "../components/ErrorBoundary";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);

    if (!initialRedirectDone) {
      const isAuthPage = router.pathname === "/auth";

      if (!authStatus && !isAuthPage) {
        router.replace("/auth");
      } else if (authStatus && isAuthPage) {
        router.replace("/dashboard");
      }

      setInitialRedirectDone(true);
    }
  }, [router, initialRedirectDone]);

  if (isAuthenticated === null) return null;

  const isDashboardPage = router.pathname.startsWith("/dashboard");

  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <Head>
            <title>HackHub - Collaborative Hackathon Platform</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </Head>

          {isAuthenticated && isDashboardPage ? (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          ) : (
            <Component {...pageProps} />
          )}
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
