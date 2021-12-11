const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    let user1 = user['id'];
    const expectedUserID = "userRandomID";
    assert.equal(user1, expectedUserID);
  });

  it('should return undefined for a non existent email', function() {
    const user = findUserByEmail("mp@gmail.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});