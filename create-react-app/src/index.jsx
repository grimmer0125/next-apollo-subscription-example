import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { ApolloProvider } from "react-apollo";

// import { ApolloClient } from "apollo-client";
import { getMainDefinition } from "apollo-utilities";
import { split } from "apollo-link";
// import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";

import { SubscriptionClient } from "subscriptions-transport-ws";

import { ApolloClient, HttpLink, ApolloLink } from "apollo-boost";

// const httpLink = new HttpLink({
//   uri: "http://localhost:4000/graphql",
//   fetch: fetch
// });

// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:4000/graphql`,
//   options: {
//     reconnect: true
//   }
// });

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";
const GRAPHQL_WS_ENDPOINT = "ws://localhost:4000/subscriptions";

// let apolloClient; //: ApolloClient<any>;

const wsLink = process.browser
  ? new WebSocketLink(
      new SubscriptionClient(GRAPHQL_WS_ENDPOINT, {
        reconnect: true
      })
    )
  : null;

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT
});

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

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

// const terminatingLink = split(
//   ({ query }) => {
//     const { kind, operation } = getMainDefinition(query);
//     return kind === "OperationDefinition" && operation === "subscription";
//   },
//   wsLink,
//   httpLink
// );

// const link = ApolloLink.from([terminatingLink]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  // fetch: fetch,
  // uri: "http://localhost:4000/graphql"
  ssrMode: !process.browser,
  link: ApolloLink.from([link]),
  cache
});

// cache.writeData({
//   data: {
//     favorites: []
//   }
// })

// ReactDOM.render( < App / > , document.getElementById('root'));
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
