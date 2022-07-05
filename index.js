const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
//db
const mySecret = process.env["dataKey"];
mongoose.connect(mySecret, { useNewUrlParser: true });
// Schema
const usersModel = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});
const users = mongoose.model("users", usersModel);

// paser Post
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const addUser = (req, res) => {
  users.create({ username: req.body.username }, (err, data) => {
    if (err) return err;
    res.send({ username: data.username, _id: data._id });
  });
};

const getUsers = async (req, res) => {
  /* users.find({},
  (err,data)=>{
    if (err) return err;
    res.json(data)
  }); */

  // ou

  try {
    const result = await users.find({}).select({ username: 1 }).exec();
    res.json(result);
  } catch (error) {
    console.error(error);
  }

  // ou
  /*   users.find({})
    .exec()
    .catch((error) => {
  console.error(error);
  })
    .then((data) => {
    res.json(data)
});
   */
};
// exo post
//id usernam description duration date
// description duration date
// usernam description duration date
// log[]
// id username log[]
//[]

const showExerciceAdd = (req, res, id) => {
  users
    .findOne({ _id: id })
    .select({ _id: 1, description: 1, duration: 1, date: 1, username: 1 })
    .select({ username: 1, log: { duration: 1, date: 1, description: 1 } })
    .exec((err, data) => {
      if (err) return err;
      console.log(data);
      res.send({
        _id: data["_id"],
        username: data.username,
        date: data.log[data.log.length - 1].date,
        description: data.log[data.log.length - 1].description,
        duration: data.log[data.log.length - 1].duration,
      });
    });
};

const addExercices = (req, res) => {
  // si id en url recuperer l'url plutot que de la prendre dans req.body
  const id = req.params["_id"];
  /*     users.findOne({_id: id})
      .updateOne({
        description : req.body.description,
        duration : req.body.duration,
        date : req.body.date ===""? new Date().toDateString()
          :new Date(req.body.date).toDateString()
          }, ()=>{ showExerciceAdd(req,res,id)}) 
 */
  users.findOne({ _id: id }).updateOne(
    {
      $push: {
        log: {
          description: req.body.description,
          duration: req.body.duration,
          date:
            req.body.date === ""
              ? new Date().toDateString()
              : new Date(req.body.date).toDateString(),
        },
      },
    },
    () => {
      showExerciceAdd(req, res, id);
    }
  );
};
//Vous pouvez faire une GETdemande pour /api/users/:_id/logsrécupérer un journal d'exercice complet de n'importe quel utilisateur.
//Une demande au journal d' GET /api/users/:_id/logs un utilisateur renvoie un objet utilisateur avec une count propriété représentant le nombre d'exercices appartenant à cet utilisateur.
//Une GETrequête /api/users/:id/logs renverra l'objet utilisateur avec un logtableau de tous les exercices ajoutés.

const getLogs = (req, res) => {
  const id = req.params["_id"];
  users.find({ _id: id }, (req, res) => {});
};

// liste post
app.post("/api/users", addUser);
app.post("/api/users/:_id/exercises", addExercices);
// liste get
app.get("/api/users", getUsers);
app.get("/api/users/:_id/logs", getLogs);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
