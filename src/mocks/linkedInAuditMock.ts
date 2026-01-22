/**
 * Mock data for LinkedIn Audit feature
 * Used for testing the Review and Improve modes in LinkedInWorkspace
 */

import type { LinkedInAudit } from '@/services/api/types';

export const mockLinkedInAudit: LinkedInAudit = {
  userProfile: {
    fullName: "Sarah Johnson",
    headline: "Senior Product Manager",
    location: "San Francisco, CA",
    connections: "500+",
    about: "Senior Product Manager with extensive experience...",
    experience: [],
    education: [],
    skills: [],
    certifications: []
  },
  reviewModule: {
    overallScore: 72,
    summary: "Your LinkedIn profile shows strong professional experience but needs optimization for better visibility. Focus on your headline and about section to improve recruiter engagement by 40%.",
    pillars: [
      {
        id: "headline",
        title: "Headline",
        score: 8,
        reason: "Your headline is clear and includes your role, but it lacks keywords that recruiters search for. Adding specific skills and achievements would increase profile views by 30%.",
        fixChecklist: [
          "Add **3-5 high-value keywords** that recruiters search for in your industry",
          "Include a **quantifiable achievement** (e.g., 'Drove 40% revenue growth')",
          "Mention **specific tools or methodologies** you excel at",
          "Keep it under **120 characters** for mobile optimization",
        ],
        copilotPrompts: [
          "Show me examples of high-performing headlines in my industry",
          "What keywords should I include for my target role?",
          "Help me quantify my biggest achievement",
        ],
      },
      {
        id: "about",
        title: "About Section",
        score: 7,
        reason: "Your about section tells your story but doesn't hook the reader in the first 2 lines. The first 2 lines are visible without clicking 'See More' - this is prime real estate.",
        fixChecklist: [
          "Start with a **powerful hook** in the first sentence (your unique value proposition)",
          "Add **specific metrics** that demonstrate your impact (revenue, users, efficiency gains)",
          "Include a **call-to-action** at the end (e.g., 'Let's connect if you're building...')",
          "Use **short paragraphs** (2-3 lines max) for better readability",
          "Incorporate **industry keywords** naturally throughout",
        ],
        copilotPrompts: [
          "Help me write a compelling opening hook",
          "What metrics should I highlight from my experience?",
          "Show me examples of strong CTAs",
        ],
      },
      {
        id: "experience",
        title: "Work Experience",
        score: 6,
        reason: "Your experience descriptions are too generic and focus on responsibilities rather than achievements. Recruiters want to see impact, not just duties.",
        fixChecklist: [
          "Start each bullet with a **strong action verb** (Led, Drove, Launched, Scaled)",
          "Add **quantifiable results** to every bullet point (%, $, time saved)",
          "Use the **CAR framework**: Context, Action, Result",
          "Limit to **3-5 bullets per role** (quality over quantity)",
          "Include **relevant keywords** for ATS optimization",
        ],
        copilotPrompts: [
          "Help me rewrite my bullets using the CAR framework",
          "What action verbs work best for my industry?",
          "How can I quantify this achievement?",
        ],
      },
      {
        id: "skills",
        title: "Skills & Endorsements",
        score: 7,
        reason: "You have a good skill list, but the order matters. LinkedIn shows your top 3 skills prominently - make sure they align with your target role.",
        fixChecklist: [
          "Pin your **top 3 most relevant skills** for your target role",
          "Add **50 skills total** (LinkedIn's maximum for better discoverability)",
          "Include a mix of **hard skills** (tools, technologies) and **soft skills** (leadership, communication)",
          "Remove outdated or irrelevant skills",
          "Ask colleagues to **endorse your top skills**",
        ],
        copilotPrompts: [
          "What skills should I prioritize for my target role?",
          "Help me identify outdated skills to remove",
          "What's the right balance of hard vs soft skills?",
        ],
      },
      {
        id: "certifications",
        title: "Certifications & Education",
        score: 8,
        reason: "Your certifications are well-documented, but adding credential IDs and expiration dates builds trust and credibility.",
        fixChecklist: [
          "Add **credential IDs** for all certifications",
          "Include **expiration dates** where applicable",
          "Link to **verification URLs** when available",
          "Prioritize **industry-recognized certifications** at the top",
        ],
        copilotPrompts: [
          "Which certifications are most valuable for my industry?",
          "Should I pursue additional certifications?",
        ],
      },
      {
        id: "engagement",
        title: "Content & Engagement",
        score: 5,
        reason: "Low activity on LinkedIn significantly reduces your visibility. The algorithm favors active users. Posting 2-3 times per week can increase profile views by 5x.",
        fixChecklist: [
          "Post **2-3 times per week** (consistency is key)",
          "Engage with others' content **daily** (comment, like, share)",
          "Use **relevant hashtags** (3-5 per post)",
          "Share **original insights** rather than just resharing articles",
          "Respond to comments on your posts **within 1 hour** for maximum reach",
        ],
        copilotPrompts: [
          "Give me 10 post ideas for my industry",
          "What hashtags should I use?",
          "Help me write an engaging post about my recent project",
        ],
      },
    ],
  },
  improveModule: [
    {
      sectionId: "headline",
      title: "Headline",
      existingContent: "Senior Product Manager at TechCorp",
      remarks: "Your current headline is too generic. It doesn't differentiate you from thousands of other product managers. Add your specialization, key achievement, or unique value proposition.",
      suggestedContent: "Senior Product Manager | SaaS Growth Expert | Scaled Products from $5M to $50M ARR | AI/ML Enthusiast",
      improvementTip: "This headline includes your role, specialization (SaaS Growth), a quantifiable achievement ($5M to $50M ARR), and a trending interest (AI/ML). It's keyword-rich and tells a compelling story in one line.",
    },
    {
      sectionId: "about",
      title: "About Section",
      existingContent: "I'm a product manager with 8 years of experience in the tech industry. I've worked on various products and enjoy solving complex problems. I'm passionate about building products that users love.",
      remarks: "This about section is too vague and doesn't showcase your unique value. It reads like every other PM's profile. You need a strong hook, specific achievements, and a clear value proposition.",
      suggestedContent: `I turn complex user problems into elegant product solutions that drive revenue.

Over the past 8 years, I've:
• Scaled 3 SaaS products from $5M to $50M+ ARR
• Led cross-functional teams of 20+ engineers, designers, and data scientists
• Launched AI-powered features that increased user engagement by 65%
• Reduced churn by 40% through data-driven product iterations

My superpower? Translating technical complexity into business value. I bridge the gap between engineering teams and executive stakeholders, ensuring everyone is aligned on the 'why' behind what we build.

Currently exploring: How AI/ML can revolutionize product discovery and personalization.

Let's connect if you're building products that solve real problems at scale.`,
      improvementTip: "This version starts with a powerful value proposition, uses bullet points for readability, includes specific metrics, and ends with a clear CTA. The 'Currently exploring' section shows you're forward-thinking.",
    },
    {
      sectionId: "experience-1",
      title: "Work Experience - TechCorp",
      existingContent: `Senior Product Manager
TechCorp | Jan 2020 - Present

• Managed product roadmap
• Worked with engineering teams
• Conducted user research
• Launched new features`,
      remarks: "These bullets are too generic and focus on responsibilities rather than impact. Every PM does these things. Show what YOU specifically achieved and the business impact.",
      suggestedContent: `Senior Product Manager
TechCorp | Jan 2020 - Present

• Drove $45M in incremental ARR by launching AI-powered recommendation engine, increasing conversion rates by 32% and reducing time-to-value by 50%
• Led cross-functional team of 15 engineers and 3 designers to rebuild core platform, resulting in 99.9% uptime (up from 97%) and 40% reduction in customer support tickets
• Spearheaded data-driven product strategy that reduced churn from 8% to 4.5% annually, retaining $12M in revenue
• Established product analytics framework using Mixpanel and Amplitude, enabling real-time decision-making across 5 product teams`,
      improvementTip: "Each bullet follows the CAR framework: Context (what you did), Action (how you did it), Result (the measurable impact). Notice the specific numbers, tools mentioned, and business outcomes.",
    },
    {
      sectionId: "skills",
      title: "Skills & Endorsements",
      existingContent: "Product Management, Agile, Scrum, Communication, Leadership, Problem Solving, Teamwork, Microsoft Office",
      remarks: "Your skills list is too generic and includes basic skills that don't differentiate you. Focus on high-value, searchable skills that align with your target role.",
      suggestedContent: "Product Strategy, Product Roadmapping, A/B Testing, User Research, Data Analytics, SQL, Python, Mixpanel, Amplitude, Figma, JIRA, Product-Led Growth, SaaS Metrics, Go-to-Market Strategy, Stakeholder Management, Cross-functional Leadership, AI/ML Product Development, API Design, Technical Product Management, Customer Journey Mapping",
      improvementTip: "This skills list includes specific tools (Mixpanel, Amplitude, Figma), methodologies (Product-Led Growth, A/B Testing), and technical skills (SQL, Python) that recruiters search for. Remove generic skills like 'Communication' and 'Teamwork'.",
    },
  ],
};
