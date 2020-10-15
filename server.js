import express from "express";
import mongoose from "mongoose";
import Messages from "./dbChat.js";
import Pusher from "pusher";
import cors from "cors";

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1090079",
  key: "a3000b34bc577db7748a",
  secret: "68330e4ec5f6a1b69cb7",
  cluster: "ap1",
  encrypted: true,
});

//middleware
// send json data in response
app.use(express.json());
//allow to come request from any endpoint
app.use(cors());

//DB Config
const connection_url =
  "mongodb+srv://admin_ritesh:MDde6A87sR7asqH@cluster0.4sssy.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//create changestream for frontend
const db = mongoose.connection;

db.once("open", () => {
  console.log("DB Connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("New Change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

//api routes
app.get("/", (req, res) => res.status(200).send("Hello World"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    err ? res.status(500).send(err) : res.status(200).send(data);
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    err
      ? res.status(500).send(err)
      : res.status(201).send(`new message created: \n ${data}`);
  });
});

// listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));
