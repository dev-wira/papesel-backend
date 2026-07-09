const Hash = require("bcryptjs");

const hash = async (stuff) => {
  return await Hash.hash(stuff, 10);
};

const compare = async (plain_stuff, hashed_stuff) => {
  return await Hash.compare(plain_stuff, hashed_stuff);
};

const otp = async () => {};

module.exports = { hash, compare };
