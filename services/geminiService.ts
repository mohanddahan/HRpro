
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askHRAssistant(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `أنت مساعد موارد بشرية (HR Assistant) ذكي ومحترف. 
        مهمتك هي مساعدة مديري الموارد البشرية في:
        1. كتابة الأوصاف الوظيفية.
        2. الإجابة على استفسارات الموظفين حول سياسات العمل (بناءً على المعايير العالمية).
        3. صياغة رسائل البريد الإلكتروني الرسمية (قبول، رفض، تنبيه).
        4. تقديم نصائح لتحسين بيئة العمل.
        يجب أن تكون إجاباتك باللغة العربية، مهنية، واضحة، ومختصرة قدر الإمكان.`,
        temperature: 0.7,
      },
    });

    return response.text || 'عذراً، لم أتمكن من معالجة طلبك حالياً.';
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.';
  }
}
