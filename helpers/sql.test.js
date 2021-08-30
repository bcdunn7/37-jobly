const { sqlForPartialUpdate } = require("./sql")

describe("sqlForPartialUpdate", () => {
    test("works", () => {
        let data = {
            name : "testName",
            numEmployees : 99,
            logoUrl : "url"
        };
        let jsToSql = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          };

        const resp = sqlForPartialUpdate(data, jsToSql);

        expect(resp['setCols']).toEqual('\"name\"=$1, \"num_employees\"=$2, \"logo_url\"=$3');
        expect(resp['values']).toEqual(["testName", 99, "url"]);
    })

    test("throws error if no data", () => {
        expect(() => {sqlForPartialUpdate({}, {})}).toThrow('No data');


    })
})