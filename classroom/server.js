const express = require('express')
const app = express()
const users = require('./routes/user.js')
const posts = require('./routes/post.js')
const cookieParser = require('cookie-parser')

app.use(cookieParser("secretcode"))
app.get('/getcookies', (req,res) => {
    res.cookie("greet","hello")
    res.send("sent you some cookies")
})

app.get('/getsignedcookies',(req,res) => {
    res.cookie("made-in","India",{signed:true})
    res.send("signed cookie sent")
})
//checking if it is tempered, if changed value only it will show false in value 
//if changed fully it will give {}
app.get('/verify', (req,res) =>{
    console.log(res.cookies)
    res.send("verified")
})

app.get('/greet', (req,res) =>{
    let {name="anonymous"} = req.cookies
    res.send(`hi , ${name}`)
})
app.get('/', (req,res)=>{
    console.dir(req.signedCookies)
    res.send('hi i am root')
})

//users
app.use('/users',users)

//posts
app.use('/posts',posts)

app.listen(3000, ()=>{
    console.log('server is listening on port 3000')
})