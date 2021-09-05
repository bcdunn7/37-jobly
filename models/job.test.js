"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 5,
        equity: 0.2,
        companyHandle: "c1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            id: expect.any(Number),
            title: "new",
            salary: 5,
            equity: '0.2',
            companyHandle: "c1"
        });

        const result = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE title = 'new'`);
        expect(result.rows).toEqual([
            {
                title: "new",
                salary: 5,
                equity: '0.2',
                company_handle: "c1"
            }
        ]);
    });
});

/************************************** findAll */

describe('findAll', function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "j1",
                salary: 1,
                equity: '0',
                companyHandle: "c1"
            },
            {
                id: testJobIds[1],
                title: "j2",
                salary: 2,
                equity: '0.5',
                companyHandle: "c1"
            },
            {
                id: testJobIds[2],
                title: "j3",
                salary: 3,
                equity: '0.01',
                companyHandle: "c2"
            }
        ]);
    });

    test('works: title filter', async function () {
        let q = {title: "j1"};
        let jobs = await Job.findAll(q);
        expect(jobs).toEqual([{
            id: testJobIds[0],
            title: "j1",
            salary: 1,
            equity: '0',
            companyHandle: "c1"
        }]);
    });

    test('works: minSalary filter', async function () {
        let q = {minSalary: 3};
        let jobs = await Job.findAll(q);
        expect(jobs).toEqual([{
            id: testJobIds[2],
            title: "j3",
            salary: 3,
            equity: '0.01',
            companyHandle: "c2"
        }]);
    });

    test('works: hasEquity filter', async function () {
        let q = {hasEquity: true};
        let jobs = await Job.findAll(q);
        expect(jobs).toEqual([
            {
                id: testJobIds[1],
                title: "j2",
                salary: 2,
                equity: '0.5',
                companyHandle: "c1"
            },
            {
                id: testJobIds[2],
                title: "j3",
                salary: 3,
                equity: '0.01',
                companyHandle: "c2"
            }
        ]);
    });
    
    test('works: title and minSalary filter', async function () {
        let q = {title: "j3", minSalary: 3};
        let jobs = await Job.findAll(q);
        expect(jobs).toEqual([{
            id: testJobIds[2],
            title: "j3",
            salary: 3,
            equity: '0.01',
            companyHandle: "c2"
        }]);
    });

    test('works: minSalary and hasEquity filter', async function () {
        let q = {minSalary: 3, hasEquity: true};
        let jobs = await Job.findAll(q);
        expect(jobs).toEqual([{
            id: testJobIds[2],
            title: "j3",
            salary: 3,
            equity: '0.01',
            companyHandle: "c2"
        }]);
    });

    test('works: no jobs, title and hasEquity filter', async function () {
        let q = {title: "j1", hasEquity: true};
        let jobs = await Job.findAll(q);
        // will find none
        expect(jobs).toEqual([]);
    });

    test('works: title, minSalary, and hasEquity filter', async function () {
        let q = {title: "j3", minSalary: 3, hasEquity: true};
        let jobs = await Job.findAll(q);
        expect(jobs).toEqual([{
            id: testJobIds[2],
            title: "j3",
            salary: 3,
            equity: '0.01',
            companyHandle: "c2"
        }]);
    });

    test('works: no jobs, title not found', async function () {
        let q = {title: "zzz"};
        let jobs = await Job.findAll(q);
        // will find none
        expect(jobs).toEqual([]);
    });
});

/************************************** get */

describe('get', function () {
    test("works", async function () {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "j1",
            salary: 1,
            equity: '0',
            companyHandle: "c1"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
});

/************************************** update */

describe('update', function () {
    const updateData = {
        title: "new",
        salary: 9,
        equity: 0.9
    };

    test("works", async function() {
        const job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "new",
            salary: 9,
            equity: '0.9',
            companyHandle: 'c1'
        });

        const result = await db.query(`
        SELECT title, salary, equity, company_handle
        FROM jobs
        WHERE title = 'new'`
        );
        expect(result.rows).toEqual([{
            title: "new",
            salary: 9,
            equity: '0.9',
            company_handle: 'c1'
        }]);
    });

    test("not found if no such company", async function() {
        try {
            await Job.update(999, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
          await Job.update(testJobIds[0], {});
          fail();
        } catch (err) {
          expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** delete */

describe('remove', function () {
    test("works", async function () {
        await Job.remove(testJobIds[0]);
        const res = await db.query("Select title FROM jobs WHERE title = 'j1'");
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function() {
        try {
            await Job.remove(999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
