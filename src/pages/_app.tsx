import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ApolloProvider } from "@apollo/client";
import client from "../pages/apollo-client";
import { Toaster } from "react-hot-toast";
import Header from "../../components/Header";


function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {

  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
        <Toaster/>
        <div className="h-screen overflow-scroll bg-slate-200">
          <Header />
          <Component {...pageProps} />
        </div>
      </SessionProvider>
    </ApolloProvider>
  )
}
export default MyApp
