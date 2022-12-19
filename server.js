const express= require('express')
const path = require('path')
const data = require('./database/data.json')


const app = express()
const PORT =3000;

app.set("view engine", "ejs")
app.set('views', 'frontend')

app.get('/', function(req, res){
    // const posts = data[0].posts;
    const allPosts = [];
    for(let category of data){
        for (let post of category.posts){
            allPosts.push(post)
        }
    }
    
    res.render("index.ejs", {allPosts});
   
});
app.get('/createpost', function(req, res){
    const date = new Date().toLocaleDateString();
    console.log(date);
});

app.get('/post', function(req, res){
    res.render("post.ejs");
    
});
app.get('/signup', function(req, res){
    res.render("signup.ejs");
    
});
app.get('/signin', function(req, res){
    res.render("signin.ejs");
    
});

//to inform express where the static files are
 app.use(express.static(path.join(__dirname, "public")))

app.listen(PORT,function(){
    console.log(`server is running port ${PORT}`)
})