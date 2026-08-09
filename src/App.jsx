import { useRef, useState } from "react";
import "./App.css";

function App() {
  const fileInputRef = useRef(null);

  const [page, setPage] = useState("home");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [intent, setIntent] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  const handleFile = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImageFile(file);

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
    setError("");
    setPage("preview");
  };

  const startWayfinding = () => {
    fileInputRef.current.click();
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError("");
    setIntent("");
    setPage("home");
    setTarget("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    setPage("analyzing");
    setError("");

    try {
      const formData = new FormData();

      formData.append("image", imageFile);

      const selectedIntent = intents.find(
        (item) => item.id === intent
      );
      
      formData.append(
        "intent",
        selectedIntent?.id || "unsure"
      );

      formData.append(
        "intent_instruction",
        selectedIntent?.aiInstruction ||
          "HELP ME UNDERSTAND THE SITUATION. Ask for clarification if neccesary."
      );

      formData.append("target", target);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

      const response = await fetch(
        `${API_URL}/api/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      let aiResult = data.result;

      // Remove Markdown code fences if Qwen adds them
      aiResult = aiResult
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsedResult = JSON.parse(aiResult);

      if (!Array.isArray(parsedResult.uncertainty)) {
        parsedResult.uncertainty = [];
      }

      if(typeof parsedResult.confidence === "number") {
        parsedResult.confidence = Math.max(
          0, Math.min(parsedResult.confidence, 95)
        );
      }

      console.log("WAYFINDER RESULT:", parsedResult);

      setResult(parsedResult);
      setPage("result");

    } catch (error) {
      console.error("Analysis error:", error);

      setError(
        "WAYFINDER couldn't understand the AI response."
      );

      setPage("preview");
    }
  };

  const intents = [
    {
     id: "understand",
     icon: "🔎",
     title: "Understand this",
     description: "Identify and explain what I'm seeing",
     aiInstruction:
       "DESCRIBE AND EXPLAIN THE IMAGE. Do not give me instructions unless I explicitly ask for them.",
    },

    {
      id: "find",
      icon: "🧭",
     title: "Find something",
     description: "Help me locate a specific thing",
      aiInstruction:
        "HELP ME LOCATE SOMETHING IN THE IMAGE. Identify its position relative to visible landmarks. If no target is specified, ask what I want to find.",
    },

    {
      id: "instructions",
      icon: "📋",
      title: "Follow instructions",
      description: "Tell me what action to take",
      aiInstruction:
       "TELL ME WHAT ACTION TO TAKE. Look for visible signs, labels, instructions, buttons, arrows, or procedures and identify the next appropriate action.",
    },

   {
      id: "navigate",
      icon: "🚶",
      title: "Get somewhere",
      description: "Help me figure out where to go",
      aiInstruction:
        "HELP ME NAVIGATE. Look for entrances, exits, arrows, room numbers, counters, platforms, signs, and landmarks. Tell me where to go next.",
    },

    {
      id: "unsure",
      icon: "🤔",
      title: "I'm not sure",
      description: "Help me figure out what I need",
      aiInstruction:
        "HELP ME UNDERSTAND THE SITUATION. Identify what is visible and determine what information is missing. Ask a clarification question instead of guessing.",
    },
  ];
  return (
    <div className="app">

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        hidden
      />

      {/* NAVBAR */}
      <nav className="navbar">
        <button className="logo" onClick={reset}>
          WAYFINDER
        </button>

        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <>
          <main className="hero">

            <div className="badge">
              AI-powered real-world guidance
            </div>

            <h1>
              <span>Don't know what to do next?</span>
            </h1>

            <p className="hero-description">
              Point your camera at a confusing place, sign, or process.
              WAYFINDER turns what you see into simple, actionable steps.
            </p>

            <button
              className="start-button"
              onClick={startWayfinding}
            >
              📷 Start Wayfinding
            </button>

            <p className="privacy-note">
              No account required · Your image is only used for analysis
            </p>

          </main>

          <section id="how" className="how-section">

            <h2>How it works</h2>

            <div className="steps">

              <div className="step">
                <div className="step-number">01</div>
                <h3>Point</h3>
                <p>
                  Take a photo of the place or instructions
                  confusing you.
                </p>
              </div>

              <div className="step">
                <div className="step-number">02</div>
                <h3>Understand</h3>
                <p>
                  WAYFINDER interprets the scene and identifies
                  what matters.
                </p>
              </div>

              <div className="step">
                <div className="step-number">03</div>
                <h3>Act</h3>
                <p>
                  Get a clear next step instead of a wall of
                  information.
                </p>
              </div>

            </div>

          </section>
        </>
      )}

      {/* IMAGE PREVIEW */}
      {page === "preview" && (
        <main className="preview-page">

          <button
            className="back-button"
            onClick={reset}
          >
            ← Back
          </button>

          <div className="preview-header">
            <div className="badge">
              Step 1 of 2
            </div>

            <h1>
              <span>Show us what's confusing you.</span>
            </h1>

            <p>
              We'll analyze the scene and figure out
              what your next step should be.
            </p>
          </div>

          <div className="image-card">

            <img
              src={image}
              alt="Uploaded scene"
              className="preview-image"
            />

          </div>

          <div className="intent-section">

            <h2>What are you trying to do?</h2>

            <p className="intent-subtitle">
              This helps WAYFINDER give you the right next step.
            </p>

            <div className="intent-grid">

              {intents.map((item) => (
                <button
                  key={item.id}
                  className={`intent-card ${
                    intent === item.id ? "selected" : ""
                  }`}
                  onClick={() => setIntent(item.id)}
                >

                  <span className="intent-icon">
                    {item.icon}
                  </span>

                  <span className="intent-title">
                    {item.title}
                  </span>

                  <span className="intent-description">
                    {item.description}
                  </span>

                </button>
              ))}

            </div>

          </div>
          
          {intent === "find" && (
            <div className="target-input">

              <label>What are you trying to find?</label>

              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. fire extinguisher, door, elevator..."
                color={target.trim() ? "black" : "gray"}
              />

            </div>
          )}

          {intent === "navigate" && (
            <div className="target-input">

              <label>Where are you trying to go?</label>

              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. Room 307, exit, reception..."
              />

            </div>
          )}

          <div className="preview-actions">

            <button
              className="secondary-button"
              onClick={startWayfinding}
            >
              📷 Choose another
            </button>

            <button
              className="analyze-button"
              onClick={analyzeImage}
              disabled={
                !intent || 
                ((intent === "find" || intent === "navigate") && !target.trim())
              }
            >
              Analyze Scene →
            </button>

          </div>

        </main>
      )}

      {/* ANALYZING */}
      {page === "analyzing" && (
        <main className="analyzing-page">

          <div className="loader"></div>

          <div className="badge">
            Step 2 of 2
          </div>

          <h1>
            <span>Understanding your situation...</span>
          </h1>

          <p>
            WAYFINDER is looking for signs, locations,
            instructions and useful clues.
          </p>

        </main>
      )}

      {/* RESULT */}
      {page === "result" && result && (
        <main className="result-page">

          <button
            className="back-button"
            onClick={reset}
          >
            ← Start over
          </button>

          <div className="result-header">

            <div className="badge">
              WAYFINDER ANALYSIS
            </div>

            <h1>
              {result.title}
            </h1>

            <p className="location-type">
              📍 {result.location_type}
            </p>

          </div>

          {/* WHAT I SEE */}

          <section className="observation-card">

            <div className="observation-label">
              👁️ WHAT I SEE
            </div>

            <p>
              {result.observation}
            </p>

          </section>

          {result.uncertainty && result.uncertainty.length > 0 && (
            <div className="uncertainty-card">
              <div className="uncertainty-label">
                ℹ️ WHAT'S UNCERTAIN
              </div>

              <ul>
                {result.uncertainty.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          

          {/* NEXT STEP */}

          <section className="next-step-card">

            <div className="next-step-label">
              🎯 YOUR NEXT STEP
            </div>

            <h2>
              {result.next_step}
            </h2>

          </section>

          {/* STEPS */}

          {result.steps?.length > 0 && (
            <section className="result-section">

              <h2>What to do</h2>

              <div className="action-list">

                {result.steps?.map((step, index) => (
                  <div
                    className="action-item"
                    key={index}
                  >

                    <div className="action-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <p>{step}</p>

                  </div>
                ))}

              </div>

            </section>
          )}
          
          {/* ITEMS */}

          {result.items_needed?.length > 0 && (
            <section className="result-section">

              <h2>Keep ready</h2>

              <div className="items-list">

                {result.items_needed.map((item, index) => (
                  <div
                    className="item"
                    key={index}
                  >
                    ✓ {item}
                  </div>
                ))}

              </div>

            </section>
          )}

          {/* WARNINGS */}

          {result.warnings?.length > 0 && (
            <section className="warning-card">

              <h3>⚠️ Keep in mind</h3>

              {result.warnings.map((warning, index) => (
                <p key={index}>
                  {warning}
                </p>
              ))}

            </section>
         )}

          {/* CONFIDENCE */}

          <div className="confidence">

            <span>AI confidence</span>

            <p>Confidence reflects how clearly the image supports the interpretation.</p>

            <strong>
              {result.confidence}%
            </strong>

          </div>

        </main>
      )}

    </div>
  );
}

export default App;