// UserJSONRepository.js
import fs from "fs";
import User from "../User.js";
import UserRepository from "./UserRepository.js";

export default class UserJSONRepository extends UserRepository {
  constructor(path) {
    super(path);

    // Initialize file if missing
    if (!fs.existsSync(path)) {
      fs.writeFileSync(
        path,
        JSON.stringify(
          {
            lastId: 0,
            users: [],
          },
          null,
          2
        )
      );
    }
  }

  //------------------------------------------
  // INTERNAL UTILITIES
  //------------------------------------------
  _readFile() {
    return JSON.parse(fs.readFileSync(this.path, "utf8"));
  }

  _writeFile(data) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  //------------------------------------------
  // Load → return array of User instances
  //------------------------------------------
  load() {
    const data = this._readFile();
    return data.users.map((obj) => User.fromJSON(obj));
  }

  //------------------------------------------
  // Add user with AUTOINCREMENT behavior
  //------------------------------------------
  addUser(userInstance) {
    const data = this._readFile();

    const expectedId = data.lastId + 1;
    const givenId = userInstance.getAttribute("userId");

    if (givenId !== expectedId) {
      throw new Error(
        `UserJSONRepository.addUser: userId must be ${expectedId}, received ${givenId}`
      );
    }

    // Store updated lastId
    data.lastId = expectedId;

    // Save user JSON
    data.users.push(userInstance.toJSON());

    this._writeFile(data);
    return userInstance; // return passed instance (same behavior as SQL repo)
  }

  //------------------------------------------
  // Delete user by ID
  //------------------------------------------
  deleteUser(id) {
    const data = this._readFile();
    const before = data.users.length;

    data.users = data.users.filter((u) => u.userId !== id);

    this._writeFile(data);

    return data.users.length !== before;
  }

  //------------------------------------------
  // Change attribute (allowed list only)
  //------------------------------------------
  updateAttribute(id, attr, val) {
    const allowed = new Set([
      "username",
      "email",
      "passwordHash",
      "role",
      "lastLogin",
    ]);

    if (!allowed.has(attr)) {
      console.warn(
        `UserJSONRepository.changeAttribute: attribute "${attr}" not allowed.`
      );
      return null;
    }

    const data = this._readFile();
    const user = data.users.find((u) => u.userId === id);
    if (!user) return null;

    // Update value
    user[attr] = val;
    user.updatedAt = new Date().toISOString();

    this._writeFile(data);

    return User.fromJSON(user);
  }

  //------------------------------------------
  // Save (overwrite all users) — keep lastId!
  //------------------------------------------
  // save(users) {
  //   const data = this._readFile();

  //   data.users = users.map((u) => u.toJSON());

  //   this._writeFile(data);
  //   return true;
  // }

  //------------------------------------------
  // Erase all users — BUT KEEP lastId!!
  //------------------------------------------
  eraseAll() {
    const data = this._readFile();
    data.users = [];
    // leave data.lastId untouched (autoincrement never resets)
    this._writeFile(data);
    return true;
  }

  //------------------------------------------
  // Return last used ID (NOT highest existing)
  //------------------------------------------
  getHighestID() {
    const data = this._readFile();
    return data.lastId;
  }
}
