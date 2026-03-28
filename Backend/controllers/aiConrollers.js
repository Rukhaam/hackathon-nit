import { GoogleGenAI } from '@google/genai';
import Exa from 'exa-js';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const exa = new Exa(process.env.EXA_API_KEY);


export const generateBio = async (req, res, next) => {
  try {
    const { category, experience } = req.body;
    const prompt = `Write a short, professional, highly-converting 3-sentence bio for a ${category} with ${experience} years of experience. Do not use placeholders. Focus on quality and reliability.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.status(200).json({ success: true, bio: response.text });
  } catch (error) {
    return next(new ErrorHandler("Failed to generate AI bio", 500));
  }
};
// Add this below generateBio in aiController.js

export const parseSearchQuery = async (req, res, next) => {
    try {
      const { query, availableCategories } = req.body;
  
      if (!query) {
        return res.status(400).json({ success: false, message: "Query is required" });
      }
  
      // 🌟 We instruct Gemini to return PURE JSON so our app can read it instantly
      const prompt = `
        You are an AI assistant for a local service marketplace.
        A user typed this problem: "${query}"
        
        Here are the available service categories on our platform: ${availableCategories.join(", ")}
        
        1. Determine the best category for this problem. If it doesn't fit perfectly, pick the closest match.
        2. Extract the city name if the user mentioned one. If not, return null.
        3. Determine if this sounds like an emergency (e.g., flooding, sparks, broken locks).
  
        Respond ONLY with a valid JSON object. Do not include markdown formatting or backticks.
        Format:
        {
          "categoryName": "Exact matching category from the list",
          "city": "Extracted city or null",
          "isEmergency": true or false
        }
      `;
  
      // Assuming you are using the @google/genai SDK setup from earlier
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      // Clean up the response just in case Gemini wraps it in markdown blocks
      const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanText);
  
      return res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (error) {
      console.error("AI Search Error:", error);
      return res.status(500).json({ success: false, message: "AI search failed to process." });
    }
  };

  export const getFairPriceEstimate = async (req, res, next) => {
    try {
      const { category, city } = req.body;
  
      if (!category || !city) {
        return res.status(400).json({ success: false, message: "Category and city are required." });
      }
  
      // 🌟 1. EXA: Search the live web and grab the text from the top 3 results
      const exaResult = await exa.searchAndContents(
        `Current average hourly rate or service cost for ${category} in ${city}, India`,
        { 
          type: "neural", 
          useAutoprompt: true, 
          numResults: 3, 
          text: true // This tells Exa to return the actual webpage text, not just links!
        }
      );
  
      // Combine the scraped text from Exa into one big string
      const webContext = exaResult.results.map(r => r.text).join('\n\n---\n\n');
  
      // 🌟 2. GEMINI: Read Exa's data and summarize it for the user
      const prompt = `
        You are a pricing assistant for a local service app.
        A user wants to know the fair market price for a ${category} in ${city}.
        
        Read the following live web data scraped by our search engine today:
        ${webContext}
  
        Based ONLY on that web data, write a brief, friendly 2-sentence summary telling the user the fair market price range. 
        If the web data doesn't contain clear prices, give your best general estimate for India and mention that prices vary.
        Do not use markdown formatting.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      return res.status(200).json({
        success: true,
        estimate: response.text,
        // We pass the sources back so we can show the user we did real research!
        sources: exaResult.results.map(r => ({ title: r.title, url: r.url })) 
      });
  
    } catch (error) {
      console.error("Fair Price Estimator Error:", error);
      return res.status(500).json({ success: false, message: "Failed to estimate price." });
    }
  };