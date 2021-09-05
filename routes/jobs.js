"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const newJobSchema = require("../schemas/jobNew.json")
const jobSearchSchema = require("../schemas/jobSearch.json")
const jobUpdateSchema = require("../schemas/jobUpdate.json")

const router = new express.Router();

/**POST / { job } => { job }
 * 
 * job should be { title, salary, equity, companyHandle }
 * 
 * returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: Admin
 */

router.post("/", ensureIsAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, newJobSchema);
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job })
    } catch (err) {
        if (err.code === '23503') {
            return next(new BadRequestError("Company does not exist in database", 400))
        }
        return next(err);
    }
});

/**GET / =>
 *  { jobs: { id, title, salary, equity, companyHandle }, ...}
 * 
 * Can filter on provided search filters:
 * - title (string)
 * - minSalary (int)
 * - hasEquity (boolean)
 * 
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    const q = req.query;

    // convert to int/boolean (for validation)
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    if (q.hasEquity === 'true') q.hasEquity = true;
    if (q.hasEquity === 'false') q.hasEquity = false;

    try {
        // validate query params
        const validator = jsonschema.validate(q, jobSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // make request, pass query object
        const jobs = await Job.findAll(q);
        return res.json({ jobs })
    } catch (err) {
        return next(err);
    }
});

/** GET /[id] => { job }
 * 
 * Job is { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job })
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] {fld1, fld2, ...} => { job } 
 * 
 * Patches job data
 * 
 * fields can be: { title, salary, equity }
 * 
 * returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin 
*/

router.patch("/:id", ensureIsAdmin, async function (req, res,next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job })
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[id] => { deleted: id}
 * 
 * Authorization required: admin
 */

router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id })
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
