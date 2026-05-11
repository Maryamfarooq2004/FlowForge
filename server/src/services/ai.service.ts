import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const getSuggestionsService = async (
  content: string,
  screenSlug: string,
  domain: string
) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return [
      'Enter your Gemini API key to see AI suggestions.',
      'AI can help you refine your workflow details.',
    ];
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompts: Record<string, string> = {
    story: `As an AI assistant for a ${domain} management system, the user is describing their workflow story. Based on what they've written so far: "${content}", suggest 3 short, helpful next steps or details they should include. Keep it brief and relevant to a ${domain} context.`,
    roles: `As an AI assistant for a ${domain} management system, the user is listing roles. Based on: "${content}", suggest 3 professional roles they might have missed for their ${domain}.`,
    data: `As an AI assistant for a ${domain} management system, the user is listing data fields. Based on: "${content}", suggest 3 specific data points or record fields commonly used in ${domain} workflows.`,
    rules: `As an AI assistant for a ${domain} management system, the user is defining rules. Based on: "${content}", suggest 3 common business rules or validations for a ${domain} process.`,
  };

  const prompt = prompts[screenSlug] || `Based on: "${content}", suggest 3 helpful additions for this ${domain} workflow.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Simple parsing: split by lines and clean up bullets
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-*•\d.]\s+/, '').trim())
      .slice(0, 3);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return ['Unable to fetch suggestions at this time.'];
  }
};
