const Pool = require('pg').Pool;

const pool = new Pool({
    //Heroku set enviroment variables
    password: "password",
    user: "feng",
    database: "doginfo",
    host: "localhost",
    port: '5432',
    // ssl: {rejectUnauthorized:false}
});

module.exports = pool;

