const express = require("express");
const moragan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/dbconnection");
const cors = require('cors');



//dotenv conig
dotenv.config();


//rest obejct
const app = express();


//middlewares
app.use(express.json());
app.use(moragan("dev"));
app.use(cors());


// it is for customer
app.use('/api/v1/customer',require('./routes/customerRoutes'));


// it is for provider
app.use('/api/v1/provider',require('./routes/providerRoutes'));



//listen port
app.listen(5000)