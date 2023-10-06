"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
        [
          title,
          salary,
          equity,
          company_handle,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  }

//   static async findByCriteria(params){
//     //Base query string
//     let query = `SELECT title, salary, equity, company_handle
//                 FROM companies WHERE `
                
//     //New array to hold the search narrowers
//     const conditions = [];
    
//     //if one of the parameters was 'name', add it to conditions
//     if (params['name']){
//       conditions.push(`name ILIKE '%${params['name']}%'`)
//     }

//     //if there are both a min and max, ensure they make sense and add them to conditions
//     if (params['minEmployees'] && params['maxEmployees']){
//       if(params['minEmployees'] > params['maxEmployees']) {
//         throw new BadRequestError("The maximum is higher than the min");
//       }
//       conditions.push(`num_employees >= ${params['minEmployees']}`);
//       conditions.push(`num_employees <= ${params['maxEmployees']}`)
//     } 
//     //otherwise, add whichever is present to the conditions
//     else if (params['maxEmployees']) {
//       conditions.push(`num_employees <= ${params['maxEmployees']}`);
//     } else if (params['minEmployees']) {
//       conditions.push(`num_employees >= ${params['minEmployees']}`);
//     }

//    //search using the conditions and return the response
//     query += conditions.join(' AND ') + ';';
//     console.log(query);
//     const response = await db.query(query);
//     return response.rows;
//   }


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(company_handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          salary: "salary",
          equity: "equity",
          title: "title"
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING title, salary, equity`;
    const result = await db.query(querySql, [...values, company_handle]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${company_handle}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
        [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}


module.exports = Job;
