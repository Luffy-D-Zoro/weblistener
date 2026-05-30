import express from "express";
import multer  from "multer";
import cors from "cors";
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from "url";
import {spawn} from "child_process";
import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
//import { messages } from "@elevenlabs/elevenlabs-js/api/resources/conversationalAi/resources/conversations";
// import { messages } from "@elevenlabs/elevenlabs-js/api/resources/conversationalAi/resources/conversations";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadir = path.join(__dirname,"uploads");
const outputdir = path.join(__dirname,"outputs");
const audiodir = path.join(__dirname,"audio");

if(!fs.existsSync(audiodir)){
    fs.mkdirSync(audiodir);
}
if(!fs.existsSync(uploadir)){
    fs.mkdirSync(uploadir);
}

if (!fs.existsSync(outputdir)) {
  fs.mkdirSync(outputdir);
}

const storage = multer.diskStorage(
    
    {
        destination: function(req,file,cb){
            cb(null,uploadir);
        },
        filename: function(req,file,cb){
            const uniqueName = Date.now() + "-" + file.originalname;
            cb(null,uniqueName);
        }
    }
);
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});



const app = express();
app.use(cors());
app.use(express.json());
app.use("/audio",express.static(audiodir));
const PORT = 5000;
const array = [];

const client = new ElevenLabsClient(
    {
        apiKey : process.env.ELEVENLABS_API_KEY,
    }
);
app.get("/api/default_voices", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v2/voices?voice_type=default&page_size=100",
      {
        method: "GET",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const voices = data.voices.map((voice) => ({
      name: voice.name,
      voiceId: voice.voice_id,
      category: voice.category,
      availableForTiers: voice.available_for_tiers,
    }));

    return res.json(voices);
  } catch (error) {
    console.error("Voice listing error:", error);

    return res.status(500).json({
      message: "Could not load voices",
      error: error.message,
    });
  }
});


app.post("/api/upload-pdf",upload.single("pdf"),(req,res)=>{
    let erroutput = "";
    console.log("Post req ");
    array.push(req.file.filename);
    console.log(array[0]);
    console.log(req.file);
    console.log(req.body);
    const outputPath = path.join(outputdir,req.file.filename+".txt");
    const parserPath = path.join(__dirname,"parser.exe");
    const child = spawn(parserPath,[req.file.path,outputPath]);

    child.stderr.on("data",(data)=>{
        erroutput+= data.toString();
    });
    child.on("close",(code)=>{
        if(code!=0){
            console.log("parser exit code ",code);
            return res.status(500).json({
                message: "Parser failed",
                error: erroutput,
            });
        }
        const cleanedText = fs.readFileSync(outputPath, "utf-8");
        // console.log(cleanedText);
        res.json({
            message: "PDF parsed successfully",
            file: req.file.filename,
            text: cleanedText,
        });
    })
    
});
app.post("/api/convert_to_audio",async(req,res)=>{

    console.log(req.body.file);
    const filename = req.body.file;
    const textpath = path.join(outputdir,filename+".txt");
    if(!fs.existsSync(textpath)){
        console.log("text file not found ");
        res.json("Text file not found ");
    }
    let text = fs.readFileSync(textpath,"utf-8");
    text = text.slice(0,100);

    const voiceid = process.env.ELEVENLABS_VOICE_ID;
    const audio = await client.textToSpeech.convert(voiceid,{text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
    });
    
    const audifilename = filename + ".mp3";
    const audiopath = path.join(audiodir,audifilename);
    const chunks = [];

    for await (const chunk of audio){
        chunks.push(chunk);
    }
    const audiobuffer = Buffer.concat(chunks);
    fs.writeFileSync(audiopath,audiobuffer);

    res.json({
        message : "audio successfully converted",
        audiourl :  `http://localhost:${PORT}/audio/${audifilename}`,
    })

    
});

app.listen(PORT,()=>{
    console.log(`Server is Listening On Port  ${PORT}`);
});
