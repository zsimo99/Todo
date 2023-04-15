//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash")
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect("mongodb+srv://admin-zsimo:test123@cluster0.xrtfhyt.mongodb.net/todolistDB").then(() => {
    app.listen(3000, function () {
      console.log("Server started on port 3000");
    });
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });
const itemschema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
const Item = mongoose.model("Item", itemschema);

const item1 = new Item({
  name: "welcome to your todolist",
});
const item2 = new Item({
  name: "hit the + button to add a new item",
});
const item3 = new Item({
  name: "<---hit this to delete any item",
});

const listschema = mongoose.Schema({
  name: String,
  items: [itemschema],
});
const List = mongoose.model("List", listschema);

app.get("/", async (req, res) => {
  // const day = date.getDate();

  try {
    await Item.find({})
      .then((resu) => {
        if (resu.length === 0) {
          Item.insertMany([item1, item2, item3])
            .then(() => {
              console.log("add successfully");
            })
            .catch((err) => {
              console.log(err);
            });
          res.redirect("/");
        } else {
          res.render("list", { listTitle: "today", newListItems: resu });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });
  if (listName === "today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((rslt) => {
      rslt.items.push(item);
      rslt.save();
      res.redirect(`/${listName}`);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res) => {
  let id = req.body.checkbox;
  let listName = req.body.listName;
  if (listName === "today") {
    Item.findByIdAndDelete(id)
      .then(() => {
        console.log("delete one");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: id } } }
    ).catch((err) => {
      console.log(err);
    });
    res.redirect(`/${listName}`);
  }
});

app.get("/:sec", async (req, res) => {
  try {
    const sec = _.capitalize(req.params.sec);
    await List.findOne({ name: sec }).then((rslt) => {
      if (!rslt) {
        const list = new List({
          name: sec,
          items: [item1, item2, item3],
        });
        list.save();
        res.redirect(`/${req.params.sec}`);
      } else {
        res.render("list", { listTitle: rslt.name, newListItems: rslt.items });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});
