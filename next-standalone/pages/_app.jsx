import React from "react";
import App, { Container } from "next/app";
import { ApolloProvider } from "react-apollo";

// *** init-apollo ***
import { ApolloClient, HttpLink, ApolloLink } from "apollo-boost";
import fetch from "isomorphic-unfetch";
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
// import { defaults, resolvers, typeDefs } from "./resolvers/resolvers";
import { withClientState } from "apollo-link-state";
import { InMemoryCache } from "apollo-cache-inmemory";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

// NOTE:
// if const server = new ApolloServer({subscriptions: { path: "/subscriptions" is set
// here should be /subscriptions, otherwise it is /graphql
const GRAPHQL_WS_ENDPOINT = "ws://localhost:4000/subscriptions";

// case1 work
// const wsLink = process.browser
//   ? new WebSocketLink(
//       new SubscriptionClient(GRAPHQL_WS_ENDPOINT, {
//         reconnect: true
//       })
//     )
//   : null;

// not work
// const wsLink = new WebSocketLink(
//   new SubscriptionClient(GRAPHQL_WS_ENDPOINT, {
//     reconnect: true
//   })
// );

// case2 work
const WebSocket2 = require("isomorphic-ws");
const wsLink = new WebSocketLink({
  uri: GRAPHQL_WS_ENDPOINT,
  options: {
    reconnect: true
  },
  webSocketImpl: WebSocket2 // browser can not use ws's WebSocket
});

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT
});

// not necessary
// Polyfill fetch() on the server (used by apollo-client)
// if (!process.browser) {
//   global.fetch = fetch;
// }

function create() {
  const cache = new InMemoryCache(); //new InMemoryCache().restore(initialState || {});

  // works for case1, case2
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

  // works for case2
  // const link = split(
  //   ({ query }) => {
  //     let definition = getMainDefinition(query);
  //     return (
  //       definition.kind === "OperationDefinition" &&
  //       definition.operation === "subscription"
  //     );
  //   },
  //   wsLink,
  //   httpLink
  // );

  // NOTE [grimmer]: comment temporarily
  //   const stateLink = withClientState({
  //     cache,
  //     defaults,
  //     resolvers,
  //     typeDefs
  //   });

  return new ApolloClient({
    // connectToDevTools: process.browser,
    // ssrMode: !process.browser,
    link: ApolloLink.from([link]), // stateLink,
    cache
    // uri: "http://localhost:4000/graphql"
  });
}

// not necessary
// function initApollo(initialState) {
//   // if (!process.browser) {
//   //   return create(initialState);
//   // }

//   // Reuse client on the client-side
//   if (!apolloClient) {
//     apolloClient = create(initialState);
//   }

//   return apolloClient;
// }
// *** init-apollo ***
// ref: https://github.com/chrizzzle/modulo/blob/master/lib/with-apollo-client.tsx
// const withApolloClient = App => {
//   return class Apollo extends React.Component {
//     apolloClient;

//     static displayName = "withApollo(App)";

//     // NOTE [grimmer]: comment temporarily
//     // static async getInitialProps(ctx) {
//     //   const { Component, router } = ctx;

//     //   let appProps = {};
//     //   if (App.getInitialProps) {
//     //     appProps = await App.getInitialProps(ctx);
//     //   }

//     //   // Run all GraphQL queries in the component tree
//     //   // and extract the resulting data
//     //   const apollo = initApollo();
//     //   if (!process.browser) {
//     //     try {
//     //       // Run all GraphQL queries
//     //       await getDataFromTree(
//     //         <App
//     //           {...appProps}
//     //           Component={Component}
//     //           router={router}
//     //           apolloClient={apollo}
//     //         />
//     //       );
//     //     } catch (error) {
//     //       // Prevent Apollo Client GraphQL errors from crashing SSR.
//     //       // Handle them in components via the data.error prop:
//     //       // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
//     //       console.error("Error while running `getDataFromTree`", error);
//     //     }

//     //     // getDataFromTree does not call componentWillUnmount
//     //     // head side effect therefore need to be cleared manually
//     //     Head.rewind();
//     //   }

//     //   // Extract query data from the Apollo store
//     //   const apolloState = apollo.cache.extract();

//     //   return {
//     //     ...appProps,
//     //     apolloState
//     //   };
//     // }

//     constructor(props) {
//       super(props);
//       this.apolloClient = create(props.apolloState);
//       // initApollo(props.apolloState);
//     }

//     render() {
//       return <App {...this.props} apolloClient={this.apolloClient} />;
//     }
//   };
// };

// const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";
// const GRAPHQL_WS_ENDPOINT = "ws://localhost:4000/subscriptions";

// Create an http link:
// const httpLink = new HttpLink({
//   uri: "http://localhost:4000/graphql",
//   fetch: fetch
// });

// const wsLink = process.browser
//   ? new WebSocketLink(
//       new SubscriptionClient(GRAPHQL_WS_ENDPOINT, {
//         reconnect: true
//       })
//     )
//   : null;

// const httpLink = new HttpLink({
//   uri: GRAPHQL_ENDPOINT,
//   fetch: fetch
// });

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

// const link = wsLink
//   ? split(
//       ({ query }) => {
//         let definition = getMainDefinition(query);
//         return (
//           definition.kind === "OperationDefinition" &&
//           definition.operation === "subscription"
//         );
//       },
//       wsLink,
//       httpLink
//     )
//   : httpLink;

// const link2 = ApolloLink.from([link]);

// const cache = new InMemoryCache();

// const client = new ApolloClient({
//   fetch: fetch,
//   link: link2,
//   cache: cache,

//   // link: link // 沒加上去就會出現紅色的試著連線次數 (跟 node ws server 無關),
//   // 加上去則: ApolloBoost was initialized with unsupported options: link
//   // a. 使用 link 重連紅色
//   // b. 使用 link2: client.js:111 WebSocket connection to 'ws://localhost:5000/' failed: WebSocket is closed before the connection is established
//   // 如果有開 ws server, 有沒有加都沒差, 都會 crash

//   // NOTE: if omit,
//   // http://localhost:3000/graphql
//   // [Network error]: ServerParseError: Unexpected token N in JSON at position 0
//   // graphql query error and  + sub data: undefined

// cannot be used, use http link instead, otherwise subscription will not work
//   uri: "http://localhost:4000/graphql"
// });

const apolloClient = create();

class MyApp extends App {
  // apolloClient;

  static displayName = "withApollo(App)";

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return {
      pageProps
    };
  }

  // constructor(props) {
  //   super(props);
  //   this.apolloClient = create(props.apolloState);
  // }

  // render() {
  //   return <App {...this.props} apolloClient={this.apolloClient} />;
  // }

  render() {
    // const { Component, pageProps } = this.props;
    const { Component, pageProps } = this.props;

    return (
      <ApolloProvider client={apolloClient}>
        <Container>
          <Component {...pageProps} />{" "}
        </Container>
      </ApolloProvider>
    );
  }
}

// export default MyApp;
export default MyApp;
