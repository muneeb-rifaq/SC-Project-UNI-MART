import User from "./User.js";
import bcrypt from "bcryptjs";

class UserFactory {
  /*
    makeUser: creates a new User instance.
    params: attributes for User class
    returns: User instance
  */
  static makeUser(userId, username, email, plainPassword, lastLogin = null) {
    const passwordHash = bcrypt.hashSync(plainPassword, 10);
    return new User(userId, username, email, passwordHash, null, lastLogin);
  }

  /*
    makeSampleUser: returns a new User with randomized values.
    useful for testing / sample data.
  */
  static makeSampleUser(id) {
    const sampleNames = [
      "john_doe",
      "alice_smith",
      "bob_jones",
      "eve_williams",
    ];
    const sampleDomains = ["example.com", "mail.com", "test.org"];

    const username =
      sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const email = `${username}@${
      sampleDomains[Math.floor(Math.random() * sampleDomains.length)]
    }`;

    const plainPassword = "password123"; // default test password
    const lastLogin = null;

    return UserFactory.makeUser(id, username, email, plainPassword, lastLogin);
  }
}

export default UserFactory;
