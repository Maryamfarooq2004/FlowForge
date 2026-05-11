import { GoogleGenerativeAI } from '@google/generative-ai';

let genAIInstance: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
};

export const getSuggestionsService = async (
  content: string,
  screenSlug: string,
  domain: string
) => {
  const genAI = getGenAI();
  
  if (!genAI) {
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
    console.log(`[AI] Fetching suggestions for ${screenSlug} in ${domain}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-*•\d.]\s+/, '').trim())
      .slice(0, 3);
  } catch (error: any) {
    console.error('Gemini API Error details:', {
      message: error?.message,
      stack: error?.stack,
      promptSnippet: prompt.substring(0, 50) + '...'
    });
    console.error('Gemini API Key present:', !!process.env.GEMINI_API_KEY);
    
    let suggestions: string[] = [];
    if (screenSlug === 'story') {
      suggestions = [
        "Patients arrive at the front desk and provide their ID. The receptionist verifies their insurance and checks them into the system for their scheduled appointment.",
        "Doctors perform the clinical examination and record the diagnosis in the patient chart. They then issue a digital prescription that is sent directly to the pharmacy.",
        "The billing department reviews the clinical notes and generates an invoice. Patients receive a payment link via email and can pay using credit card or insurance."
      ];
    } else if (screenSlug === 'roles') {
      suggestions = [
        "Receptionist: Responsible for patient greeting, appointment scheduling, and collecting initial demographic data.",
        "Doctor: Has full clinical access to diagnose patients, write medical notes, and approve prescriptions.",
        "Billing Manager: Oversees financial transactions, processes insurance claims, and manages clinic expenses."
      ];
    } else if (screenSlug === 'data') {
      suggestions = [
        "Patient Records: Should track Full Name, Date of Birth, Contact Number, and Blood Group.",
        "Medical History: A rich text area to record chronic conditions, previous surgeries, and known allergies.",
        "Inventory: Tracks medicine stock levels, batch numbers, and expiry dates for the clinic pharmacy."
      ];
    } else if (screenSlug === 'rules') {
      suggestions = [
        "Appointments must be canceled at least 24 hours in advance to avoid a no-show fee.",
        "Only users with the 'Doctor' role can view sensitive medical histories or edit clinical diagnoses.",
        "A payment receipt must be automatically generated and emailed as soon as a transaction is marked as 'Completed'."
      ];
    }
    
    return suggestions.length > 0 ? suggestions : [
      'Describe the start of your process.',
      'Identify the key roles involved.',
      'List the data you need to capture.'
    ];
  }
};
