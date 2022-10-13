const express = require("express");
const expressLayout = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Template Engine
app.set("view engine", "ejs");
app.use(expressLayout);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// config flash()
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000 },
  })
);
app.use(cookieParser("secret"));
app.use(flash());

app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Khawaril",
      email: "khawarilputra@gmial.com",
    },
  ];
  res.render("index", {
    layout: "layouts/main-layout.ejs",
    title: "Home",
    mahasiswa,
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout.ejs",
    title: "About",
  });
});

app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();
  res.render("contact", {
    layout: "layouts/main-layout.ejs",
    title: "Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("detail", {
    layout: "layouts/main-layout.ejs",
    title: "Contact",
    contact,
  });
});

app.listen(port, () => {
  console.log(`MongoDB ContactApp | http://localhost:${port}`);
});
