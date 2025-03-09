import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

interface LLMResponse {
  generated_text: string;
}

interface Mentor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string | null;
  profilePicture: string | null;
  bio: string | null;
}

const FALLBACK_KEYWORDS: Record<string, string[]> = {
  general: ['leadership', 'coaching', 'experience', 'guidance', 'technology', 'finance'],
  technology: ['programming', 'software', 'development', 'coding', 'tech'],
  business: ['entrepreneur', 'strategy', 'management', 'startup'],
  career: ['resume', 'interview', 'jobsearch', 'career', 'professional'],
  marketing: ['digital', 'content', 'seo', 'socialmedia', 'branding'],
  finance: ['investment', 'financial', 'money', 'budget', 'planning'],
  engineering: ['technical', 'design', 'hardware', 'systems', 'mechanical'],
  health: ['wellbeing', 'mental', 'fitness', 'health', 'wellness']
};

export const searchMentors = async (req: any, res: any) => {
  const { query }: { query: string } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const trimmedQuery = query.trim().toLowerCase();
    let keywords: string[] = extractKeywords(trimmedQuery);
    
    if (keywords.length < 2) {
      try {
        const LLMResponse: string = await processWithLLM(trimmedQuery);
        keywords = extractKeywords(LLMResponse);
      } catch (llmError) {
        console.error('LLM processing failed:', llmError);
        keywords = getFallbackKeywords(trimmedQuery);
      }
    }
    
    const mentors: Mentor[] = await fetchMentorsByKeywords(keywords);

    if (mentors.length === 0) {
      const fallbackKeywords = getFallbackKeywords(trimmedQuery);
      const fallbackMentors: Mentor[] = await fetchMentorsByKeywords(fallbackKeywords);
      
      return res.json({ mentors: fallbackMentors, keywords: fallbackKeywords, usedFallback: true });
    }

    res.json({ mentors, keywords });
  } catch (error) {
    console.error('Error in searchMentors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function getFallbackKeywords(query: string): string[] {
  for (const [domain, keywords] of Object.entries(FALLBACK_KEYWORDS)) {
    if (domain !== 'general' && keywords.some(keyword => query.includes(keyword))) {
      return FALLBACK_KEYWORDS[domain];
    }
  }

  return FALLBACK_KEYWORDS.general;
}

async function processWithLLM(query: string): Promise<string> {
  const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
  
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Based on the search query "${query}", extract relevant keywords that represent key skills and characteristics a mentor should have.`,
        parameters: { max_length: 150, num_return_sequences: 1 },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API responded with status: ${response.status}`);
    }

    const data: LLMResponse[] = await response.json();
    if (!data || !data[0] || !data[0].generated_text) {
      throw new Error('Invalid LLM response');
    }
    return data[0].generated_text;
  } catch (error) {
    console.error('Error in LLM processing:', error);
    throw error;
  }
}

function extractKeywords(queryResponse: string): string[] {
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
    'should', 'can', 'could', 'may', 'might', 'must', 'that', 'which', 'who', 'whom',
    'whose', 'where', 'when', 'why', 'how', 'query', 'based', 'on', 'for', 'with',
    'look', 'need', 'want', 'search', 'find', 'seeking', 'help', 'please', 'thanks',
    'thank', 'looking', 'about', 'like', 'someone', 'people', 'person', 'mentor'
  ];
  const words = queryResponse.toLowerCase().split(/\W+/).filter(word => 
    word.length > 2 && !stopWords.includes(word)
  );
  return [...new Set(words)];
}

async function fetchMentorsByKeywords(keywords: string[]): Promise<Mentor[]> {
  const mentors = await prisma.mentorProfile.findMany({
    where: {
      OR: [
        { user: { firstName: { contains: keywords.join(' '), mode: 'insensitive' } } },
        { user: { lastName: { contains: keywords.join(' '), mode: 'insensitive' } } },
        { bio: { contains: keywords.join(' '), mode: 'insensitive' } },
        { domains: { some: { name: { in: keywords, mode: 'insensitive' } } } },
        { services: { some: { name: { in: keywords, mode: 'insensitive' } } } },
      ],
    },
    include: {
      user: true,
      domains: true,
    },
    take: 6,
    orderBy : {
      rating : "desc"
    },
  });

  return mentors.map((mentor : any) => ({
    id: mentor.id,
    userId: mentor.userId,
    firstName: mentor.user.firstName,
    lastName: mentor.user.lastName,
    profilePicture: mentor.profilePicture,
    bio: mentor.bio,
  }));
};