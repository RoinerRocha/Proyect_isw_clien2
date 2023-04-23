const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const db = mongoose.connect("mongodb://127.0.0.1:27017/proyecto");
const bodyParser = require("body-parser");
const Parser = require("rss-parser");
const Category = require("./models/category");
const NewSource = require("./models/newSource");
const News = require("./models/news");
const Person = require("./models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const JWT_SECRET = "Qwertyuiopasdfghjkl()ñzxcvbnm[]qwsasdñlkmsdlsñldfkl";

const {
  base64decode
} = require('nodejs-base64');

const app = express();
app.use(bodyParser.json());
app.use(express.json())

// check for cors
app.use(cors({
  domains: '*',
  methods: "*"
}));

//register user
app.post('/user', async (req, res) => {
  const User = mongoose.model("users");
  const person = new Person.model();
  const encryptedPassword = await bcrypt.hash(req.body.password, 10);
  const emailSearch = req.body.email;

  person.fname = req.body.fname;
  person.lname = req.body.lname;
  person.email = req.body.email;
  person.password = encryptedPassword;
  person.role = req.body.role

  if (person.fname && person.email) {
    const oldUser = await User.findOne({ email: emailSearch });
    if (oldUser) {
      console.log(emailSearch);
      res.status(409);
      return res.json({ error: "User Exist" });
    }
    person.save(function (err) {
      if (err) {
        res.status(422);
        res.json({
          error: 'There was an error saving the user'
        });
      } else {
        const transporter = nodemailer.createTransport({
          name: "smtp.ethereal.email",
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,    
          auth: {
            user: "mikayla.abshire58@ethereal.email",
            pass: "yBgZfAPTBeHQ5vfvnP"
          }
        });

        const mailOptions = {
          from: '"News Cover Team" <NewsCover@example.com>',
          to: person.email,
          subject: "Confirm your email address",
          html: `<p>Please click <a href="http://localhost:5000/user/confirm-email/${person._id}">here</a> to confirm your email address.</p>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
            console.log(person.email);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          }
        });
        res.status(201);
        res.header({
          'location': `http://localhost:5000/user/?id=${person.id}`
        });
        res.json(person);
      }
    });
  } else {
    res.status(422);
    console.log('error while saving the user')
    res.json({
      error: 'No valid data provided for user'
    });
  }
});

//Confirm user account
app.get('/user/confirm-email/:id', async (req, res) => {
  const User = mongoose.model("users");
  const person = await User.findOne({_id: req.params.id});
  if (!person) {
    res.status(404);
    return res.json({ error: "User not found" });
  }
  person.confirmed = true;
  await person.save();
  res.status(200);
  res.json({ message: "Email confirmed!!"})
});

//authenticate user.
const User = mongoose.model("users");

app.post("/session", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "User Not Found" });
  }
  if (user.confirmed == false) {
    return res.json({ error: "You need to confirm your account first" });
  }
  if (await bcrypt.compare(password, user.password)) {
    console.log("ssss");
    const Token = jwt.sign({ email: user.email, role: user.role, id: user.id }, JWT_SECRET);

    if (res.status(200)) {
      return res.json({ status: "ok", data: Token });
    } else {
      return res.json({ status: "Error" });
    }
  }
  res.json({ status: "error", error: "Invalid password" });
});

app.get('/checktoken', async (req, res) => {
  const token = req.body.token;

  try {
    const data = jwt.decode(token)
    res.json(data);

  } catch (error) {
    res.status(422)
    res.json({ error: "There was an error" })
  }
});

//post new category
app.post('/category', async (req, res) => {
  const cat = mongoose.model("categories");
  const category = new Category.model();

  category.name = req.body.name;

  if (category.name) {
    const check = await cat.findOne({ name: req.body.name });
    if (check) {
      res.status(409);
      return res.json({ error: "Category already exist" });
    }
    category.save(function (err) {
      if (err) {
        res.status(422);
        res.json({
          error: 'There was an error saving the category'
        });
      }
      res.status(201);//CREATED
      res.header({
        'location': `http://localhost:5000/category/?id=${category.id}`
      });
      res.json(category);
    });
  } else {
    res.status(422);
    res.json({
      error: 'No valid data provided'
    });
  }
});

//delete category by id
app.delete('/category/:id', (req, res) => {
  const Category = mongoose.model("categories");
  const { id } = req.params;

  Category.findByIdAndDelete(id, function (err, docs) {
    if (err) {
      res.status(404);
      res.json({ error: 'Data not found' });
    }
    else {
      res.status(200);
      res.json();
    }
  })
});

//update categories
app.put('/category/:id', (req, res) => {
  const Category = mongoose.model("categories");
  const { id } = req.params;
  const name = req.body.name;

  Category.findByIdAndUpdate(id, { name: name }, function (err, docs) {
    if (err) {
      res.status(404);
      res.json({ error: 'Data not found' });
    }
    else {
      res.status(200);
      res.header({ 'location': `http://localhost:5000/category/?id=${docs.id}` });
      res.json(docs);
    }
  })
});

//get category by id
app.get('/category/:id', async (req, res) => {
  const Category = mongoose.model("categories");
  const { id } = req.params;

  try {
    const cat = await Category.findById(id)
    res.json(cat);

  } catch (error) {
    res.status(422)
    res.json({ error: "There was an error" })
  }
});

//get all categories
app.get('/category', async (req, res) => {
  const Category = mongoose.model("categories");

  try {
    const cat = await Category.find();
    res.json(cat);

  } catch (error) {
    res.status(422)
    res.json({ error: "There was an error" })
  }
});

//post news source
app.post('/newsource', async (req, res) => {
  const Category = mongoose.model("categories");
  const User = mongoose.model("users");
  const source = new NewSource.model();

  source.url = req.body.url;
  source.name = req.body.name;
  source.user_id = req.body.user_id;
  source.category_id = req.body.category_id;

  if (source.user_id && source.category_id) {
    const check = await User.findOne({ _id: req.body.user_id });
    const check2 = await Category.findOne({ _id: req.body.category_id });

    if (!check || !check2) {
      res.status(409);
      return res.json({ error: "There was an error" });
    }
    source.save(function (err) {
      if (err) {
        res.status(422);
        res.json({
          error: 'There was an error saving the category'
        });
      }
      res.status(201);//CREATED
      res.header({
        'location': `http://localhost:5000/category/?id=${source.id}`
      });
      res.json(source);
    });
  } else {
    res.status(422);
    res.json({
      error: 'No valid data provided'
    });
  }
});

//delete source by id
app.delete('/newsource/:id', (req, res) => {
  const NewSource = mongoose.model("newSources");
  const { id } = req.params;

  NewSource.findByIdAndDelete(id, function (err, docs) {
    if (err) {
      res.status(404);
      res.json({ error: 'Data not found' });
    }
    else {
      res.status(200);
      res.json();
    }
  })
});

//update new sources
app.put('/newsource/:id', (req, res) => {
  const NewSource = mongoose.model("newSources");
  const { id } = req.params;
  const url = req.body.url;
  const name = req.body.name;
  const user_id = req.body.user_id;
  const category_id = req.body.category_id;

  NewSource.findByIdAndUpdate(id, { url: url, name: name, user_id: user_id, category_id: category_id }, function (err, docs) {
    if (err) {
      res.status(404);
      res.json({ error: 'Data not found' });
    }
    else {
      res.status(200);
      res.header({ 'location': `http://localhost:5000/category/?id=${docs.id}` });
      res.json(docs);
    }
  })
});

//get news source by id
app.get('/newsource/:id', async (req, res) => {
  const NewSource = mongoose.model("newSources");
  const { id } = req.params;

  try {
    const source = await NewSource.find({ user_id: id })
    res.status(200)
    res.json(source);

  } catch (error) {
    res.status(422)
    res.json({ error: "There was an error" })
  }
});

//get all news sources
app.get('/newsource', async (req, res) => {
  const NewSource = mongoose.model("newSources");

  try {
    const source = await NewSource.find()
    res.status(200)
    res.json(source);

  } catch (error) {
    res.status(422)
    res.json({ error: "There was an error" })
  }
});

//Read the RSS and insert the news associated to the owner of the newsource 
app.post('/newsource/:id/process', async (req, res) => {
  //RSS Parser
  const parser = new Parser();
  const NewSource = mongoose.model("newSources");
  const { id } = req.params;

  // Get all the items in the RSS feed
  const source = await NewSource.find({ user_id: id });
  console.log(source);
  const out = [];

  if (source) {
    source.forEach(async elementN => {
      const feed = await parser.parseURL(elementN.url);
      feed.items.forEach(async element => {
        const news = new News.model();
        news.title = element.title,
          news.short_description = element.contentSnippet,
          news.permalink = element.link,
          news.date = element.isoDate,
          news.news_sources_id = elementN.id,
          news.user_id = elementN.user_id,
          news.category_id = elementN.category_id

        await news.save();
        await out.push(element);
        console.log(element);
      });
    });
  } else {
    res.status(404);
    res.json("Not found");
  }
  res.status(201)
  res.json({ out });
});

//get all news by user id
app.get('/news/:id', async (req, res) => {
  const News = mongoose.model("news");
  const { id } = req.params;

  try {
    const news = await News.find({ user_id: id });
    res.status(200)
    res.json(news);

  } catch (error) {
    res.status(422)
    res.json({ error: "There was an error" })
  }
});

//get all news by user id and category
app.get('/news/:id/:cat', async (req, res) => {
  const News = mongoose.model("news");
  const id = req.params.id;
  const cat = req.params.cat;

  try {
    const news = await News.find({ user_id: id, category_id: cat });
    res.status(200)
    res.json(news);

  } catch (error) {
    res.status(422)
    res.json({ error: "There was an error" })
  }
});

app.listen(5000, () => console.log(`Example app listening on port 5000!`))
