"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  uAToken,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/**************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "new",
        salary: 8,
        equity: 0.8,
        companyHandle: "c1"
    };

    test("works for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "new",
                salary: 8,
                equity: '0.8',
                companyHandle: "c1"
            },
        });
    });

    test("unauth for non admin", async function () {
        const resp = await request(app)
            .post("/companies")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
    
    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new",
            })
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.statusCode).toEqual(400);
    });
    
    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: 11, //invalid
                salary: 8,
                equity: 0,
                companyHandle: "c1"
            })
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request if no company", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new",
                salary: 8,
                equity: 0,
                companyHandle: "wrong"
            })
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.statusCode).toEqual(400);
    })
});


/**************************** GET /jobs */

describe("GET /jobs", function () {
    test("works for anon", async function () {
        const resp = await request(app)
            .get("/jobs");
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: testJobIds[0],
                    title: "j1",
                    salary: 1,
                    equity: '0',
                    companyHandle: 'c1'
                },
                {
                    id: testJobIds[1],
                    title: "j2",
                    salary: 2,
                    equity: '0.5',
                    companyHandle: 'c1'
                },
                {
                    id: testJobIds[2],
                    title: "j3",
                    salary: 3,
                    equity: '0.01',
                    companyHandle: 'c2'
                }
            ]
        });
    });

    test("works with filters", async function() {
        const resp = await request(app)
            .get("/jobs?title=j1&minSalary=1&hasEquity=false");
        expect(resp.body).toEqual({
            jobs: [{
                id: testJobIds[0],
                title: "j1",
                salary: 1,
                equity: '0',
                companyHandle: 'c1'
            }]
        });
    });

    test("validates schema correctly, valid", async function () {
        const resp = await request(app)
            .get("/jobs?title=j1&minSalary=1&hasEquity=true");
        expect(resp.statusCode).toEqual(200);
    });

    test("validates schema correctly, invalid title", async function () {
        const resp = await request(app)
            .get("/jobs?title=&minSalary=1&hasEquity=false");
        expect(resp.statusCode).toEqual(400);
    });

    test("validates schema correctly, invalid minSalary", async function () {
        const resp = await request(app)
            .get("/jobs?title=99&minSalary=yes&hasEquity=false");
        expect(resp.statusCode).toEqual(400);
    });

    test("validates schema correctly, invalid hasEquity", async function () {
        const resp = await request(app)
            .get("/jobs?title=99&minSalary=1&hasEquity=2");
        expect(resp.statusCode).toEqual(400);
    });
});

/**************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        const resp = await request(app)
            .get(`/jobs/${testJobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "j1",
                salary: 1,
                equity: '0',
                companyHandle: "c1"
            }
        });
    });

    test("not found for no such job", async function () {
        const resp = await request(app)
            .get("/jobs/999");
        expect(resp.statusCode).toEqual(404);
    });
});

/**************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("works for admin", async function() {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "new"
            })
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "new",
                salary: 1,
                equity: '0',
                companyHandle: "c1"
            }
        });
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "new"
            })
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "new"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/999`)
            .send({
                title: "new"
            })
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on invalid data", async function() {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: true
            })
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/**************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.body).toEqual({ deleted: `${testJobIds[0]}`});
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(401);
    });
    
    test("unauth for non admin", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
    
    test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/999`)
            .set("authorization", `Bearer ${uAToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});
