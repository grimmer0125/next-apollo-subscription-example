import { ApolloProvider } from "react-apollo";
import { Query, Subscription } from "react-apollo";

import { gql } from "apollo-boost";

const POSTS_SUBSCRIPTION = gql`
  subscription onPostAdded {
    postAdded {
      author
      comment
    }
  }
`;

const SubscribeUI = () => (
  <Subscription
    subscription={POSTS_SUBSCRIPTION}
    // variables={{ repoFullName }}
  >
    {({ data, loading }) => {
      if (loading) return <p>sub Loading...</p>;
      console.log("sub data:", data);
      return (
        // return <div>{data.hello}</div>;
        <h4>
          comment:{" "}
          {/* {!loading && (onPostAdded ? onPostAdded.content : null)} */}
        </h4>
      );
    }}
  </Subscription>
);

const HelloUI = () => (
  <Query
    query={gql`
      {
        hello
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;
      console.log("data:", data);
      return <div>{data.hello}</div>;
    }}
  </Query>
);

const Index = () => (
  <div>
    <p> Hello Next.js </p>{" "}
    <div>
      <h2>My first Apollo app 🚀</h2>
      <HelloUI />
      <SubscribeUI />
    </div>
  </div>
);

export default Index;
