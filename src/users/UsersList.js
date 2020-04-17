import React from "react";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

import UsersSegments from "./UsersSegments.js";
import UserDetails from "./UserDetails.js";
import CreateUser from "./CreateUser.js";

const usersListQuery = gql`
  query Users($limit: Int, $offset: Int) {
    users: test_users(limit: $limit, offset: $offset) {
      ...userAttrsFragment
    }
    users_aggregate: test_users_aggregate {
      aggregate {
        count
      }
    }
  }
  ${UsersSegments.userFragment}
`;

function App() {
  const { loading: isLoading, error, data, fetchMore } = useQuery(
    usersListQuery,
    {
      variables: { limit: 5, offset: 0 },
    }
  );

  const [userId, setUserId] = React.useState();
  const [showCreateUserPage, setShowCreateUserPage] = React.useState(false);

  const fetchMoreUsers = () => {
    fetchMore({
      variables: { limit: 5, offset: data.users.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          ...prev,
          users: [...prev.users, ...fetchMoreResult.users],
        };
      },
    });
  };

  const showUserDetails = (evt) => {
    const selectedUserId = parseInt(evt.target.dataset.id);
    setUserId(selectedUserId);
  };

  const backToUserListing = () => {
    setUserId(null);
    setShowCreateUserPage(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;
  if (userId)
    return <UserDetails userId={userId} backAction={backToUserListing} />;
  if (showCreateUserPage) return <CreateUser backAction={backToUserListing} />;

  const totalUsersCount = data.users_aggregate.aggregate.count;

  return (
    <>
      <button
        className="create-users-btn"
        style={{ marginBottom: "2em" }}
        onClick={() => setShowCreateUserPage(true)}
      >
        Create User
      </button>

      {data.users.map((user) => (
        <div key={user.id} className="users-list">
          <UserDetails userId={user.id} />

          <div className="user-details-button">
            <button type="button" onClick={showUserDetails} data-id={user.id}>
              Show details
            </button>
          </div>

          <hr />
        </div>
      ))}

      {data.users.length < totalUsersCount && (
        <p>
          <button type="button" onClick={fetchMoreUsers}>
            Fetch more
          </button>
        </p>
      )}
    </>
  );
}

export default App;
