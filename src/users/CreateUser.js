import React from "react";
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

import UsersSegments from "./UsersSegments.js";

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
  const [firstName, setFirstName] = React.useState();
  const [lastName, setLastName] = React.useState();
  const [email, setEmail] = React.useState();
  const [addUser, { data, loading: isLoading, error }] = useMutation(
    createUserMutation
  );

  const handleTextChange = (evt) => {
    const val = evt.target.value;

    switch (evt.target.name) {
      case "firstName":
        setFirstName(val);
        break;
      case "lastName":
        setLastName(val);
        break;
      case "email":
        setEmail(val);
        break;
      default:
      // do nothing
    }
  };

  const handleFormSubmit = (evt) => {
    evt.preventDefault();

    addUser({
      variables: {
        firstName,
        lastName,
        email,
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
        <input
          type="text"
          name="firstName"
          value={firstName}
          onChange={handleTextChange}
        />

        <label>Last name: </label>
        <input
          type="text"
          name="lastName"
          value={lastName}
          onChange={handleTextChange}
        />

        <label>Email: </label>
        <input
          type="text"
          name="email"
          value={email}
          onChange={handleTextChange}
        />

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
