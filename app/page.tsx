"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";


type Upload = {
  id: string;
  name: string;
  url: string;
  fileType: string;
};

export default function Home() {

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [analysis, setAnalysis] = useState({
    filler: null,
    pacing: null,
    clarity: null,
  });
  const videoRef = useRef<HTMLVideoElement>(null);


  const startAnalysis = async () => {
    
      const feedbackRes = await fetch("/api/feedback/");
      const feedback = await feedbackRes.json();
      const classifyRes = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ feedback: feedback.feedback }),
      })

      const results = await classifyRes.json();

      setAnalysis({
        filler: results.filler,
        pacing: results.pacing,
        clarity: results.clarity,
      });

      setProgress(1);
    };

  const jumpTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      const f = files[0];
      setPreview(URL.createObjectURL(f));
      setFile(f);
    },
  });

  return (
   <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">File Upload</h1>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <input {...getInputProps()} />
          {!preview ? (
            <p className="text-gray-600">
              Drag and drop or click to select file
            </p>
          ) : (
            <div className="space-y-4">
              {file?.type.startsWith("image/") ? (
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={200}
                  className="max-h-64 mx-auto rounded"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={preview}
                  controls
                  className="max-h-64 mx-auto rounded"
                />
              )}
              <p className="text-sm">{file?.name}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Uploaded Files</h2>
          <div className="grid grid-cols-2 gap-4">
            {uploads.map((u) => (
              <div key={u.id} className="bg-white rounded-lg p-3">
                {u.fileType.startsWith("image/") ? (
                  <Image
                    src={u.url}
                    alt={u.name}
                    width={400}
                    height={200}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <video
                    src={u.url}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                <p className="text-xs mt-2 truncate">{u.name}</p>
              </div>
            ))}
          </div>
        </div>

        {progress ? <div className="space-y-4 mt-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-bold">Analysis Results</h2>

            <div>
              <h3 className="font-semibold">Filler Words</h3>
              {analysis.filler ? (
                  <div className="space-y-3">
                  {analysis.filler.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                      onClick={() => jumpTo(item.timestamp)}
                    >
                      <p className="text-sm text-gray-500">At {item.timestamp}s</p>
                      <p>{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Processing filler word analysis…</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Pacing</h3>
              {analysis.pacing ? (
                  <div className="space-y-3">
                  {analysis.pacing.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                      onClick={() => jumpTo(item.timestamp)}
                    >
                      <p className="text-sm text-gray-500">At {item.timestamp}s</p>
                      <p>{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Processing pacing analysis…</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Clarity</h3>
              {analysis.clarity ? (
                  <div className="space-y-3">
                  {analysis.clarity.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                      onClick={() => jumpTo(item.timestamp)}
                    >
                      <p className="text-sm text-gray-500">At {item.timestamp}s</p>
                      <p>{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Processing clarity analysis…</p>
              )}
            </div>
          </div> : <></>}

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
          onClick={startAnalysis}>Start Analysis</button>
      </div>
    </div>
  )
}
