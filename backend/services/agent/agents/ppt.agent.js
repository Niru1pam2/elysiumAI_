import { getModel } from "../config/llmModels.js";
import { generatePpt } from "../utils/generatePpt.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { updateCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pptAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "ppt");

    const llm = await getModel("ppt");
    const prompt = `You are a professional presentation designer.

Format:

{
  "title":"",
  "subtitle":"",
  "slides":[
    {
      "title":"",
      "points":[
        "",
        "",
        "",
        ""
      ]
    }
  ]
}

Rules:

- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- No markdown.
- No explanation.
- No code block.
- Return ONLY JSON.

Topic:

${state.prompt}`;

    const response = await llm.invoke(prompt);

    const pptBuffer = await generatePpt(JSON.parse(response.content));

    const fileName = `ppt-${Date.now()}.pptx`;
    await uploadToS3(
      fileName,
      pptBuffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );

    const downloadUrl = await getFromS3(fileName, 24 * 60);
    await updateCredits(state.userId, "ppt", state.headers);

    return {
      ...state,
      aiResponse:
        `# ${JSON.parse(response.content).title || "PPT Generated Successfully"}

${JSON.parse(response.content).subtitle ? `*${JSON.parse(response.content).subtitle}*\n` : ""}
Your PPT document has been compiled and uploaded.

[Download PPT Document](${downloadUrl})

*Note: The download link will expire in 24 hours.*`.trim(),
    };
  } catch (error) {
    console.log(error);

    if (error.status == 429) {
      return {
        ...state,
        aiResponse: error?.data.message,
      };
    }
    return {
      ...state,
      aiResponse: "Failed to generate Ppt.",
    };
  }
};
