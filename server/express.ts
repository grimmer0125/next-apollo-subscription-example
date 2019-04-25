const express = require("express");
import { createServer } from "http";
const { ApolloServer, gql } = require("apollo-server-express");

const { PubSub } = require("apollo-server");
const POST_ADDED = "POST_ADDED";
const pubsub = new PubSub();

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

const app = express();

const apolloServer = new ApolloServer({ typeDefs, resolvers });
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

// var express = require('express');
// var app = express();

// app.get('/', async function (req, res) {
//   console.log("1")
//   const a = new Promise(function(resolve, reject) {
//     setTimeout(function() {
//       resolve('foo');
//     }, 5000);
//   });

//   await a;

//   console.log("2")

//   res.send('Hello World!');
// });

// app.listen(3000, function () {

//   console.log('Example app listening on port 3000!');
// });
