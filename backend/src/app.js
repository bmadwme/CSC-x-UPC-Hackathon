require('dotenv').config();
const express = require("express");

const app = express();
app.use(express.json());

// Routes
const databaseRoutes = require('./routes/databaseRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

app.use('/database', databaseRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/media", mediaRoutes);

module.exports = app;
