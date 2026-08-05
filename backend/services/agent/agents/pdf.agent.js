import { getModel } from "../config/llmModels.js";
import { generatePdf } from "../utils/generatePdf.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { updateCredits } from "../utils/deductCredits.js";

export const pdfAgent = async (state) => {
  try {
    const llm = await getModel("pdf");
    const prompt = `
        You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
  "title": "",
  "subtitle": "",
  "sections": [
    {
      "heading": "",
      "points": []
    }
  ]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

Topic:

${state.prompt}
        `;

    const res = await llm.invoke(prompt);
    const data = JSON.parse(res.content);
    const pdfBuffer = await generatePdf(data);

    const fileName = `pdf-${Date.now()}.pdf`;
    await uploadToS3(fileName, pdfBuffer, "application/pdf");

    const downloadUrl = await getFromS3(fileName, 24 * 60);
    await updateCredits(state.userId, "pdf", state.headers);

    return {
      ...state,
      aiResponse: `# ${data.title || "Document Generated Successfully"}

${data.subtitle ? `*${data.subtitle}*\n` : ""}
Your PDF document has been compiled and uploaded.

[Download PDF Document](${downloadUrl})

*Note: The download link will expire in 24 hours.*`.trim(),
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: "Failed to generate Pdf.",
    };
  }
};
