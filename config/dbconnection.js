
require('dotenv').config();
const { Mongoose, default: mongoose } = require("mongoose");
const url = process.env.MONGODB_URI;

console.log(url);

const connection = async () => {
try {
    await mongoose.connect(url,{useNewUrlParser: true});
     console.log(`Mongodb connected ${mongoose.connection.host}`);
} catch (error) {
    console.log(`Mongodb Server Issue ${error}`);
}
};

connection();
module.exports = connection;