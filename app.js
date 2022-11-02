'use strict';
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fileupload=require("express-fileupload");
const jimp=require("jimp");
const libre = require('libreoffice-convert-win');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { callbackify } = require("util");

const app = express();


app.set('view engine', 'ejs');
app.use(fileupload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//app.use(express.static("public/"))
libre.convertAsync = require('util').promisify(libre.convert);

//------------------------------------------------
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



app.get("/",function(req,res){
res.render("login");
});


app.post("/",function(req,res){//first page
if(req.body.username==="sender"&& req.body.password==="1234"){
  res.render("index",{fol_name:createfolder()});}
else if(req.body.username==="receiver"&& req.body.password==="1234"){
  res.render("sender",{fname:"",fileacceptname:"false",foldername:""})

}
else{
  res.render("file",{title:"Enter the valid Credentials",titdes:""});
}  
});




//----------------file uploads single and multiple----------------------
app.post("/page",function(req,res){
  
  const file=req.files.filem1;

  console.log('./upload/'+req.body.fil_name+'/'+file.name);
  console.log(req.body.fil_name)
  file.mv('./upload/'+req.body.fil_name+'/'+file.name) 
  console.log('./upload/'+req.body.fil_name+'/'+file.name)
 /*Sngle file upload is done */
 res.render("file",{title:"Success on Upload.",titdes:"Looking forword to Download more"})
})

app.post("/pages",function(req,res){
  const file=req.files.filem2;
  console.log(req.body.fil_name)
  const promises=file.map((fi)=>{
      const savepath="./upload/"+req.body.fil_name+"/"+fi.name;
      console.log("success"+" ./upload/"+req.body.fil_name+"/"+fi.name);
      return fi.mv(savepath);

  })
  Promise.all(promises); 
 
  res.render("file",{title:"Success on Upload Multiple Files.",titdes:"Looking forword to Download more"})

  /*multiplefile upload is also done */

});
//--------------------------------------


//---------sender page-----------------------------
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

//------------------------------------

app.get("/upload/:foldername/:filename",function(req,res){
console.log(req.params.filename);
console.log(req.params.foldername);
const filepath='./upload/'+req.params.foldername+"/";
res.download(filepath+req.params.filename,function(err){
    if(err){console.log(err);}});
console.log("success");
});





function check_in_list_is_validate(a,b){
  list1=[".pptx",".docx",".xlsx"];
  list2=[".pdf"];
  return true; 
}

function return_filename(a){
  let name="";
  let j=0;
  for(let i=a.length-1;i>=0;i--){
    if(a[i]==="."){
      j=i;
    }
  }
  for(let v=0;v<j;v++){
    name+=a[v];
  }
  return name;
}










app.get("/upload/:foldername/:filename/:orgformat/:toformat",async function(req,res){

  const naoffo=req.params.foldername;
  const naoffi=req.params.filename;
  const orfo=req.params.orgformat;
  const tofo=req.params.toformat;
  const finawiex=return_filename(naoffi);
let i='./upload/'+naoffo+"/"+finawiex+orfo;
let o='./upload/'+naoffo+"/"+finawiex+tofo;



  if((orfo===".pptx"||orfo===".docx"||orfo===".xlsx")&& (tofo===".pdf")){  
   
    async function main(a,b,c,d) {
      const extend = '.pdf';
      const inputPath='./upload/'+d+"/"+a+b;
      const outputPath= './upload/'+d+"/"+a+c;
      console.log(outputPath);
    
      const file = fs.readFileSync(inputPath);
    
      libre.convert(file, extend, undefined, (err, done) => {
          if (err) {
            console.log(`Error converting file: ${err}`);
          }
          else{
          fs.writeFileSync(outputPath, done);
          let tr=false;
          while(!tr){
            tr=fs.existsSync(outputPath);
          }
          if(tr){console.log("success");
                res.download(outputPath,function(err){
                  if(err){
                    console.log(err);
                  }
                  else{
                    console.log("Scuucess download");
                    fs.rmSync(outputPath,undefined);
                  }
                });}
    }});
  }
      main(finawiex,orfo,tofo,naoffo);
  }



  else if(orfo===".png"&& (tofo===".jpg"||tofo===".jpeg")){
   console.log("yes");
    jimp.read("./upload/"+naoffo+"/"+naoffi,function(err,img){
      if(err){
        console.log(err);
        return;
      }
      img.write("./upload/"+naoffo+"/"+finawiex+tofo,function(err){
        if(err){
          console.log(err);
        }
        console.log("./upload/"+naoffo+"/"+finawiex+tofo);
        res.download("./upload/"+naoffo+"/"+finawiex+tofo,function(err){
          if(err){
            console.log("download not possible");
          }
          else{
            console.log("success");
            fs.rmSync("./upload/"+naoffo+"/"+finawiex+tofo,undefined);
          }
        });
      });

    });
  }
  else if((orfo===".mp4"||orfo===".avi"|| orfo===".mov"||orfo===".webm"||orfo===".flv"||orfo===".wmv"|| orfo===".mkv"|| orfo===".3gpp"||orfo===".swf")&& (tofo===".mp3")){ 
    function convert(input, output, callback) {
      ffmpeg(input)
          .output(output)
          .on('end', function() {                    
              console.log('conversion ended');
              callback(null);
          }).on('error', function(err){
              console.log(err);
              callback(err);
          }).run();
  }
  convert('./upload/'+naoffo+"/"+finawiex+orfo,'./upload/'+naoffo+"/"+finawiex+tofo,function(err){
    if(!err){
      console.log("success of the music file");
      res.download('./upload/'+naoffo+"/"+finawiex+tofo,function(err){
        if(!err){
          fs.rmSync('./upload/'+naoffo+"/"+finawiex+tofo);
        }else{
          console.log("error of deletion");
        }
      })

    }
    else{
      console.log("could not happen");
    }
  })


  }//once see for the filees and audio files.
});

app.listen(3000,function(){
    console.log("Initiating the server port:3000😀");
});