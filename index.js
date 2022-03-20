const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const cookieParser = require('cookie-parser');

const app = express();

//third

app.set('view engine','ejs');
app.use(express.static("public"));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(cookieParser());

app.use('/protected', (req,res,next) => {
    console.log('protected');
    next();
})

// mongoose.connect('mongodb://localhost/todo', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB...'))
//   .catch(err => console.error('Could not connect to MongoDB...', err));

mongoose.connect(`mongodb://${config.get('mogouser')}:${config.get('mogopass')}@52.14.207.35:27017/admin`,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

console.log(config.get('name'));
console.log(config.get('jwtprivatekey'))

//login
app.get('/login', (req,res) =>{
    res.render('login')
})

app.post('/login', async (req,res)=>{
    let user = await User.find({username:req.body.username});
    if(!user[0]) res.send('user does not exist');

    const check = await bcrypt.compare(req.body.password, user[0].password);
    if(check == false) res.send('password is incorrect');
    
    const payload = _.pick(user[0], ['username', 'acc']);
    const token = jwt.sign(payload,config.get('jwtprivatekey'));
    res.cookie('x-token', token);
    res.redirect('/home');
})

//write task
app.get('/home',(req,res) => {
    let token = req.cookies['x-token'];
    let decode = jwt.verify(token,config.get('jwtprivatekey'));
    console.log(decode.acc);

    if(decode.acc ==='admin'){
            Task.find({}, function(err, tasks){
        res.render('list',{
        tasks:tasks
    });
    })
    }else{
        res.status(400).send('access denied');
    }
})

//show tasks
app.post('/home', async (req,res) => {
    let token = req.cookies['x-token'];
    let decode = jwt.verify(token,config.get('jwtprivatekey'));
    console.log(decode);
    if(!decode.acc==='admin') return res.status(400); 
    let alpha = new Task({
        task: req.body.task,
        date: req.body.date
    })
    alpha = await alpha.save();
    console.log(alpha);
    res.redirect('/home')
})

//delete task
app.delete('/home/:id', async (req,res)=>{
    // let obs = await Task.find({task:req.params.id})
    // console.log(obs);
    let obs = await Task.findByIdAndDelete(req.params.id);
    console.log(obs);
    res.redirect('/home');
})

//create task
const todoSchema = new mongoose.Schema({
    task:{type:String, required:true},
    date:{type:Date, default:Date.now}
})

const Task = mongoose.model('tasks',todoSchema);

async function newTask(task,date){
    let alpha = new Task({
        task,
        date
    })
    alpha = await alpha.save();
    console.log(alpha);
}

//create user
const userSchema = mongoose.Schema({
    username:{type:String, required:true},
    password:{type:String, required:true},
    acc:{type:String, required:true}
})

const User = mongoose.model('users',userSchema);

async function newUser(username,pass,acc){
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(pass,salt)
    let alpha = new User({
        username,
        password,
        acc
    })
    alpha = await alpha.save();
    console.log(alpha);
}

newUser('bobo','blue','admin');

app.listen(2525, () => {
    console.log('listening on port 2525');
});