const mongoose = require('mongoose');
require("dotenv").config();

mongoose.set("strictQuery", false);

const conn = mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/local_seva')

    .then(db => {
        console.log("Databse Connected");
        return db;
    }).catch(err => {
        console.log("Connection Error: " + err);
    })

    module.exports = conn;