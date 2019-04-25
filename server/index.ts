const Koa = require("koa");
const { ApolloServer, gql } = require("apollo-server-koa");

// TODO: integrate it with nextjs?
// https://lorefnon.tech/2018/08/18/integrating-next-js-apollo-server-and-koa/

// https://www.apollographql.com/docs/apollo-server/v1/graphiql
// import { graphiqlKoa } from "apollo-server-koa";
// import { graphqlKoa } from "apollo-server-koa/dist/koaApollo";
// import { GraphQLError } from "graphql";
import graphiql from "koa-graphiql";

const Router = require("koa-router");

// koa built-in way
// app.use(async (ctx,next)=>{
//   if (ctx.path === '/404') {
//     ctx.body = 'page not found';
//   } else {
//     await next;
//   }
// })

// koa-router
// .get('/', (ctx, next) => {
//   ctx.body = 'Hello World!';
// })
// .post('/users', (ctx, next) => {
//   // ...
// })

const { PubSub } = require("apollo-server");
const pubsub = new PubSub();
// export default pubsub;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello(name: String): String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => {
      return "Hello world!";
    }
  }
};

// sub:
// https://github.com/apollographql/apollo-server/blob/5735e79ca8c59d3292a3ef7dd9bb65ebe1098acd/packages/apollo-server-integration-testsuite/src/ApolloServer.ts
// https://github.com/apollographql/apollo-server/blob/5735e79ca8c59d3292a3ef7dd9bb65ebe1098acd/packages/apollo-server-integration-testsuite/src/ApolloServer.ts#L994
// https://github.com/apollographql/apollo-server/issues/1462
const app = new Koa();
const router = new Router();
router.get("/hello", (ctx, next) => {
  ctx.body = "Hello World!";
});
// router.get("/graphiql", graphiqlKoa({ endpointURL: "/graphql" }));
router.get(
  "/graphiql",
  graphiql(async ctx => ({
    url: "/graphql"
  }))
);

app.use(router.routes()).use(router.allowedMethods());

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

// app.listen({ port: 4000 }, () =>
//   console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
// );
//${app.port}

console.log("app.port:", app.port);
const httpServer = app.listen(4000, () =>
  console.log(`app is listening on port 4000`)
);
server.installSubscriptionHandlers(httpServer);
