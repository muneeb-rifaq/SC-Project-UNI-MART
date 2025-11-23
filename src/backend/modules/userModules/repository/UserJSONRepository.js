// UserJSONRepository.js
import fs from "fs";
import User from "../User.js";
import UserFactory from "../UserFactory.js";
import UserRepository from "./UserRepository.js";

class UserJSONRepository extends UserRepository {
  constructor(filePath) {
    super(filePath);
    this.initializeFileIfMissing();
  }

  initializeFileIfMissing() {
    if (!fs.existsSync(this.filePath)) {
      const sampleUsers = [
        UserFactory.makeSampleUser(1),
        UserFactory.makeSampleUser(2),
        UserFactory.makeSampleUser(3),
      ];
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(
          sampleUsers.map((u) => u.toJSON()),
          null,
          2
        )
      );
    }
  }

  load() {
    if (!fs.existsSync(this.filePath)) return [];
    const raw = fs.readFileSync(this.filePath, "utf8");
    return JSON.parse(raw).map((obj) => User.fromJSON(obj));
  }

  save(users) {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(
          users.map((u) => u.toJSON()),
          null,
          2
        )
      );
      return true;
    } catch {
      return false;
    }
  }

  addUser(user) {
    const users = this.load();
    users.push(user);
    return this.save(users) ? user : null;
  }

  deleteUser(id) {
    let users = this.load();
    const before = users.length;
    users = users.filter((u) => u.getAttribute("userId") !== id);
    return this.save(users) && users.length !== before;
  }

  changeAttribute(id, attributeName, newValue) {
    const users = this.load();
    const user = users.find((u) => u.getAttribute("userId") === id);

    if (!user || !user.updateAttribute(attributeName, newValue)) return null;

    return this.save(users) ? user : null;
  }

  eraseAll() {
    return this.save([]);
  }
}

export default UserJSONRepository;
