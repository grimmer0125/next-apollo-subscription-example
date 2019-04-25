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

const POST_ADDED = "POST_ADDED";
const pubsub = new PubSub();
// export default pubsub;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Subscription {
    postAdded: Post
  }

  type Post {
    author: String
    comment: String
  }

  type Query {
    hello(name: String): String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Subscription: {
    postAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([POST_ADDED])
    }
  },
  Query: {
    hello: () => {
      console.log("get hello query");

      // example:
      // 1. https://github.com/the-road-to-graphql/fullstack-apollo-subscription-example/blob/master/server/src/index.js
      // 2. https://github.com/dmitryAgli/todoApp_apollo

      // https://www.apollographql.com/docs/react/advanced/subscriptions
      // https://github.com/apollographql/apollo-server/blob/5735e79ca8c59d3292a3ef7dd9bb65ebe1098acd/packages/apollo-server-integration-testsuite/src/ApolloServer.ts#L994

      // TODO: not work !!!
      setTimeout(() => {
        console.log("publish post_add");
        pubsub.publish(POST_ADDED, {
          postAdded: { author: "grimmer", comment: "11" }
        });
      }, 10000);
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
const port = 8000;
const httpServer = app.listen(port, () =>
  console.log(`app is listening on port ${port}`)
);
server.installSubscriptionHandlers(httpServer);
