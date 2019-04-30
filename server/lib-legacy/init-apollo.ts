import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink
} from "apollo-boost";
import fetch from "isomorphic-unfetch";
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
// import { defaults, resolvers, typeDefs } from "./resolvers/resolvers";
import { withClientState } from "apollo-link-state";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";
const GRAPHQL_WS_ENDPOINT = "ws://localhost:4000/subscriptions";

let apolloClient: ApolloClient<any>;

const wsLink = (process as any).browser
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
if (!(process as any).browser) {
  (global as any).fetch = fetch;
}

function create(initialState: any) {
  const cache = new InMemoryCache().restore(initialState || {});

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

  //   const stateLink = withClientState({
  //     cache,
  //     defaults,
  //     resolvers,
  //     typeDefs
  //   });

  return new ApolloClient({
    connectToDevTools: (process as any).browser,
    ssrMode: !(process as any).browser,
    link: ApolloLink.from([link]), // stateLink,
    cache
    // uri: "http://localhost:4000/graphql"
  });
}

export default function initApollo(initialState: any) {
  if (!(process as any).browser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
