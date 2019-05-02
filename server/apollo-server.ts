const { ApolloServer, gql } = require("apollo-server");

const { PubSub } = require("apollo-server");
const POST_ADDED = "POST_ADDED";
const pubsub = new PubSub();

// const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";
// const GRAPHQL_WS_ENDPOINT = "ws://localhost:4000/subscriptions";

const typeDefs = gql`
  type Subscription {
    postAdded: Post
  }

  type Post {
    author: String
    comment: String
    commentCount: Int
  }

  type Query {
    hello: String
  }
`;

let commentCount = 0;

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
      setInterval(() => {
        console.log("publish post_add");
        commentCount += 1;
        pubsub.publish(POST_ADDED, {
          postAdded: {
            author: "grimmer",
            comment: "noComment",
            commentCount: commentCount
          }
        });
      }, 3000);
      return "Hello world!";
    }
  }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
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

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen(4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
