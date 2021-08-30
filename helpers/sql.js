const { BadRequestError } = require("../expressError");

  /** 
   * Accepts an object of data to be updated in database along with an object of key value pairs for converting js (camelCase) to sql (snake_case)
   * @param {object} dataToUpdate [data to update in database]
   * @param {object} jsToSql [key/value paris for camelCase to snake_case conversion]
   * @returns {object} [returns an object consisting of a string of columns (setCols) to update in the databse, and an array of the values corresponding to the columns (values)]
   */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // get keys which correspond to database columns
  const keys = Object.keys(dataToUpdate);
  // if none, thorw no data error
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  //prepare a string for sql clause, checking if column name needs to be converted from camel to snake case in jsToSql
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // return object of columns string and values array
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
