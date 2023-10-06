const { BadRequestError } = require("../expressError")
const { sqlForPartialUpdate } = require("./sql")

describe("formatting SQL for update", () => {
    test("returns accurate updated data", () => {
        const originalData = {
            firstName: 'testuser',
            age: 4
        }
        const dataMap = {
            firstName: 'first_name',
            age: 'age'
        }
        const formattedData = sqlForPartialUpdate(originalData, dataMap);
        expect(formattedData).toEqual({"setCols": "\"first_name\"=$1, \"age\"=$2", "values": ["testuser", 4]});
    })

    test("returns error when no reference map is passed in", () => {
        const originalData = {
            firstName: 'testuser',
            age: 4
        }
        expect(() => sqlForPartialUpdate(originalData)).toThrow(BadRequestError);
    })
})

