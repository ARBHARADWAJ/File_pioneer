const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fileupload=require("express-fileupload");
const fs=require("fs")

const app = express();

app.set('view engine', 'ejs');
app.use(fileupload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let file_array=[]
var fol_nam=""
function createfilename(){
  return Math.floor(Math.random()*1000000)+"";
}

function createfolder(){
  fol_nam=createfilename()
  while(file_array.includes(fol_nam)) {
    fol_nam=createfilename()
  }
  fs.mkdirSync("./upload/"+fol_nam)
  return fol_nam   
}

app.get("/",function(req,res){//first page
    res.render("index",{fol_name:createfolder()});
  });

  app.post("/page",function(req,res){
  
    const file=req.files.filem1;
    console.log('./uploads/'+req.body.fil_name+'/'+file.name);
    console.log(req.body.fil_name)
    file.mv('./uploads/'+req.body.fil_name+'/'+file.name) 
    res.send("done")
   /*Sngle file upload is done */
   res.send("suuccess")
  })
  
  app.post("/pages",function(req,res){
    const file=req.files.filem2;
    console.log(req.body.fil_name)
    const promises=file.map((fi)=>{
        const savepath="./uploads/"+req.body.fol_name+"/"+fi.name;
        return fi.mv(savepath);
    })
    Promise.all(promises);  
    res.send("success");
  
    /*multiplefile upload is also done */
  
  });  

  app.get("/sender",function(req,res){
    res.render("sender",{fname:"",fileacceptname:"false",foldername:""})
 });
 
 
 //check for the file
 app.post("/check_for_folder",function(req,res){
 const folname="./upload/"+req.body.folder;
 console.log(folname);
 if(fs.existsSync(folname)){
   const fn=fs.readdirSync(folname);
   res.render("sender",{fname:fn,fileacceptname:"true",foldername:folname})
 }
 else{
   res.render("sender",{fname:"",fileacceptname:false,foldername:""})
 }
 })

 app.get("/upload/:foldername/:filename",function(req,res){
    console.log(req.params.filename);
    console.log(req.params.foldername);
    const filepath='./upload/'+req.params.foldername+"/";
    res.download(filepath+req.params.filename,function(err){
        if(err){console.log(err);}});
    console.log("success");
    });


    app.listen(3000,function(){
        console.log("Initiating the server port:3000😀");
    });    