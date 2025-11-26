import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile, User, ProfileType } from '@/database/entities';
import { CareerAdvisorQueryDto } from './dto';

interface CareerPath {
  title: string;
  matchPercentage: number;
  description: string;
  salary: string;
  growth: string;
  industryOutlook: string;
}

export interface CareerAdviceResponse {
  research?: string;
  careerAdvice?: string;
  careerPaths?: CareerPath[];
  skillGaps?: string[];
  nextSteps?: string[];
  advice?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiApiKey: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserProfile) private profileRepository: Repository<UserProfile>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
  }

  async getCareerAdvice(userId: string, queryDto: CareerAdvisorQueryDto): Promise<CareerAdviceResponse> {
    // Get user profile
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    // Build profile context
    const profileContext = this.buildProfileContext(profile, queryDto);

    const systemPrompt = queryDto.prompt 
      ? `You are an expert career advisor for university students. Provide personalized, actionable career advice. Be specific, encouraging, and include concrete steps.`
      : `You are an AI career advisor for university students. Provide DETAILED analysis in JSON format with: research, careerAdvice, careerPaths (array with title, matchPercentage, description, salary, growth, industryOutlook), skillGaps (array of strings), and nextSteps (array of strings).`;

    const userMessage = queryDto.prompt 
      ? `${profileContext}\n\nQuestion: ${queryDto.prompt}`
      : `Analyze this student profile and provide comprehensive career guidance:\n\n${profileContext}`;

    try {
      // Call Gemini API
      const response = await this.callGeminiApi(systemPrompt, userMessage);
      
      if (queryDto.prompt) {
        return { advice: response };
      }

      // Parse JSON response for comprehensive analysis
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse AI response as JSON, returning raw text');
      }

      return {
        careerAdvice: response,
        careerPaths: [],
        skillGaps: [],
        nextSteps: [],
      };
    } catch (error) {
      this.logger.error(`Error calling Gemini API: ${error.message}`);
      throw new BadRequestException('Failed to get career advice. Please try again later.');
    }
  }

  async getAlumniMatch(userId: string): Promise<any> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    // Get all alumni profiles
    const alumniProfiles = await this.profileRepository.find({
      where: { profileType: ProfileType.ALUMNI },
      relations: ['user'],
    });

    // Build matching prompt
    const studentContext = `
Student Skills: ${profile.skills?.join(', ') || 'Not specified'}
Student Interests: ${profile.mentorshipTopics?.join(', ') || 'Not specified'}
Student Career Goals: ${profile.headline || 'Not specified'}
Student Branch: ${profile.departmentOrCourse || 'Not specified'}
    `.trim();

    const alumniList = alumniProfiles.map((alumni, index) => `
Alumni ${index + 1}:
- Name: ${alumni.firstName} ${alumni.lastName}
- Company: ${alumni.currentCompany || 'N/A'}
- Position: ${alumni.currentPosition || 'N/A'}
- Industry: ${alumni.industry || 'N/A'}
- Skills: ${alumni.skills?.join(', ') || 'N/A'}
    `).join('\n');

    const prompt = `
Based on this student's profile and available alumni mentors, suggest the top 5 best matches for mentorship.
Return as JSON array with: alumniIndex (1-based), matchScore (0-100), reason.

${studentContext}

Available Alumni:
${alumniList}
    `.trim();

    try {
      const response = await this.callGeminiApi(
        'You are an AI matching system for connecting students with alumni mentors. Analyze compatibility based on career goals, skills, and interests.',
        prompt
      );

      // Parse response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const matches = JSON.parse(jsonMatch[0]);
        return matches.map((match: any) => ({
          ...match,
          alumni: alumniProfiles[match.alumniIndex - 1],
        }));
      }

      return [];
    } catch (error) {
      this.logger.error(`Error in alumni matching: ${error.message}`);
      return [];
    }
  }

  private buildProfileContext(profile: UserProfile | null, queryDto: CareerAdvisorQueryDto): string {
    const skills = queryDto.skills || profile?.skills || [];
    const interests = queryDto.interests || profile?.mentorshipTopics || [];
    const careerGoals = queryDto.careerGoals || profile?.headline || 'Not specified';
    const branch = queryDto.branch || profile?.departmentOrCourse || 'Not specified';
    const semester = queryDto.semester || 'Not specified';
    const cgpa = queryDto.cgpa || 'Not specified';

    return `
Student Profile:
- Name: ${profile?.firstName || 'Student'} ${profile?.lastName || ''}
- Branch/Major: ${branch}
- Semester: ${semester}
- CGPA: ${cgpa}
- Skills: ${skills.length > 0 ? skills.join(', ') : 'None listed'}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'None listed'}
- Career Goals: ${careerGoals}
    `.trim();
  }

  private async callGeminiApi(systemPrompt: string, userMessage: string): Promise<string> {
    if (!this.geminiApiKey) {
      // Fallback response if no API key
      return this.getFallbackResponse(userMessage);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\n${userMessage}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private getFallbackResponse(prompt: string): string {
    // Return a helpful fallback response when API is not available
    return JSON.stringify({
      research: "AI service is currently unavailable. Please configure GEMINI_API_KEY.",
      careerAdvice: "Based on general career guidance principles, focus on building practical skills, networking with professionals, and gaining hands-on experience through internships or projects.",
      careerPaths: [
        {
          title: "Software Developer",
          matchPercentage: 85,
          description: "Build applications and systems using various programming languages",
          salary: "₹6-25 LPA",
          growth: "High",
          industryOutlook: "Strong demand across all sectors"
        },
        {
          title: "Data Analyst",
          matchPercentage: 75,
          description: "Analyze data to help organizations make better decisions",
          salary: "₹5-18 LPA",
          growth: "Very High",
          industryOutlook: "Rapidly growing field"
        }
      ],
      skillGaps: [
        "Add specific technical skills to your profile for personalized recommendations",
        "Configure AI service for detailed analysis"
      ],
      nextSteps: [
        "Complete your profile with skills and career goals",
        "Explore alumni connections in your field of interest",
        "Look for internship opportunities"
      ]
    });
  }
}
