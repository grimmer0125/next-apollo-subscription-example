// const api = require("./lib/api");
// const body = require("body-parser");
// const co = require("co");
// const express = require("express");
// const next = require("next");
// const cors = require("cors");
// const { ApolloServer } = require("apollo-server-express");
// const dev = process.env.NODE_ENV !== "production";
// const nextApp = next({ dev });
// const handle = nextApp.getRequestHandler();
// const PORT = 3000;
// const http = require("http");

const { PubSub } = require("apollo-server");
const POST_ADDED = "POST_ADDED";
const pubsub = new PubSub();

const { gql } = require("apollo-server-express");

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
    hello: String
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

// ref: https://github.com/dizzyn/code-beer/blob/master/src/server.js
// nextApp.prepare().then(() => {
//   // const config = require("./config/config");
//   // const { typeDefs, resolvers } = require("./lib/schema");

//   const apolloServer = new ApolloServer({
//     typeDefs,
//     resolvers,
//     uploads: false,
//     subscriptions: {
//       path: "/subscriptions",
//       onConnect: async (connectionParams, webSocket) => {
//         console.log(
//           `Subscription client connected using Apollo server's built-in SubscriptionServer.`
//         );
//       }
//     }
//   });

//   const app = express();
//   const httpServer = http.createServer(app);
//   apolloServer.applyMiddleware({ app: app });
//   apolloServer.installSubscriptionHandlers(httpServer);

//   // app.use(body.json());
//   app.use((req, res, next) => {
//     // Also expose the MongoDB database handle so Next.js can access it.
//     next();
//   });
//   // app.use("/api", api());
//   app.use(cors());

//   const port2 = 4000;
//   httpServer.listen(port2, () => {
//     console.log(
//       `Graphql server ready at http://localhost:${port2}${
//         apolloServer.graphqlPath
//       }`
//     );
//     console.log(
//       `Graphql subscription server ready at ws://localhost:${port2}${
//         apolloServer.subscriptionsPath
//       }`
//     );
//   });

//   // Everything that isn't '/api' gets passed along to Next.js
//   app.get("*", (req, res) => {
//     return handle(req, res);
//   });

//   // need this ? next port?
//   app.listen(PORT, () => {
//     console.log(`Server ready at http://localhost:${PORT}`);
//   });
// });

const express = require("express");
import { createServer } from "http";
const { ApolloServer } = require("apollo-server-express");

const app = express();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    path: "/subscriptions",
    onConnect: async (connectionParams, webSocket) => {
      console.log(
        `Subscription client connected using Apollo server's built-in SubscriptionServer.`
      );
    }
  }
});
apolloServer.applyMiddleware({ app });

const httpServer = createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

const PORT = 4000;

httpServer.listen({ port: PORT }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${
      apolloServer.subscriptionsPath
    }`
  );
});

// var express = require("express");
// var app = express();

// app.get("/", async function(req, res) {
//   console.log("1");
//   const a = new Promise(function(resolve, reject) {
//     setTimeout(function() {
//       resolve("foo");
//     }, 5000);
//   });

//   await a;

//   console.log("2");

//   res.send("Hello World!");
// });

// app.listen(3000, function() {
//   console.log("Example app listening on port 3000!");
// });
