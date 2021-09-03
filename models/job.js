"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    /**Create a job (from data), update db, return new job data.
     * 
     * data format: {title, salary(int), equity(nuemric), companyHandle}
     * 
     * @returns { title, salary, equity, companyHandle}
     */

    static async create({title, salary, equity, companyHandle}) {
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle AS "companyHandle"`,
            [
                title, 
                salary, 
                equity, 
                companyHandle
            ]
        );
        const job = result.rows[0];
        
        return job;
    }

    /**Find all jobs. Optional WHERE parameters.
     * 
     * @param {object} q [An optional query object for filtering parameters. Optional keys: title, minSalary, hasEquity]
     * @returns [{title, salary, quity, companyHandle},...]
     */

    static async findAll(q = {}) {
        // query params
        const {title, minSalary, hasEquity} = q;

        // Initialize array of clauses for WHERE statement and the corresponding values
        let clauses = [];
        let values = [];

        // if certain param, add to clause and value
        if (title) {
            values.push(`%${title}%`);
            clauses.push(`title ILIKE $${values.length}`);
        }

        if (minSalary) {
            values.push(minSalary);
            clauses.push(`salary >= $${values.length}`);
        }

        if (hasEquity) {
            clauses.push(`equity > 0`);
        }

        // combine clauses to write WHERE clause
        let whereClause = clauses.join(' AND ');
        // if any clauses, add "WHERE"
        if (clauses.length > 0) {
            whereClause = "WHERE " + whereClause;
        }

        const jobsRes = await db.query(
            `SELECT title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             ${whereClause}
             ORDER BY title`, values);
        
        return jobsRes.rows;
    }

    /**Given a job title, return data about job.
     * 
     * @return {title, salary, equity, companyHandle}
     * 
     * Throws NotFoundError if not found.
     */

    static async get(title) {
        const jobRes = await db.query(
            `SELECT title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE title = $1`,
            [title]
        ) 

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No Job ${title}`)

        return job;
    }

    /** Updata job data with 'data
     * 
     * This is a "partial update" --- it's fine if data doesn't contain all the fields; this only changes provided ones.
     * 
     * Data can include: {title, salary, equity}
     * 
     * @return {title, salary, equity, companyHandle}
     * 
     * Throws NotFoundError if not found.
     */

    static async update(title, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                companyHandle: "company_handle"
            });
        const titleVarInd = "$" + (values.length + 1);

        const querySql =   `UPDATE jobs
                            SET ${setCols}
                            WHERE title = ${titleVarInd}
                            RETURNING title,
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, title]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No Job ${title}`)

        return job;
    }

    /**Delete given job from database; returns undefined.
     * 
     * Throws NotFoundError if job not found.
     */

    static async remove(title) {
        const result = await db.query(`
            DELETE
            FROM jobs
            WHERE title = $1
            RETURNING title`, 
            [title]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No Job ${title}`);
    }
}

module.exports = Job;