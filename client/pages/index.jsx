import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import { gql } from "apollo-boost";

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
    </div>
  </div>
);

export default Index;
