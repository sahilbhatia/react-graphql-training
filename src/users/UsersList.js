import React from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";

import UsersSegments from "./UsersSegments.js";
import UserDetails from "./UserDetails.js";
import CreateUser from "./CreateUser.js";

export const usersListQuery = gql`
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

const deleteUserMutation = gql`
  mutation DeleteUserMutation($id: Int!) {
    delete_test_users(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

function App() {
  const { loading: isLoading, error, data, fetchMore } = useQuery(
    usersListQuery,
    {
      variables: { limit: 5, offset: 0 },
    }
  );

  const [deleteUser, { loading: deleting, error: deleteError }] = useMutation(
    deleteUserMutation
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

  const handleUserDeletion = (evt) => {
    if (deleting) return;

    const selectedUserId = parseInt(evt.target.dataset.id);
    deleteUser({
      variables: {
        id: selectedUserId,
      },
      update: (client) => {
        const data = client.readQuery({
          query: usersListQuery,
          variables: { limit: 5, offset: 0 },
        });

        const newData = {
          users: data.users.filter((user) => user.id !== selectedUserId),
          users_aggregate: {
            __typename: "test_users_aggregate",
            aggregate: {
              __typename: "test_users_aggregate_fields",
              count: data.users_aggregate.aggregate.count - 1,
            },
          },
        };

        client.writeQuery({
          query: usersListQuery,
          variables: { limit: 5, offset: 0 },
          data: newData,
        });
      },
    });
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

      {
        <div className="users-list">
          {data.users.length === 0 && "No users found!"}

          {data.users.map((user) => (
            <div key={user.id}>
              <UserDetails userId={user.id} />

              <div className="user-details-button">
                <button
                  type="button"
                  onClick={showUserDetails}
                  data-id={user.id}
                >
                  Show details
                </button>
              </div>

              <br />

              <div className="user-delete-button">
                <button
                  type="button"
                  onClick={handleUserDeletion}
                  data-id={user.id}
                >
                  {deleting ? "Deleting..." : "Delete user"}
                </button>

                <div className="user-deletion-error">{deleteError}</div>
              </div>

              <hr />
            </div>
          ))}
        </div>
      }

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
