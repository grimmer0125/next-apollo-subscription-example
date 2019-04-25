import React from "react";
import App, { Container } from "next/app";
import { ApolloProvider } from "react-apollo";
import fetch from "node-fetch";

import ApolloClient from "apollo-boost";

const client = new ApolloClient({
  fetch: fetch,
  uri: "http://localhost:4000/graphql"
});

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return {
      pageProps
    };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <ApolloProvider client={client}>
        <Container>
          <Component {...pageProps} />{" "}
        </Container>
      </ApolloProvider>
    );
  }
}

export default MyApp;
