import { gql } from "apollo-boost";

export default {
  userFragment: gql`
    fragment userAttrsFragment on test_users {
      id
      first_name
      last_name
      email
    }
  `
};
