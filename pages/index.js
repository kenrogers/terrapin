import { useState } from "react";
import Head from "next/head";
import PropagateLoader from "react-spinners/PropagateLoader";

import { toTitleCase } from "../utils/helpers";

const Home = () => {
  const [userInput, setUserInput] = useState("");
  const [apiOutput, setApiOutput] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [studyNotFound, setStudyNotFound] = useState(false);

  const callAnalyzeEndpoint = async () => {
    setIsAnalyzing(true);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    if (data.output === "Not Found") {
      setStudyNotFound(true);
    } else {
      setStudyNotFound(false);
      setApiOutput(data.output);
    }
    setIsAnalyzing(false);
  };

  const onUserChangedText = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <div className="flex flex-col justify-between items-center p-12 md:px-24 lg:px-48 text-slate-100 min-h-screen">
      <Head>
        <title>Terrapin</title>
      </Head>
      <div className="text-left">
        <h1 className="font-black text-7xl mb-12">
          AI-powered analysis of health studies
        </h1>
        <h2 className="text-3xl mb-8">
          Terrapin makes it easy for everyday people to understand complex
          scientific studies.
        </h2>
        <p className="text-xl mb-6">
          Enter a PubMed URL into the text box below, and Terrapin will generate
          a summary of the study goals, conclusions reached, an overview of the
          methodology used, any potential methodological flaws in the study
          design, and any potential moral implications of the study, all
          explained in simple terms anyone can understand.
        </p>
        <div
          className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 w-full mb-6"
          role="alert"
        >
          <p className="font-bold">Not Medical Advice</p>
          <p>
            Terrpain uses an AI algorithm that may not always be accurate.
            Nothing here should be taken as professional evaluation of the
            quality of a study, claims about the factual accuracy of any studies
            analyzed, or as medical advice.
          </p>
        </div>
        <p className="text-xl mb-6">Try it out 👇🏻</p>
        <p className="text-xl mb-6">
          Not sure what study to look at? Here are a few interesting ones.
        </p>
        <ul className="text-xl mb-6">
          <li>
            <a
              className="font-bold underline text-cyan-500"
              href="https://pubmed.ncbi.nlm.nih.gov/27197250/"
              target="_blank"
            >
              The Role of Cholesterol in Cancer
            </a>
          </li>
          <li>
            <a
              className="font-bold underline text-cyan-500"
              href="https://pubmed.ncbi.nlm.nih.gov/30754681/"
              target="_blank"
            >
              Conjugated Linoleic Acid Effects on Cancer, Obesity, and
              Atherosclerosis
            </a>
          </li>
          <li>
            <a
              className="font-bold underline text-cyan-500"
              href="https://pubmed.ncbi.nlm.nih.gov/33966809/"
              target="_blank"
            >
              LDL cholesterol and atherosclerosis: The evidence
            </a>
          </li>
        </ul>
        <input
          className="w-full p-4 rounded-lg text-xl mb-6 text-slate-900 focus:outline-none"
          type="text"
          placeholder="https://pubmed.ncbi.nlm.nih.gov/123456789/"
          onChange={onUserChangedText}
        />
        <button
          className="bg-cyan-500 text-slate-900 font-bold text-xl p-4 rounded-lg w-full"
          onClick={callAnalyzeEndpoint}
          disabled={isAnalyzing}
        >
          {isAnalyzing
            ? "Analyzing...this might take a minute"
            : "Analyze Study"}
        </button>
      </div>
      <div className="flex flex-col py-12 items-start text-left w-full">
        {isAnalyzing && (
          <div className="self-center">
            <PropagateLoader color="#06b6d4" size={20} />
          </div>
        )}
        {studyNotFound && (
          <div
            className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 w-full"
            role="alert"
          >
            <p className="font-bold">Study Not Found</p>
            <p>That study is not currently in the PMC Open Access Subset.</p>
          </div>
        )}
        {apiOutput &&
          !isAnalyzing &&
          apiOutput.length > 0 &&
          apiOutput.map((section, index) => {
            return (
              <div key={index}>
                <h2 className="text-3xl mb-4 font-bold">
                  {toTitleCase(section.section)}
                </h2>
                <div className="text-xl mb-12 whitespace-pre-line">
                  {section.output.trimStart("\n")}
                </div>
              </div>
            );
          })}
      </div>
      <p className="self-end mt-12">
        * Note that right now Terrapin is only able to access and analyze
        studies that are available under the{" "}
        <a
          className="text-cyan-500 underline font-bold"
          href="https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/"
          target="_blank"
        >
          PMC Open Access Subset
        </a>
        . While this subset contains millions of studies, there is a chance that
        a particular study entered here might not be able to be successfully
        analyzed.
      </p>
    </div>
  );
};

export default Home;
