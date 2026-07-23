export function buildMatchPrompt(cv: string, coverLetter: string, jobDescription: string): string {
  return `You are an expert career coach and ATS specialist. Your task is to analyze how well a candidate's CV and cover letter match a job description.

CANDIDATE CV:
---
${cv}
---

CANDIDATE COVER LETTER TEMPLATE:
---
${coverLetter}
---

JOB DESCRIPTION:
---
${jobDescription}
---

INSTRUCTIONS:
1. First detect the language of the job description (French or English).
2. Extract the job title and company name from the job description.
3. Score the match across 5 dimensions (1-10 scale).
4. Produce a tailored CV that highlights the most relevant parts of the candidate's experience for THIS specific job.
5. ALWAYS regenerate and tailor the 'Qualités', 'Soft Skills', or 'Skills' section on the CV to perfectly match the soft/hard skills requested in the job description.
6. Produce a tailored cover letter in the SAME language as the job description with 4 paragraphs: hook, why this company, why the candidate, call to action. 
   - Ensure the cover letter is of average, professional length (around 300-400 words) and is not too short.
   - ALWAYS INSTRUCTION: If the candidate's Experience Level score is low, explicitly address this in the cover letter. Convince the recruiter that despite the formal experience gap, the candidate possesses the necessary practical, hands-on experience, rapid learning ability, and transferable skills to excel in the role.
7. Identify missing ATS keywords, key strengths, and gaps.

IMPORTANT:
- Be direct and honest. If there's a mismatch, say so clearly.
- The tailored CV and cover letter must be in the SAME language as the job description.
- Do semantic matching, not just keyword matching.
- Keep tailored CV in clean Markdown format.
- EXCEPTION: If the original CV is in LaTeX (.tex), YOU MUST output valid LaTeX.
  - CRITICAL: DO NOT modify ANY LaTeX commands, preambles, macros, or structural syntax (e.g., never change square brackets '[]' to curly braces '{}' in commands like \\usepackage).
  - ONLY modify the plain text content (job titles, descriptions, bullets) to tailor it to the job.
- Keep tailored cover letter in clean prose paragraphs. If original is LaTeX, output valid LaTeX with the exact same strict structural preservation rules.

Return ONLY a valid JSON object with this exact structure (no markdown, no code block):
{
  "jobTitle": "string",
  "company": "string",
  "jobLanguage": "fr" or "en",
  "overallScore": number (1-10),
  "dimensions": [
    {
      "name": "Skills Match",
      "nameFr": "Correspondance des compétences",
      "score": number (1-10),
      "feedback": "English feedback",
      "feedbackFr": "French feedback"
    },
    {
      "name": "Experience Level",
      "nameFr": "Niveau d'expérience",
      "score": number (1-10),
      "feedback": "English feedback",
      "feedbackFr": "French feedback"
    },
    {
      "name": "Culture & Values",
      "nameFr": "Culture & valeurs",
      "score": number (1-10),
      "feedback": "English feedback",
      "feedbackFr": "French feedback"
    },
    {
      "name": "Language Requirements",
      "nameFr": "Exigences linguistiques",
      "score": number (1-10),
      "feedback": "English feedback",
      "feedbackFr": "French feedback"
    },
    {
      "name": "Keywords & ATS",
      "nameFr": "Mots-clés & ATS",
      "score": number (1-10),
      "feedback": "English feedback",
      "feedbackFr": "French feedback"
    }
  ],
  "tailoredCv": "Full tailored CV in Markdown, in the job's language",
  "tailoredCoverLetter": "Full tailored cover letter as prose, in the job's language",
  "missingKeywords": ["keyword1", "keyword2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"]
}`;
}
