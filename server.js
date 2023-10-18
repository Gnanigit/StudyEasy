var express=require("express")
var path=require("path")
var app=express();
const bcrypt=require("bcrypt");
const bodyParser=require('body-parser');
const mongoose=require("mongoose");
const cors=require("cors");
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname,"/static")));
app.use('/images', express.static('images'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended:false}));
//middle-ware
app.use(express.urlencoded());
const ejs = require('ejs');

//mongo db connection -------------------
const uri = 'mongodb://localhost:27017/StudentResourcePlatform'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri)
    console.log(
      `Connected to MongoDB Successfully ${conn.connection.host} `
    )
  } catch (err) {
    console.log(`Error connecting to MongoDB`)
  }
}
connectDB()

// users collection schema -------------------

const usersSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true,
        unique: true
      },
      confirmPassword:{
        type: String,
        required: true,
        unique: true
      }
    },
    { timeStamps: true }
  )
  
  const users = new mongoose.model('users', usersSchema)


  // all courses schema ----------------------
  const coursesSchema = new mongoose.Schema(
    {
      courseImage: {
        type: String,
        required: true,
        unique: true
      },
      courseTitle: {
        type: String,
        required: true,
        unique: true
      },
      content:{
        type: String,
        required: true,
        unique: true
      }
    },
    { timeStamps: true }
  )
  
  const allCourses = new mongoose.model('allCourses',coursesSchema)


//all topics schema ---------------


const topicsSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true
    },
    topicTitle: {
      type: String,
      required: true,
      unique: true
    },
    link1:{
      type: String,
      required: true,
      unique: true
    },
    link2:{
      type: String,
      required: true,
      unique: true
    },
    link3:{
      type: String,
      required: true,
      unique: true
    }
  },
  { timeStamps: true }
)

const allTopics = new mongoose.model('allTopics',topicsSchema)


//enrolledcourses -------------
const enrollSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true

    },
    courseTitle: {
      type: String,
      required: true
    }
  },
  { timeStamps: true }
)

const enrolls = new mongoose.model('enrolledCourses',enrollSchema)


//StudyResourcePlatform ------------------
app.get("/StudyResoucePlatform",function(req,res){
    res.render("dashBoard")
})

//admin login -------------------
app.get("/adminLogin",function(req,res){
    res.render("adminLogin");
})


//about us -------------
app.get("/aboutUs",function(req,res){
  res.render("aboutUs");
})

//contact us -----
app.get("/contactUs",function(req,res){
  res.render("contactUs");
})

//student login ----------------------
app.get("/studentLogin",function(req,res){
    res.render("studentLogin")
})


//student signup -----------------
app.get("/studentSignUp",function(req,res){
    res.render("studentSignUp")
})

//dashboard -----------------
app.get("/dashBoard",function(req,res){
  res.render("dashBoard");
})


//first ------------
app.get("/first",function(req,res){
  res.render("first");
})

// admin submit   ------------------
app.post("/adminsubmit", async(req,res)=>{
    const {email,password} =req.body;
    profile={};
    let courses;
    try {
      courses = await allCourses.find({});
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving courses');
  }
    if(email==="gnani4412@gmail.com" && password==="gn"){
      profile.name="Gnani";
      res.render('main.ejs', {courses,profile });
    }
    else if(email==="aashaghantasala@gmail.com" && password==="aa"){
      profile.name="Aasha";
        res.render("main.ejs",{courses,profile});
    }
    else{
        res.render("studentLogin");
    }
})

// all courses ----------------------

app.get("/allCourses", async(req,res)=>{
  try {
   
    const courses = await allCourses.find({});
    res.render('allCourses.ejs', { courses: courses });
} catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving courses');
} 
})

// signupsubmit  ---------------------

app.post("/signupsubmit", async(req,res)=>{
    const { name, email, password ,confirmPassword} = req.body

    try {
      const existingusers = await users.findOne({ email: email }) 
  
      if (existingusers) {
        res.redirect('/login')
      } 
      else {
        const newusers = new users({
          name,
          email,
          password,
          confirmPassword
        })
        console.log("saved")
        await newusers.save()
        res.redirect('/studentLogin');
      }
    } 
    catch (err) {
      console.error(err)
      res.status(500).send({ message: 'Server error' })
    }
})

// loginsubmit  ---------------------

app.post("/loginsubmit",async(req,res)=>{
    const { email, password } = req.body
    profile={};
    let courses;
    try {
      courses = await allCourses.find({});
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving courses');
  }
    
    try {
      const user = await users.findOne({ email: email })
      if (user) {
        if (password === user.password) {
          profile.name=user.name;
          profile.Id=user._id;
          profile.Email=user.email;
          console.log(profile.Id);
          res.render("studentMain",{courses,profile}) 
        } else {
          res.send({ message: "Password didn't match" })
        }
      } else {
        res.redirect('/studentSignUp')
      }
    } catch (err) {
      console.error(err)
      res.status(500).send({ message: 'Server error' })
    }
    
})

//add course --------------------

app.get("/addCourse",function(req,res){
    res.render("addCourse");
})

//main ----------------
app.get('/main', async (req, res) => {
    try {
        const courses = await allCourses.find({});
        res.render('main.ejs', { courses: courses });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving courses');
    } 
});


//addtopic -----------

app.get("/addTopic",function(req,res){
  const courseTitle = req.query.courseTitle;            
  res.render("addTopic",{courseTitle});                                       
})

//uploadTopic -------

app.post('/uploadTopic' ,async(req,res)=>{

  const {courseTitle,topicTitle,link1,link2,link3} = req.body;
  try {
    const existingTopic = await allTopics.findOne({ topicTitle: topicTitle}) 
    if (!existingTopic ) {
    
      const newTopic = new allTopics({
        courseTitle,  
        topicTitle,
        link1,
        link2,
        link3
      })
      await newTopic.save()
      res.redirect(`/addTopic?courseTitle=${courseTitle}`)
    }
  } 
  catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Server error' })
  }
})

//uploadcourse -------

app.post("/uploadcourse",async(req,res)=>{
    const { courseImage,  courseTitle,content} = req.body

    try {
      const existingCourse = await allCourses.findOne({ courseTitle: courseTitle}) 
  
      if (!existingCourse ) {
      
        const newCourse = new allCourses({
            courseImage,  
            courseTitle,
            content
        })
        await newCourse.save()
        res.redirect("addCourse")
      }
    } 
    catch (err) {
      console.error(err)
      res.status(500).send({ message: 'Server error' })
    }
})                                   


//studentMain ----------------
app.get("/studentMain",async(req,res)=>{
  email=req.query.userEmail;
  profile={};
  let courses;
  try {
    courses = await allCourses.find({});
} catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving courses');
}
  
  try {
    const user = await users.findOne({ email: email })
        profile.name=user.name;
        profile.Id=user._id;
        profile.Email=user.email;
        console.log(profile.Id);
        res.render("studentMain",{courses,profile}) 
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Server error' })
  }
})

//view course -----------------
app.get("/viewCourse", async (req, res) => {
  const courseTitle = req.query.courseTitle;

  try {
    const courseData = await allTopics.find({ courseTitle: courseTitle } );

    if (courseData.length!=0) {
  
      res.render("viewCourse", { courseData});
    } else {
      res.render("viewCourse", { courseData});
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

//enrollCourse  ------------

app.get("/enrollCourse",async(req,res)=>{
  const courseTitle = req.query.courseTitle;
  const userId=req.query.userId;
  const email=req.query.userEmail;
  try {
    const alreadyEnrolled = await enrolls.findOne({ courseTitle: courseTitle,userId:userId}) 

    if (!alreadyEnrolled ) {
      const newEnroll = new enrolls({
          userId,  
          courseTitle
      })
      await newEnroll.save()
      const courses = await allCourses.find({});
         profile={} 
    try {
      const user = await users.findOne({ email: email })
      if (user) {
          profile.name=user.name;
          profile.Id=user._id;
          profile.Email=user.email;
          res.render("studentAllCourses",{courses,profile}) 
      } else {
        res.redirect('/studentSignUp')
      }
    } catch (err) {
      console.error(err)
      res.status(500).send({ message: 'Server error' })
    }
    }
    else{
      res.render("studentMain",{profile})
    }
  } 
  catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Server error' })
  }
})

//mycourses ----------------

app.get("/myCourse",async(req,res)=>{
  const userId=req.query.userId;
  const email=req.query.userEmail;
  try {
    const enrolledCourses = await enrolls.find({userId:userId})

    const courseDetails = {}; 

    for (const course of enrolledCourses) {
      const courseinfo = await allCourses.findOne({courseTitle:course.courseTitle} );

      if (courseinfo) {
        courseDetails[course.courseTitle] = courseinfo;
      }
    } 
  
    try {
      const user = await users.findOne({ email: email })
      if (user) {
          profile.name=user.name;
          profile.Id=user._id;
          profile.Email=user.email;
          res.render("myCourses",{courseDetails,profile}) 
      } else {
        res.redirect('/studentSignUp')
      }
    } catch (err) {
      console.error(err)
      res.status(500).send({ message: 'Server error' })
    }
    }
  catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Server error' })
  }
})


//student all courses ---------
app.get("/studentAllCourses",async(req,res)=>{
  email=req.query.userEmail;
  profile={};
  let courses;
  try {
    courses = await allCourses.find({});
} catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving courses');
}
  
  try {
    const user = await users.findOne({ email: email })
        profile.name=user.name;
        profile.Id=user._id;
        profile.Email=user.email;
        
        res.render("studentAllCourses",{courses,profile}) 
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Server error' })
  }
})
app.listen(3000)
                             