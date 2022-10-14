const express = require("express");
const expressLayout = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const app = express();
const port = 3000;

// connection and model mongoose
require("./utils/db");
const Contact = require("./model/contact");

// config method-override
app.use(methodOverride("_method"));

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

// home page
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

// about page
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout.ejs",
    title: "About",
  });
});

// contact page
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();
  res.render("contact", {
    layout: "layouts/main-layout.ejs",
    title: "Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

// add contact form
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Tambah Data Contact",
    layout: "layouts/main-layout.ejs",
  });
});

// add contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplicated = await Contact.findOne({ nama: value });
      if (duplicated) {
        throw new Error("Nama sudah digunakan");
      }
      return true;
    }),
    check("email").isEmail().withMessage("Email tidak valid!"),
    check("nohp").isMobilePhone("id-ID").withMessage("No HP tidak valid!"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Tambah Data Contact",
        layout: "layouts/main-layout.ejs",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body).then(() => {
        req.flash("msg", "Data Berhasil ditambahkan");
        res.redirect("/contact");
      });
    }
  }
);

// delete contact
app.delete("/contact", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.body.nama });

  Contact.deleteOne({ _id: contact._id }).then(() => {
    req.flash("msg", "Data Contact Berhasil dihapus");
    res.redirect("/contact");
  });
});

// edit contact form
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Ubah Data Contact",
    layout: "layouts/main-layout.ejs",
    contact,
  });
});

// update contact
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplicated = await Contact.findOne({ nama: value });
      if (value !== req.body.oldName && duplicated) {
        throw new Error("Nama sudah digunakan");
      }
      return true;
    }),
    check("email").isEmail().withMessage("Email tidak valid!"),
    check("nohp").isMobilePhone("id-ID").withMessage("No HP tidak valid!"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Ubah Data Contact",
        layout: "layouts/main-layout.ejs",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        {
          _id: req.body._id,
        },
        {
          nama: req.body.nama,
          email: req.body.email,
          nohp: req.body.nohp,
        }
      ).then(() => {
        req.flash("msg", "Data Berhasil ditambahkan");
        res.redirect("/contact");
      });
    }
  }
);

// detail Page
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("detail", {
    layout: "layouts/main-layout.ejs",
    title: "Contact",
    contact,
  });
});

// not found page
app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});

app.listen(port, () => {
  console.log(`MongoDB ContactApp | http://localhost:${port}`);
});
