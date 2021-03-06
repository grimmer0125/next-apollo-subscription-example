# next-apollo-subscription-example

## issue

1. If you use https://github.com/accounts-js, its context may make subscription on ApolloServer fail, ref: https://github.com/accounts-js/accounts/pull/565

The workaround way is 
```
    context: async (ctx: any) => {
      const { req, connection } = ctx;
      if (!req || !req.headers) {
        return {};
      }

      let resp = {};
      try {
        resp = accountsGraphQL.context(ctx);
      } catch (err) {
        console.log("accountsGraphQL.context err:", err); // can not read undefind of session
      }
      return resp;
    },
```

## steps

1. use VSCode to launch node.js server (index.ts, pure apollo server)
2. `yarn dev` in next-standalone
3. open http://localhost:3000 to see subscription result

OR you can

1. using the VSCode 2nd launch config to launch apollo-express-erver.ts (open that file first)
2. `yarn dev` in next-standalone
3. open http://localhost:3000 to see subscription result

OR you can

1. using the VSCode 2nd launch config to launch apollo-next-server.ts (open that file first)
2. open http://localhost:3000 to see subscription result

## references

1. https://www.apollographql.com/docs/react/advanced/subscriptions
2. https://www.apollographql.com/docs/react/features/server-side-rendering
3. https://github.com/chrizzzle/modulo

## Key points (uri, websocket lib issue in next.js ssr environment)

1. You many need to set `import fetch from "isomorphic-unfetch"; and HttpLink({fetch:fetch)` once your setting does not find out fetch
2. not use `import ApolloClient from "apollo-boost";` use `import { ApolloClient } from 'apollo-client'/'apollo-boost';`
3. WebSocketLink and HttpLink use the same address:port, they even use the same path (/graphql) if ApolloServer does not specify subscriptions' path
4. ApolloClient do not need to set uri
5. use isomorphic-ws or process.browser? to create WebSocketLink

```
const WebSocket2 = require("isomorphic-ws");
const wsLink = new WebSocketLink({
  webSocketImpl: WebSocket2 // browser can not use ws's WebSocket
});
```

or

```
const wsLink = process.browser
  ? new WebSocketLink(
      new SubscriptionClient(GRAPHQL_WS_ENDPOINT, {
        reconnect: true
      })
    )
  : null;

const link = wsLink
    ? split(
```
