import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { toIdValue } from "apollo-utilities";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "@apollo/react-hooks";

import UsersList from "./users/UsersList.js";
import * as serviceWorker from "./serviceWorker";

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      test_users_by_pk: (_, args) =>
        toIdValue(
          cache.config.dataIdFromObject({
            __typename: "test_users",
            id: args.id,
          })
        ),
    },
  },
});

const client = new ApolloClient({
  uri: "http://localhost:8080/v1/graphql",
  cache,
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <UsersList />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
