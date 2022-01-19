//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const User = require('./models/user');
const ejs = require("ejs");
const { partial } = require("lodash");
var _ = require('lodash');


const app = express();

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const posts = [];
const dbURI = "mongodb+srv://darkcry69:Darkcry69@cluster0.tfxsd.mongodb.net/daily-journal?retryWrites=true&w=majority";
var userEmail = null;

mongoose.connect(dbURI , {useNewUrlParser: true , useUnifiedTopology: true})
  .then((result) => {
    app.listen(3000, function() {
      console.log("Server started on port 3000");
    });
  })
  .catch((err) => console.log(err))


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get('/' , (req , res) => {
  //const posts = [];
  console.log(userEmail);
  if(userEmail == null){
    res.redirect('/register');
  }
  else{
    Blog.find({userEmail: userEmail}).sort( {createdAt: -1} )
    .then((posts) => {
      res.render('home.ejs' , { homeStartingContent  , posts});
    })
    .catch((err) => {
      console.log(err);
    })
  }
  
  
})

app.post('/' , (req , res) => {
  const date = new Date();
  var postData = {
    title: req.body.postTitle,
    lessBody: 
    _.truncate(req.body.postBody, {
      'length': 100
    }),
    body: req.body.postBody,
  }
  posts.push(postData);
  const blog = new Blog({
    title: postData.title + "   ( " + date.toDateString() + " )",
    lessbody: postData.lessBody,
    body: postData.body,
    userEmail: userEmail,
  });

  blog.save()
    .then((result) => {
      console.log('blog added');
    })
    .catch((err) => {
      console.log(err);
    })
  res.redirect('/');
})

app.get('/about' , (req , res) => {
  res.render('about.ejs' , { aboutContent });
})

app.get('/post/:id' , (req , res) => {

  var postID = req.params.id;
  console.log('this is the id of the requested post: ');
  console.log(postID);
  Blog.findById(postID)
    .then((requestedPost) => res.render('post.ejs' , {requestedPost}))
    .catch((err) => {
      console.log(err);
      res.send('NO MATCH FOUND');
    })
})

app.get('/delete/:id' , (req , res) => {
  var postID = req.params.id;
  Blog.findByIdAndDelete(postID)
    .then(result => {
      console.log('Journal Deleted');
      res.redirect('/');
    })
    .catch(err => console.log(err));

})


app.get('/contact' , (req , res) => {
  res.render('contact.ejs' , { contactContent });
})

app.get('/compose' , (req , res) => {
  res.render('compose.ejs' );
})


app.get('/register' , (req , res) => {
  res.render('register.ejs');
})

app.post('/register' , (req , res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = new User({
    email: email,
    password: password,
  })

  User.find({email: email , password: password})
    .then((result) => {
      //res.redirect('/signin');
      if(result.length==0){
        userEmail = email;
        user.save()
        .then((result) => {
          userEmail = email;
          console.log(userEmail);
          console.log('user added');
          res.redirect('/');
        })
        .catch((err) => {
          console.log(err);
        })
      }
      else{
        console.log('errrrrrror');
        res.redirect('/');
      }
    })
    .catch((err) => {
      console.log(err);
    })
  
  

})

app.get('/signin' , (req , res) => {
  res.render('signIn.ejs');
})

app.post('/signin' , (req , res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("in the post signin method");
  User.find({ email: email , password: password})
    .then((result) => {
      if(result.length>0){
        userEmail = email;
        res.redirect('/');
      }
      else{
        console.log('no user found try again');
        res.redirect('/');
      }
      
    })
    .catch((err) => {
      console.log(err);
      console.log("USER DOES NOT EXIST");
    })
    
})

app.get('/signout' , (req , res) => {
  userEmail = null;
  res.redirect('/');
})