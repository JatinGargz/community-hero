import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to convert File to Generative Part (base64)
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: file.type
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Check if Gemini API key exists
export const getGeminiApiKey = () => {
  return localStorage.getItem('VIGILANT_GEMINI_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const saveGeminiApiKey = (key) => {
  localStorage.setItem('VIGILANT_GEMINI_KEY', key);
};

// Fallback Mock Analyzer when API Key is missing
const mockAnalyzeImage = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const name = file.name.toLowerCase();
      let category = 'Roads & Infrastructure';
      let title = 'Road damage reported';
      let description = 'Significant damage detected on the street surface requiring repair.';
      let severity = 'Medium';
      let isValidIssue = true;
      let rejectionReason = '';
      
      if (name.includes('friend') || name.includes('selfie') || name.includes('group') || name.includes('random') || name.includes('car')) {
        isValidIssue = false;
        rejectionReason = 'The uploaded photo appears to show a group of people or general scene, but no municipal hazard (such as a pothole, garbage, or utility leak) was detected. Please upload a clear photo of a civic issue to earn points.';
        category = 'Other';
        title = 'No civic issue detected';
        description = '';
        severity = 'Low';
      } else if (name.includes('trash') || name.includes('garbage') || name.includes('waste')) {
        category = 'Sanitation & Waste';
        title = 'Overflowing garbage bin';
        description = 'Public garbage bin is overflowing with waste spilling onto the sidewalk, creating unsanitary conditions and odor.';
        severity = 'High';
      } else if (name.includes('hole') || name.includes('pothole') || name.includes('road')) {
        category = 'Roads & Infrastructure';
        title = 'Deep street pothole';
        description = 'A deep, hazardous pothole is located in the middle of the driving lane. Vehicles are swerving to avoid it, presenting an immediate hazard.';
        severity = 'Critical';
      } else if (name.includes('light') || name.includes('streetlight') || name.includes('dark')) {
        category = 'Public Utilities';
        title = 'Non-functional streetlight';
        description = 'Streetlight is completely out, leaving the residential intersection dark and raising safety concerns for pedestrians.';
        severity = 'Low';
      } else if (name.includes('leak') || name.includes('water') || name.includes('pipe')) {
        category = 'Public Utilities';
        title = 'Broken water pipe leak';
        description = 'Water is leaking continuously from an underground pipe onto the road surface, causing clean water wastage and local flooding.';
        severity = 'High';
      }

      // Generate a mock location near center
      const latOffset = (Math.random() - 0.5) * 0.015;
      const lngOffset = (Math.random() - 0.5) * 0.015;
      
      resolve({
        isValidIssue,
        rejectionReason,
        category,
        title,
        description,
        severity,
        location: {
          latitude: 12.9716 + latOffset,
          longitude: 77.5946 + lngOffset,
          address: 'Hyperlocal Area, Sector ' + Math.floor(Math.random() * 10 + 1)
        },
        aiConfidence: Math.floor(Math.random() * 15) + 80 // 80-95%
      });
    }, 2000); // 2-second simulation delay
  });
};

// Main Analysis Service (Vision Agent)
export const analyzeIssueImage = async (file) => {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    console.log('Gemini API Key missing. Using Mock Vision Agent...');
    return mockAnalyzeImage(file);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash as it is fast and handles multimodal input
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const imagePart = await fileToGenerativePart(file);
    const prompt = `
      You are the AI Vision Agent for "Vigilant", a hyperlocal civic issue tracking app.
      
      Your FIRST and most critical duty is to filter out spam, social photos, selfies, and unrelated uploads:
      - The municipal hazard (such as a pothole, road damage, overflowing garbage, water leak, broken light, or public safety hazard) MUST be the primary, clear subject of the photo.
      - If the image is a portrait, selfie, group photo of friends posing, or a general scene where people or personal property (like cars in a clean garage) are the primary subject, you MUST reject the image (set "isValidIssue" to false) even if there is background pavement, a road, or utilities visible.
      - Do not search for minor, microscopic background details or general flooring wear to justify a social, personal, or group photo. It must be a clear, dedicated photo of a civic grievance.

      Provide your analysis strictly in JSON format. The JSON object MUST contain the following fields:
      - "isValidIssue": Boolean (true if the image is a dedicated photo of a public infrastructure/utility hazard, false if it is a social photo, selfie, portrait, group photo, food, text, or general non-hazard image).
      - "rejectionReason": If "isValidIssue" is false, provide a polite 1-2 sentence explanation of why the image was rejected (e.g., "The image appears to be a social/group photo of people and does not depict a clear municipal hazard as the primary subject."). If "isValidIssue" is true, set this to "".
      - "category": Choose one of ["Roads & Infrastructure", "Sanitation & Waste", "Public Utilities", "Public Safety", "Other"]. (If isValidIssue is false, set this to "Other").
      - "title": A concise, 4-6 word description of the issue.
      - "severity": Choose one of ["Low", "Medium", "High", "Critical"] based on safety hazard.
      - "description": A detailed, 2-3 sentence description of the damage or hazard shown.
      - "aiConfidence": A number between 75 and 99 representing your analysis confidence score.

      Return ONLY the raw JSON string, without any markdown formatting wrappers (no \`\`\`json blocks).
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean JSON string if LLM returned markdown code blocks
    let cleanJson = text;
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```$/, '');
    }
    
    const parsed = JSON.parse(cleanJson);
    
    // Add mock location offsets near center (since images don't always contain coordinates)
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lngOffset = (Math.random() - 0.5) * 0.015;

    return {
      ...parsed,
      location: {
        latitude: 12.9716 + latOffset,
        longitude: 77.5946 + lngOffset,
        address: 'Sector ' + Math.floor(Math.random() * 10 + 1) + ', Tech Park Suburb'
      }
    };
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    // Graceful fallback to mock report on API failure
    return mockAnalyzeImage(file);
  }
};

// AI Civic complaint drafting (Drafting Agent)
export const draftCivicComplaint = async (report) => {
  const apiKey = getGeminiApiKey();
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const localDraftTemplate = `
Date: ${dateStr}

To,
The Chief Grievance Officer,
Municipal Corporation & Civic Management Department

Subject: Official Grievance regarding ${report.title} (Category: ${report.category})

Dear Sir/Madam,

This is to formally bring to your attention a civic infrastructure grievance located at ${report.location.address}.

Details of the Issue:
- Description: ${report.description}
- Severity Level: ${report.severity}
- Category: ${report.category}

This issue represents a public hazard and degrades the livability of the area. We kindly request the municipal department to review this report and schedule an inspection / resolution at the earliest convenience.

Sincerely,
Concerned Citizen (via Vigilant App)
  `.trim();

  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(localDraftTemplate), 1000);
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      You are the "Civic Grievance Drafting Agent" for Vigilant.
      Write a professional, formal letter/email to the municipal department regarding the following civic issue:
      - Title: ${report.title}
      - Category: ${report.category}
      - Severity: ${report.severity}
      - Description: ${report.description}
      - Location: ${report.location.address}
      
      The letter should look like an official municipal grievance. Maintain a respectful, constructive, yet urgent tone suitable for a ${report.severity} severity issue.
      Include placeholders for date (which is today: ${dateStr}) and appropriate departmental greeting.
      Do not output markdown code blocks, just return the plain formatted text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error drafting complaint with Gemini:', error);
    return localDraftTemplate;
  }
};

// Calculates Trust Index based on proximity of previous reports
export const calculateConsensusScore = (newReport, existingReports) => {
  if (existingReports.length === 0) return 100; // Base score for first report
  
  // Quick distance helper (approximate flat earth)
  const getDistance = (loc1, loc2) => {
    const ky = 111.13; // km per degree
    const kx = Math.cos(loc1.latitude * Math.PI / 180) * 111.32;
    const dx = Math.abs(loc1.longitude - loc2.longitude) * kx;
    const dy = Math.abs(loc1.latitude - loc2.latitude) * ky;
    return Math.sqrt(dx * dx + dy * dy); // returns km
  };

  let nearbySameCategoryCount = 0;
  existingReports.forEach(r => {
    if (r.category === newReport.category) {
      const distance = getDistance(newReport.location, r.location);
      if (distance < 0.5) { // within 500 meters
        nearbySameCategoryCount++;
      }
    }
  });

  // Base trust is 90%. If there are existing matching reports nearby, it boosts consensus/validation up to 98%
  return Math.min(90 + (nearbySameCategoryCount * 4), 98);
};
