const { BadRequestError } = require("../expressError");

/* This method is used to format data for insertion into a SQL query.
It accepts an object with unformatted data and a mapping of js variables to SQL data.
It returns an object ready for use in a SQL query. */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0 || (!dataToUpdate) || (!jsToSql)) throw new BadRequestError("Error in data: Either an unsupported data structure or an empty one. Please use an object.");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
