import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const prompts = [
  {
    section: "TL;DR",
    prompt: `
Give me the tl;dr of the following study.

Study:
`,
  },
  {
    section: "Study Summary",
    prompt: `
Write a comprehensive explanation of the following study to a non-expert:

Study:
`,
  },
  {
    section: "Methodological Soundness",
    prompt: `
Thoroughly evaluate the methodological soundness of the following study:

Study:
`,
  },
  {
    section: "Study Limitations",
    prompt: `
Write a comprehensive overview of the limitations of the following study methodology:

Study:
`,
  },
  {
    section: "Broader Implications",
    prompt: `
Write a comprehensive overview of the broader implications of the following study:

Study:
`,
  },
  {
    section: "Potential Moral Considerations",
    prompt: `
Thoroughly evaluate any potential moral problems with the conclusions drawn in the following study.

Study:
`,
  },
];

const analyzeAction = async (req, res) => {
  const pubMedUrl = req.body.userInput;

  // Trim any trailing slashes from the pubMedUrl, then extract the PubMed ID
  const pubMedId = pubMedUrl.replace(/\/$/, "").split("/").pop();
  try {
    const studyLink = await fetch(
      `https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/${pubMedId}/unicode`
    );
    console.log(studyLink);
    const studyInfo = await studyLink.json();
    console.log(studyInfo);

    // find the abstract section of the study
    const abstract = studyInfo.documents[0].passages.find(
      (passage) => passage.infons.type === "abstract"
    ).text;

    const responses = await Promise.all(
      prompts.map(async (prompt) => {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `${prompt.prompt}${abstract}`,
          temperature: 0.7,
          max_tokens: 1000,
        });
        return {
          section: prompt.section,
          output: completion.data.choices.pop().text,
        };
      })
    );
    res.status(200).json({ output: responses });
  } catch (error) {
    console.log(error);
    res.status(200).json({ output: "Not Found" });
  }
};

export default analyzeAction;

// old methods, saving just for first commit in case I need them again
// const setSummaries = async (studyInfo) => {
//   // First go through and format the data into a structure that plays nice with Open AI
//   // To do this, we'll create an array of objects, where each object is a section of the study, with corresponding title and text
//   let formattedStudyText = {};
//   let currentSection = "";
//   await studyInfo.documents[0].passages.map((passage) => {
//     // First map out the object structure of all the sections
//     if (passage.infons.type === "abstract") {
//       formattedStudyText.abstract += passage.text;
//     } else if (
//       passage.infons.type === "title_2" ||
//       passage.infons.type === "title_1"
//     ) {
//       currentSection = passage.text;
//       formattedStudyText[passage.text] = {
//         section: passage.infons.section_type,
//       };
//     } else if (passage.infons.type === "paragraph") {
//       if (formattedStudyText[currentSection].text === undefined) {
//         formattedStudyText[currentSection] = { text: passage.text };
//       } else {
//         formattedStudyText[currentSection].text += passage.text += " ";
//       }
//     }
//   });

//   let summariesArray = await Object.entries(formattedStudyText).map(
//     async ([sectionTitle, sectionText]) => {
//       if (sectionTitle.toLowerCase() === "abstract") {
//         // assign each section to a property on the completions object, with the key being the sectionTitle and the value being the returned Open AI completion
//         const completion = await openai.createCompletion({
//           model: "text-davinci-003",
//           prompt: `Thoroughly summarize and explain the following scientific study abstract in simple language: ${sectionText}`,
//           temperature: 0.7,
//           max_tokens: 1000,
//         });
//         return {
//           title: sectionTitle,
//           text: completion.data.choices.pop().text,
//         };
//       } //else if (sectionTitle.toLowerCase() === "methods") {
//       //   // assign each section to a property on the completions object, with the key being the sectionTitle and the value being the returned Open AI completion
//       //   const completion = await openai.createCompletion({
//       //     model: "text-davinci-003",
//       //     prompt: `Thoroughly summarize, explain, and identify and flaws and limititations in the following scientific study methodology in simple language: ${sectionText.text}`,
//       //     temperature: 0.7,
//       //     max_tokens: 1000,
//       //   });
//       //   return {
//       //     title: sectionTitle,
//       //     text: completion.data.choices.pop().text,
//       //   };
//       // } else {
//       //   // assign each section to a property on the completions object, with the key being the sectionTitle and the value being the returned Open AI completion
//       //   const completion = await openai.createCompletion({
//       //     model: "text-davinci-003",
//       //     prompt: `Write a summarized version of the following text for a college student. It should be thorough and cover all aspects of the text: ${sectionText.text}`,
//       //     temperature: 0.7,
//       //     max_tokens: 1000,
//       //   });
//       //   return {
//       //     title: sectionTitle,
//       //     text: completion.data.choices.pop().text,
//       //   };
//       // }
//     }
//   );
//   console.log(summariesArray);
//   return summariesArray;
// };

// const setInsights = async (summariesData) => {
//   const insightsArray = [
//     { type: "takeaways", text: "" },
//     { type: "limitations", text: "" },
//   ];

//   let insights = await insightsArray.map(async (insight) => {
//     // find the summariesArray item that has a title of abstract
//     let sectionText = await summariesData.find(
//       (item) => item.title === "abstract"
//     );
//     if (insight.type === "limitations") {
//       let completion = await openai.createCompletion({
//         model: "text-davinci-003",
//         prompt: `Explain the limitations and pitfalls of the following study. ${sectionText}`,
//         temperature: 0.7,
//         max_tokens: 1000,
//       });
//       return {
//         type: insight.type,
//         text: completion.data.choices.pop().text,
//       };
//     } else {
//       let completion = await openai.createCompletion({
//         model: "text-davinci-003",
//         prompt: `Explain the key takeaways of the following study. ${sectionText}`,
//         temperature: 0.7,
//         max_tokens: 1000,
//       });
//       return {
//         type: insight.type,
//         text: completion.data.choices.pop().text,
//       };
//     }
//   });

//   return insights;
// };
