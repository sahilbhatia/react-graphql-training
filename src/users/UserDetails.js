import React from "react";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

import UsersSegments from "./UsersSegments.js";

const userDetailsQuery = gql`
  query User($id: Int!) {
    user: test_users_by_pk(id: $id) {
      ...userAttrsFragment
    }
  }
  ${UsersSegments.userFragment}
`;

function UserDetails({ userId, backAction }) {
  const { loading: isLoading, error, data } = useQuery(userDetailsQuery, {
    variables: { id: userId },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  const user = data.user;

  return (
    <div key={user.id} className="user-details">
      <div className="user-first-name">
        <label>
          <strong>First name:&nbsp;</strong>
        </label>
        <span className="user-first-name">{user.first_name}</span>
      </div>

      <div className="user-last-name">
        <label>
          <strong>Last name:&nbsp;</strong>
        </label>
        <span className="user-last-name">{user.last_name}</span>
      </div>

      <div className="user-email">
        <label>
          <strong>Email:&nbsp;</strong>
        </label>
        <span className="user-email">{user.email}</span>
      </div>

      <p>
        {backAction && (
          <button className="back-to-users-list-btn" onClick={backAction}>
            Back
          </button>
        )}
      </p>
    </div>
  );
}

export default UserDetails;
