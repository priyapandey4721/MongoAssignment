const express=require('express');
const mongoose=require('mongoose');
const PORT=9000;
const emailReg = RegExp("/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/");
const { check, validationResult } = require('express-validator')
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('view engine','ejs')
//dbconnection 
const db="mongodb://localhost:27017/mongocrudapp";
const connectDB=async()=>{
    try{
      await mongoose.connect(db,{useNewUrlParser:true});
      console.log("MongoDb Connected");
    }
    catch(err){
      console.log(err.message);
    }
  }
  connectDB();
//end
const dataModel=require('./db/dataSchema');
//routes
//get data from database 
app.get("/",(req,res)=>{
    dataModel.find({},(err,data)=>{
        if(err) throw err;
        else{
        res.render('index',{data});
        }
    })
})
app.get("/add-user",(req,res)=>{
    res.render('addform')
})
app.post("/insertdata",
[
    check('name', 'Name should contains atleast 2 characters')
        .exists()
        .isLength({ min: 2 }),

    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail(),

    check('age', 'Age is required')
        .exists()
        .isLength({ min: 50 }),

    check('jobprofile', 'Job Profile is required')
        .exists()
        .isLength({ min: 3 }),
    ],
    (req,res)=>{
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            res.render('form', { alert })

        }

        else {
    let name=req.body.name;
    let email=req.body.email;
    let age=req.body.age;
    let jobprofile=req.body.jobprofile;
    //insert data
    let ins=new dataModel({name:name,email:email,age:age,jobprofile:jobprofile});
    ins.save((err)=>{
        if(err){ res.send("Already Added")}
        else{
        res.redirect('/')
        }
    })
 }
})

app.get('/getdata', (req, res) => {
    dataModel.find({}, (err, data) => {
        if (err) throw err;
        res.send(data)
    })
})

app.get("/deletedata/:id",(req,res)=>{
    let id=req.params.id;
    dataModel.deleteOne({_id:id},(err)=>{
        if(err) throw err 
        res.redirect("/")
    })
})

app.get('/getdata/:id', (req, res) => {
    let id = req.params.id;
    dataModel.find({ _id: id }, (err, data) => {
        if (err) throw err;
        res.render('updateform', { data: data[0] });
    })
})

app.post("/updatedata/:id",(req,res)=>{
    let id=req.params.id;
    let name=req.body.name;
    let email=req.body.email;
    let age=req.body.age;
    let jobprofile=req.body.jobprofile;
    dataModel.updateOne({_id:id},{$set:{name:name,email:email,age:age,jobprofile:jobprofile}},(err)=>{
        if(err) throw err;
        else{
            res.redirect('/');
        }
    })
})
app.listen(PORT,(err)=>{
    if(err) throw err;
    console.log(`Working on ${PORT}`)
})
