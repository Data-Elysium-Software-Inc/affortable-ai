// pages/embedded-app.tsx or any other page where you want to embed the app

import React from "react";

const EmbeddedAppPage: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Live Transcription (Includes Bengali)
      </h1> */}
      <div style={{ height: "calc(100vh - 50px)", width: "100%" }}>
        <iframe
          src={`${process.env.TEXT_TO_SPEECH_LINK}`}
          width="100%"
          height="100%"
          style={{
            border: "none",
            display: "block",
            margin: "0 auto",
            borderRadius: "8px",
          }}
          title="Live Transcription (Includes Bengali)"
          allow="microphone"  // This allows the iframe to access the microphone
        />
      </div>
    </div>
  );
};

export default EmbeddedAppPage;
