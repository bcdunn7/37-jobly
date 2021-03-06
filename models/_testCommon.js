const bcrypt = require("bcrypt");

const db = require("../db");
const Job = require("./job")
const { BCRYPT_WORK_FACTOR } = require("../config");

let testJobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

      testJobIds[0] = (await Job.create({
        title: "j1",
        salary: 1,
        equity: 0,
        companyHandle: "c1"
      })).id;
      testJobIds[1] = (await Job.create({
        title: "j2",
        salary: 2,
        equity: 0.5,
        companyHandle: "c1"
      })).id;
      testJobIds[2] = (await Job.create({
        title: "j3",
        salary: 3,
        equity: 0.01,
        companyHandle: "c2"
      })).id;
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
};