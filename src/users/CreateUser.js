import React from "react";
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

import UsersSegments from "./UsersSegments.js";
import { usersListQuery } from "./UsersList.js";

const createUserMutation = gql`
  mutation CreateUserMutation(
    $firstName: String
    $lastName: String
    $email: String
  ) {
    user: insert_test_users(
      objects: { first_name: $firstName, last_name: $lastName, email: $email }
    ) {
      returning {
        ...userAttrsFragment
      }
    }
  }
  ${UsersSegments.userFragment}
`;

function CreateUser({ backAction }) {
  const [addUser, { data, loading: isLoading, error }] = useMutation(
    createUserMutation
  );

  const handleFormSubmit = (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);

    addUser({
      variables: {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
      },
      update: (client, { data: response }) => {
        const data = client.readQuery({
          query: usersListQuery,
          variables: { limit: 5, offset: 0 },
        });

        const newData = {
          users: data.users.concat(response.user.returning[0]),
          users_aggregate: {
            __typename: "test_users_aggregate",
            aggregate: {
              __typename: "test_users_aggregate_fields",
              count: data.users_aggregate.aggregate.count + 1,
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

  const goToUsersList = () => {
    backAction(null);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;
  if (data) {
    const user = (data && data.user.returning[0]) || {};

    return (
      <>
        <div>ID: {user.id}</div>
        <div>First name: {user.first_name}</div>
        <div>Last name: {user.last_name}</div>
        <div>Email: {user.email}</div>
        <p>
          {backAction && (
            <button className="back-to-users-list-btn" onClick={goToUsersList}>
              Back
            </button>
          )}
        </p>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <label>First name: </label>
        <input type="text" name="firstName" />

        <label>Last name: </label>
        <input type="text" name="lastName" />

        <label>Email: </label>
        <input type="text" name="email" />

        <input type="submit" value="Submit" />
      </form>

      <p>
        {backAction && (
          <button className="back-to-users-list-btn" onClick={goToUsersList}>
            Back
          </button>
        )}
      </p>
    </>
  );
}

export default CreateUser;
