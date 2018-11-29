const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);



const firebase = require("firebase");
require("firebase/firestore");



let nameVar;


firebase.initializeApp({
  apiKey: "AIzaSyBySbUPwRebY4sA8qChW4QRMhwQYoCiuRU",
  authDomain: "fcp-firebase.firebaseapp.com",
  projectId: "fcp-firebase"
});

const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("fcp listening on port", 3000);
});

app.get("/dashboard", (req, res) => {
  res.use(express.static("public"));
});

io.on("connection", socket => {
  console.log("a user connected");

  socket.on('new message', (message) => {
    socket.broadcast.emit('add message', nameVar, message);
    socket.emit('add message', nameVar, message)
  });

  socket.on("new form", (title, question) => {
    db.collection("forms")
      .doc()
      .set({
        title: title,
        question: question
      })
      .then(function() {
        console.log("Document successfully written!");
        document.getElementById('forms').innerHTML = '';
        socket.emit('load forms')
      })
      .catch(function(error) {
        console.error("Error writing document: ", error);
      });
  });

  socket.on("load forms", (max, min) => {
    let id;

    db.collection("forms")
      .get()
      .then((querySnapshot, req, res) => {
        querySnapshot.forEach(doc => {
          id = doc.id;

          let ref = db.collection("forms").doc(id);
          let getDoc = ref
            .get()
            .then(doc => {
              socket.emit("add form", doc.data().title, doc.data().question);
            })
            .catch(err => {
              console.log("Error getting document", err);
            });
        });
      });
  });

  socket.on("register", (name, password) => {
    socket.broadcast.emit("add message", nameVar, message);
    socket.emit("add message", nameVar, message);
  });

  socket.on("register", (name, password) => {
    db.collection("users")
      .doc()
      .set({
        username: name,
        password: password
      })
      .then(function() {
        console.log("Document successfully written!");
      })
      .catch(function(error) {
        console.error("Error writing document: ", error);
      });

    console.log("a user registered");
  });

  socket.on("login", (name, password) => {
    let id;

    db.collection("users")
      .get()
      .then((querySnapshot, req, res) => {
        querySnapshot.forEach(doc => {
          id = doc.id;

          let ref = db.collection("users").doc(id);
          let getDoc = ref
            .get()
            .then(doc => {
              if (!doc.exists) {
                console.log("No such document!");
              } else {
                if (
                  name == doc.data().username &&
                  password == doc.data().password
                ) {
                  dir = false;
                  nameVar = doc.data().username;

                  socket.emit("login_work");
                  socket.emit("send user", nameVar);
                } else {
                  console.log("404 not found, the user ");
                }
              }
            })
            .catch(err => {
              console.log("Error getting document", err);
            });
        });
      });
  });
});
