const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();

app.use(express.static("public"));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs');
app.use(methodOverride('_method'))

mongoose.connect('mongodb://localhost/todo', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const todoSchema = new mongoose.Schema({
    task:String,
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

// newTask('wash up','2022-02-02');

async function newFruit(fruit,price,colour){
    let beta = new Fruit({
        fruit,
        price,
        colour
    })
    beta = await beta.save();
    console.log(beta)
    }

// newFruit('banana',136,'yellow');

// app.get('/',(req,res) => {
//     let task = 'eat apples';
//     let date = 202022;

//     res.render('list',{
//         task:task,
//         date:date
//     });
// })

// read tasks
app.get('/',(req,res) => {
    Task.find({}, function(err, tasks){
        res.render('list',{
        tasks:tasks
    });        
    })
})

//write task
app.post('/', async (req,res) => {
    let alpha = new Task({
        task: req.body.task,
        date: req.body.date
    })
    alpha = await alpha.save();
    console.log(alpha);
    res.redirect('/')
})


//delete task
// app.get('/:id', async (req,res)=>{
//     let obs = await Task.findById(req.params.id)
//     if(!obs) res.status(404).send('no no no');
//     res.send('this is the' + obs);
//     console.log(obs);
// })



app.delete('/:id', async (req,res)=>{
    // let obs = await Task.find({task:req.params.id})
    // console.log(obs);
    let obs = await Task.findByIdAndDelete(req.params.id);
    console.log(obs);
    res.redirect('/');
})

app.listen(2525, ()=>{
    console.log('listening on port 2525');
});