const http = require('http');
const express = require('express');
const path = require('path');

// const mongoose = require('mongoose');
// const MongoClient = require('mongodb').MongoClient;
const bookingDetailsRouter = require('./router/bookingDetails');
const monthDetailsRouter = require('./router/monthDetails');
const roomDetailsRouter = require('./router/roomsDetails');
const bodyParser = require('body-parser');
require('./router/dataBaseConnection');


// initialize the server and configure support for ejs templates
const app = new express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const url = `mongodb+srv://prakul:mlab404@cluster0-jtu6n.gcp.mongodb.net/hotel-booking?retryWrites=true&w=majority`;

// const myobj = []

// MongoClient.connect(url, function (err, db) {
//   var dbo = db.db("hotel-booking");
//   dbo.createCollection("rooms", function (err, res) {
//     if (err) throw err;
//     console.log("Collection created!");
//     db.close();
//   });
// });

// MongoClient.connect(url, function (err, db) {
//   var dbo = db.db("hotel-booking");

//   dbo.collection("rooms").insertMany(myobj, function (err, res) {
//     if (err) throw err;
//     console.log("Number of documents inserted: " + res.insertedCount);
//     db.close();
//   });
// });

app.use(express.static(path.join(__dirname, 'client/build')));
// app.get('*', cors(), (req, res) => {
//   res.sendFile(path.join(__dirname + '/client/build/index.html'))
// });

app.use(bookingDetailsRouter);
app.use(monthDetailsRouter);
app.use(roomDetailsRouter);

app.use(express.json());

// start the server
const port = process.env.PORT || 5000;
// const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port}`);
});