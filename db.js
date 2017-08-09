var mongoose = require("mongoose");

const options = {
  server: {
    auto_reconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  }
};
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/ptt_beauty", options);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("mongo db open successfully");
});
