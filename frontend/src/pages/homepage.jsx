import {useRef, useState } from "react";

const HomePage = ()=>{
const [fileName, setFileName] = useState("No PDF selected");
const [fileobj ,setFileobj] = useState("");
const [playing, setPlaying] = useState(false);
const [extractedText, setExtractedText] = useState("");
const [uploading, setUploading] = useState(false);
const [converting,setConverting] = useState(false);
const [error, setError] = useState("");
const [audiourl,setAuidoUrl] = useState("");
const audioref = useRef(null);

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];

  if (!file) {
    setFileName("No PDF selected");
    return;
  }

  if (file.type !== "application/pdf") {
    setError("Please select a PDF file.");
    return;
  }

  setFileName(file.fileName);
  setUploading(true);
  setError("");
  setExtractedText("");

  const formdata = new FormData();
  formdata.append("pdf", file);

  try {
    const response = await fetch("http://localhost:5000/api/upload-pdf", {
      method: "POST",
      body: formdata,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "PDF parsing failed");
    }

    console.log(data);

    setExtractedText(data.text || "");
    setAuidoUrl("");
    setFileobj(data.file);
  } catch (err) {
    console.log(err);
    setError(err.message);
  } finally {
    setUploading(false);
  }
};
  const handleupload = async ()=>{
      setConverting(true);
      try{
        const response = await fetch("http://localhost:5000/api/convert_to_audio",{
          method : "POST",
          headers : {
            "Content-Type" : "application/json",
          },
          body : JSON.stringify(
            {file : fileobj}
          )
        });
        const data = await response.json();
        if(!response.ok){
          throw new Error (data.error || data.message || "Audio convertion failed");
          
        }
        setAuidoUrl(data.audiourl)
        setPlaying(false);
        console.log(data);
      }catch(err){
        console.log(err);
        setError(err.message);

      }finally{
        setConverting(false);
      }
  };
  //const audio = new Audio(audiourl);
  const playAudio = async()=>{
    const audio = audioref.current;
    if(!audio){
      setError("Convert the PDF to audio first.");
      return;
    }
    try {
    if (audio.paused) {
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
    } catch (err) {
      console.error("Audio playback failed:", err);
      setError("Could not play the generated audio.");
    }
  }

  return (
    <div className="min-h-screen bg-[#120f0d] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-200/10 px-4 py-1 text-sm text-amber-200">
            PDF to Audio
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Listen to your story PDFs in a clean, simple way
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Upload your own PDF, convert it to audio, and continue listening anytime.
            Designed with a warm audiobook feel for story listening.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Upload your PDF</h2>
            <p className="mt-2 text-sm text-slate-400">
              Choose a story, novel, or document PDF from your device.
            </p>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-200/20 bg-[#1a1512] px-6 py-12 text-center transition hover:border-amber-200/40 hover:bg-[#221b17]">
              <div className="text-5xl">📄</div>
              <p className="mt-4 text-lg font-medium">Click to upload PDF</p>
              <p className="mt-2 text-sm text-slate-400">Only your own uploaded files are used</p>
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              Selected story: <span className="font-medium text-white">{fileName}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleupload} disabled={uploading || !extractedText} className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-[#1b140f] transition hover:scale-[1.02]">
                {uploading ? "Processing..." : "Convert to Audio"}
              </button>
              <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">
                Save for Later
              </button>
              {uploading && (
                  <p className="mt-3 text-sm text-amber-200">
                    Extracting text from PDF...
                  </p>
                )}

                {error && (
                  <p className="mt-3 text-sm text-red-400">
                    {error}
                  </p>
                )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Now Playing</h2>
            <p className="mt-2 text-sm text-slate-400">Simple player for quick listening</p>

            <div className="mt-6 rounded-3xl border border-white/10 bg-[#1a1512] p-5">
              <p className="text-lg font-semibold">{fileName}</p>
              <p className="mt-1 text-sm text-slate-400">Chapter or extracted section will appear here</p>

              {/* <div className="mt-6 h-2 w-full rounded-full bg-white/10">
                <div className="h-2 w-[35%] rounded-full bg-amber-300" />
              </div> */}

              {/* <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>02:14</span>
                <span>06:20</span>
              </div> */}

              <div className="mt-6 flex items-center gap-3">
                <button className="rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/15">⏪</button>
                <button
                  onClick={playAudio}
                  disabled={!audiourl}
                  className="rounded-2xl bg-amber-300 px-6 py-3 font-semibold text-[#1b140f] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {playing ? "Pause" : "Play"}
                </button>
                
                <button className="rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/15">⏩</button>
                
              </div>
              {audiourl && (
                    <div className="mt-6">
                      <audio ref={audioref} controls src={audiourl} className="w-full"  onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onEnded={() => setPlaying(false)}
                        onError={() => setError("The generated audio file could not be loaded.")} />
                    </div>
                  )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#1a1512] p-4">
                <label className="mb-2 block text-sm text-slate-300">Voice</label>
                <select className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none">
                  <option>Natural Voice</option>
                  <option>Deep Voice</option>
                  <option>Soft Voice</option>
                </select>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#11182d] p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>Speed</span>
                  <span>1.0x</span>
                </div>
                <input type="range" min="0.75" max="2" step="0.05" defaultValue="1" className="w-full" />
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold">Your Saved Stories</h2>
          <p className="mt-2 text-sm text-slate-400">
            Keep this section simple for now: recent uploads with resume access.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#1a1512] px-4 py-4">
              <div>
                <p className="font-medium">my-story.pdf</p>
                <p className="text-sm text-slate-400">Last listened: 12 min ago</p>
              </div>
              <button className="rounded-xl bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15">
                Open
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#11182d] px-4 py-4">
              <div>
                <p className="font-medium">novel-chapter-pack.pdf</p>
                <p className="text-sm text-slate-400">Last listened: yesterday</p>
              </div>
              <button className="rounded-xl bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15">
                Open
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;