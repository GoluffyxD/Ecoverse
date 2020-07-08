express=require('express')
cors=require('cors')
bodyparser=require('body-parser')
path=require('path')
mongoose=require('mongoose')
dotenv=require('dotenv');
var vcapServices = require('vcap_services');
let url;
var credentials = vcapServices.getCredentials('mlab');
url=credentials.uri;
// console.log("URI:"+uri)   
const port = process.env.PORT || 8080
console.log(process.env.JWT_KEY);
dotenv.config();
console.log(process.env.JWT_KEY);


const route=require('./routes/post');
const userroutes=require('./routes/user');
const profileroutes=require('./routes/profile')

var app=express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.use(express.static(process.cwd()+"/dist/postapp/"));

// mongoose.connect('mongodb://mongo:27017/postdata');
// if (url==null)
// {url="mongodb://mongo:27017/mynewdb";}
// mongoose.connect(`mongodb+srv://testuser:test1234@cluster0-u20by.mongodb.net/test?retryWrites=true&w=majority`,{useNewUrlParser:true,useUnifiedTopology: true});
// mongoose.connection.on('connected',() => {
//     console.log("MongoDB server connected");
// });

// mongoose.connection.on('error',() => {
//     console.log("Error connecting to server");
// })
mongoose.connect(`mongodb+srv://####:####@####.mongodb.net/test?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then((data)=>{
  console.log("connected!")
})
.catch((err)=>{
  console.log("Error : " ,err)
})
app.use(cors());

app.use('/api',route);
app.use('/user',userroutes);
app.use('/profile',profileroutes)
app.use('/uploads',express.static('uploads'))
app.use('/pictures',express.static('pictures'));

app.get('*', (req,res) => {
    res.sendFile(process.cwd()+"/dist/postapp/index.html")
  });




app.listen(port,"0.0.0.0",()=>{
    console.log(`Server connect to port : ${port}`);
});
