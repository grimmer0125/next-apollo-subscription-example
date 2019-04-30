import React from "react";

import { ApolloProvider, Query, Subscription } from "react-apollo";

import { gql } from "apollo-boost";

import logo from "./logo.svg";
import "./App.css";

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

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code> src / App.js </code> and save to reload.{" "}
        </p>{" "}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React{" "}
        </a>{" "}
      </header>{" "}
      <HelloUI />
      <SubscribeUI />
    </div>
  );
}

export default App;
