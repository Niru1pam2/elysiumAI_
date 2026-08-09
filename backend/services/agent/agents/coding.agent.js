import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModels.js";
import { updateCredits } from "../utils/deductCredits.js";

export const codingAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "coding");

    const intentLlm = await getModel("intent");
    const llm = await getModel("coding");

    const intentRes = await intentLlm.invoke(`
      You are an intent classifier.
      
      Return ONLY one of these values.
      
      CODE_GENERATION
      CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION
        
        User Request:
        ${state.prompt}
        `);

    // Clean whitespace/newlines from classifier response
    const intent = intentRes.content ? String(intentRes.content).trim() : "";

    if (intent === "CODE_GENERATION") {
      const prompt = `You are elysiumAI Coding Agent.
          
          Generate the requested project.
          
          Default stack:
          - HTML
          - CSS
          - JavaScript
          
          Use React / Next.js / Vue ONLY if explicitly requested.
          
          Rules:
          - Responsive
          - Modern UI
          - CSS Variables
          - Flexbox/Grid
          - Smooth Scroll
          - Hover Effects
          - Beautiful spacing
          - Single page unless user asks otherwise.
          
          Return ONLY valid JSON.
          
          Schema:
          {
            "files": [
              {
                "name": "index.html",
                "content": "..."
                },
    {
      "name": "style.css",
      "content": "..."
      },
      {
        "name": "script.js",
        "content": "..."
        }
        ]
        }
        
        Rules:
        - Output must start with {
          - Output must end with }
          - No markdown
          - No explanation
          - No extra text
          - Do not wrap the JSON in backticks or code blocks
          - Never mention intent
          
          User Request:
${state.prompt}`;

      const res = await llm.invoke(prompt);

      // 1. Strip markdown fences if the LLM added them anyway
      const rawContent = res.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // 2. Safe JSON parsing with fallback for truncated responses
      let data;
      try {
        data = JSON.parse(rawContent);
      } catch (parseError) {
        console.error("JSON Parsing Error (Truncated LLM output):", parseError);
        return {
          ...state,
          aiResponse:
            "The generated code was too long and got cut off by the model. Please try asking for a simpler or single-component request.",
          artifacts: [],
        };
      }

      await updateCredits(state.userId, "coding", state.headers);
      return {
        ...state,
        aiResponse: "Code generated successfully.",
        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            title: state.prompt,
            files: data.files || [],
          },
        ],
      };
    }

    // Default handling for all other intents
    const res = await llm.invoke(`
      The user's request intent is: ${intent}
      
      Return Markdown only.
      Never generate project files.
      
      Use headings like:
      # Overview
      ## Explanation
      ## Problems
      ## Improvements
    ## Best practices
    ## Optimized Code (if needed)
    
    User Request:
    ${state.prompt}
    `);

    await updateCredits(state.userId, "coding", state.headers);

    return {
      ...state,
      aiResponse: res.content,
      artifacts: [],
    };
  } catch (error) {
    if (error.status == 429) {
      return {
        ...state,
        aiResponse: error?.data.message,
      };
    }
    return {
      ...state,
      aiResponse: "Failed to analyze code.",
    };
  }
};
