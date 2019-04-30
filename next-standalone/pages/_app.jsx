import React from "react";
import App, { Container } from "next/app";
import { ApolloProvider } from "react-apollo";
import fetch from "node-fetch";
import { InMemoryCache } from "apollo-cache-inmemory";

import ApolloClient from "apollo-boost";
import { SubscriptionClient } from "subscriptions-transport-ws";

import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";
const GRAPHQL_WS_ENDPOINT = "ws://localhost:4000/subscriptions";

// Create an http link:
// const httpLink = new HttpLink({
//   uri: "http://localhost:4000/graphql",
//   fetch: fetch
// });

const wsLink = process.browser
  ? new WebSocketLink(
      new SubscriptionClient(GRAPHQL_WS_ENDPOINT, {
        reconnect: true
      })
    )
  : null;

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  fetch: fetch
});

// Polyfill fetch() on the server (used by apollo-client)
// if (!process.browser) {
//   global.fetch = fetch;
// }

// const WebSocket2 = require("isomorphic-ws");
// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:4000/graphql`,
//   options: {
//     reconnect: true
//   },
//   webSocketImpl: WebSocket2
// });

// ref: https://github.com/the-road-to-graphql/fullstack-apollo-subscription-example/blob/master/client/src/index.js
// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
// const link = split(
//   // split based on operation type
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === "OperationDefinition" &&
//       definition.operation === "subscription"
//     );
//   },
//   wsLink,
//   httpLink
// );

const link = wsLink
  ? split(
      ({ query }) => {
        let definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

const link2 = ApolloLink.from([link]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  fetch: fetch,
  link: link2,
  cache: cache,

  // link: link // 沒加上去就會出現紅色的試著連線次數 (跟 node ws server 無關),
  // 加上去則: ApolloBoost was initialized with unsupported options: link
  // a. 使用 link 重連紅色
  // b. 使用 link2: client.js:111 WebSocket connection to 'ws://localhost:5000/' failed: WebSocket is closed before the connection is established
  // 如果有開 ws server, 有沒有加都沒差, 都會 crash

  // NOTE: if omit,
  // http://localhost:3000/graphql
  // [Network error]: ServerParseError: Unexpected token N in JSON at position 0
  // graphql query error and  + sub data: undefined
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
