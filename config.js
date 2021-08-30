"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// to deal with invalid characters in password
const URI_DB_PASSWORD = `${encodeURIComponent(process.env.DB_PASSWORD)}`

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
  ? `postgresql://${process.env.DB_USER}:${URI_DB_PASSWORD}@localhost:${process.env.DB_PORT}/jobly_test`
  : `postgresql://${process.env.DB_USER}:${URI_DB_PASSWORD}@localhost:${process.env.DB_PORT}/jobly`;
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, (process.env.NODE_ENV === "test") ? "jobly_test": "jobly");
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
