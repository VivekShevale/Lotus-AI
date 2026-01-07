import React, { useState } from 'react';
import { Upload, FileText, Target, TrendingUp, Award, AlertCircle, CheckCircle, BookOpen, BarChart3, Radar } from 'lucide-react';

const ResumeAnalyzer = () => {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==================== BACKEND: NLP & ML LOGIC ====================

  // Stop words for better text processing
  const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
  ]);

  // Comprehensive skill database (offline)
  const SKILL_CATEGORIES = {
    'Programming Languages': [
      'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
      'kotlin', 'typescript', 'php', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash'
    ],
    'Web Technologies': [
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django',
      'flask', 'fastapi', 'spring', 'asp.net', 'next.js', 'nuxt', 'gatsby', 'jquery',
      'bootstrap', 'tailwind', 'sass', 'webpack', 'babel'
    ],
    'Data Science & AI': [
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 
      'scikit-learn', 'pandas', 'numpy', 'nlp', 'computer vision', 'opencv',
      'data analysis', 'statistics', 'data visualization', 'tableau', 'power bi',
      'matplotlib', 'seaborn', 'plotly', 'xgboost', 'lightgbm', 'hugging face'
    ],
    'Databases': [
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
      'dynamodb', 'oracle', 'sqlite', 'neo4j', 'firebase', 'mariadb'
    ],
    'Cloud & DevOps': [
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab ci', 
      'github actions', 'terraform', 'ansible', 'linux', 'ci/cd', 'serverless',
      'cloudformation', 'helm', 'prometheus', 'grafana', 'nginx', 'apache'
    ],
    'Tools & Frameworks': [
      'git', 'jira', 'agile', 'scrum', 'rest api', 'graphql', 'microservices',
      'oauth', 'jwt', 'websockets', 'rabbitmq', 'kafka', 'spark', 'hadoop'
    ],
    'Soft Skills': [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'collaboration', 'adaptability', 'creativity', 'mentoring'
    ]
  };

  // Learning resources (offline data)
  const LEARNING_RESOURCES = {
    'python': { platform: 'Free', course: 'Python.org Tutorial', time: '2 weeks', priority: 'high' },
    'javascript': { platform: 'Free', course: 'MDN Web Docs', time: '3 weeks', priority: 'high' },
    'react': { platform: 'Free', course: 'React Official Docs', time: '2 weeks', priority: 'high' },
    'machine learning': { platform: 'Coursera', course: 'ML by Andrew Ng', time: '8 weeks', priority: 'high' },
    'sql': { platform: 'Free', course: 'SQLBolt Interactive', time: '1 week', priority: 'high' },
    'docker': { platform: 'Free', course: 'Docker Official Docs', time: '1 week', priority: 'medium' },
    'aws': { platform: 'AWS', course: 'AWS Free Tier Training', time: '4 weeks', priority: 'high' },
    'kubernetes': { platform: 'Free', course: 'Kubernetes.io Tutorial', time: '3 weeks', priority: 'medium' },
    'tensorflow': { platform: 'Free', course: 'TensorFlow.org Guides', time: '4 weeks', priority: 'high' },
    'node.js': { platform: 'Free', course: 'NodeJS.org Learning', time: '2 weeks', priority: 'medium' }
  };

  // ==================== AGENT 1: RESUME PARSER ====================
  const parseResume = (text) => {
    const parsed = {
      rawText: text,
      skills: [],
      experience: [],
      education: [],
      sections: {},
      metadata: {}
    };

    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract skills using pattern matching
    const allSkills = Object.values(SKILL_CATEGORIES).flat();
    const normalizedText = text.toLowerCase();
    
    allSkills.forEach(skill => {
      const skillPattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (skillPattern.test(normalizedText)) {
        parsed.skills.push(skill);
      }
    });

    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) parsed.metadata.email = emailMatch[0];

    // Extract phone
    const phoneMatch = text.match(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
    if (phoneMatch) parsed.metadata.phone = phoneMatch[0];

    // Detect sections
    const sectionKeywords = {
      experience: ['experience', 'work history', 'employment', 'professional experience'],
      education: ['education', 'academic', 'qualification', 'degree'],
      skills: ['skills', 'technical skills', 'expertise', 'competencies'],
      projects: ['projects', 'portfolio', 'work samples']
    };

    let currentSection = null;
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      for (const [section, keywords] of Object.entries(sectionKeywords)) {
        if (keywords.some(kw => lowerLine.includes(kw))) {
          currentSection = section;
          parsed.sections[section] = [];
          return;
        }
      }

      if (currentSection && line.trim()) {
        parsed.sections[currentSection].push(line.trim());
      }
    });

    // Extract years of experience
    const expMatch = text.match(/(\d+)\+?\s*years?/i);
    if (expMatch) {
      parsed.metadata.yearsOfExperience = parseInt(expMatch[1]);
    }

    // Word count and readability
    const words = text.split(/\s+/).filter(w => w.length > 0);
    parsed.metadata.wordCount = words.length;
    parsed.metadata.lineCount = lines.length;

    return parsed;
  };

  // ==================== AGENT 2: JOB DESCRIPTION ANALYZER ====================
  const analyzeJobDescription = (text) => {
    const analysis = {
      requiredSkills: [],
      preferredSkills: [],
      experienceLevel: 'mid',
      keyResponsibilities: [],
      industryKeywords: [],
      metadata: {}
    };

    const normalizedText = text.toLowerCase();
    const allSkills = Object.values(SKILL_CATEGORIES).flat();

    // Extract required skills
    allSkills.forEach(skill => {
      const skillPattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (skillPattern.test(normalizedText)) {
        // Check if it's in a "required" or "must have" section
        const requiredPattern = new RegExp(`(required|must have|essential)[^.]*${skill}`, 'i');
        const preferredPattern = new RegExp(`(preferred|nice to have|bonus)[^.]*${skill}`, 'i');
        
        if (requiredPattern.test(normalizedText)) {
          analysis.requiredSkills.push(skill);
        } else if (preferredPattern.test(normalizedText)) {
          analysis.preferredSkills.push(skill);
        } else {
          analysis.requiredSkills.push(skill);
        }
      }
    });

    // Detect experience level
    if (/senior|lead|principal|staff/i.test(text)) {
      analysis.experienceLevel = 'senior';
      analysis.metadata.yearsRequired = '5-8+';
    } else if (/junior|entry|graduate|intern/i.test(text)) {
      analysis.experienceLevel = 'junior';
      analysis.metadata.yearsRequired = '0-2';
    } else {
      analysis.experienceLevel = 'mid';
      analysis.metadata.yearsRequired = '2-5';
    }

    // Extract responsibilities
    const lines = text.split('\n');
    lines.forEach(line => {
      if (/^[-•*]\s|^\d+\./m.test(line) && line.length > 20 && line.length < 200) {
        analysis.keyResponsibilities.push(line.replace(/^[-•*]\s|^\d+\.\s/, '').trim());
      }
    });

    return analysis;
  };

  // ==================== TF-IDF IMPLEMENTATION ====================
  const computeTFIDF = (text, corpus) => {
    const tokens = tokenize(text);
    const tf = {};
    
    // Term frequency
    tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });

    // Normalize TF
    const maxFreq = Math.max(...Object.values(tf));
    Object.keys(tf).forEach(term => {
      tf[term] = tf[term] / maxFreq;
    });

    // IDF
    const idf = {};
    const allTerms = new Set(tokens);
    
    allTerms.forEach(term => {
      const docsWithTerm = corpus.filter(doc => 
        tokenize(doc).includes(term)
      ).length;
      idf[term] = Math.log(corpus.length / (1 + docsWithTerm));
    });

    // TF-IDF
    const tfidf = {};
    Object.keys(tf).forEach(term => {
      tfidf[term] = tf[term] * (idf[term] || 0);
    });

    return tfidf;
  };

  const tokenize = (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));
  };

  // Cosine similarity
  const cosineSimilarity = (vec1, vec2) => {
    const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    allKeys.forEach(key => {
      const v1 = vec1[key] || 0;
      const v2 = vec2[key] || 0;
      dotProduct += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    });

    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2)) || 0;
  };

  // ==================== AGENT 3: SKILL GAP ANALYZER ====================
  const analyzeSkillGap = (resumeData, jobData) => {
    const resumeSkills = new Set(resumeData.skills.map(s => s.toLowerCase()));
    const requiredSkills = jobData.requiredSkills.map(s => s.toLowerCase());
    const preferredSkills = jobData.preferredSkills.map(s => s.toLowerCase());

    const missingRequired = requiredSkills.filter(skill => !resumeSkills.has(skill));
    const missingPreferred = preferredSkills.filter(skill => !resumeSkills.has(skill));
    const matchedSkills = requiredSkills.filter(skill => resumeSkills.has(skill));

    const matchPercentage = requiredSkills.length > 0 
      ? (matchedSkills.length / requiredSkills.length) * 100 
      : 0;

    // Categorize missing skills
    const categorizedGaps = {};
    const allMissing = [...missingRequired, ...missingPreferred];
    
    Object.entries(SKILL_CATEGORIES).forEach(([category, skills]) => {
      const missing = allMissing.filter(skill => 
        skills.includes(skill)
      );
      if (missing.length > 0) {
        categorizedGaps[category] = missing;
      }
    });

    // Skill importance ranking based on frequency in job description
    const skillImportance = {};
    [...requiredSkills, ...preferredSkills].forEach(skill => {
      const count = (jobData.requiredSkills.includes(skill) ? 2 : 1);
      skillImportance[skill] = count;
    });

    return {
      matchPercentage: parseFloat(matchPercentage.toFixed(1)),
      matchedSkills,
      missingRequired,
      missingPreferred,
      categorizedGaps,
      skillImportance,
      totalRequired: requiredSkills.length,
      totalMatched: matchedSkills.length
    };
  };

  // ==================== AGENT 4: ATS SCORE & QUALITY ANALYZER ====================
  const calculateATSScore = (resumeData, jobData, skillGap) => {
    let score = 0;
    const feedback = [];
    const checks = {
      skillMatch: false,
      formatting: false,
      keywords: false,
      length: false,
      contact: false,
      sections: false,
      experience: false,
      quantifiable: false
    };

    // 1. Skill Match (30 points)
    const skillScore = (skillGap.matchPercentage / 100) * 30;
    score += skillScore;
    checks.skillMatch = skillScore > 20;
    
    if (skillScore < 15) {
      feedback.push({
        category: 'Skills',
        severity: 'high',
        message: `Only ${skillGap.matchPercentage}% skill match`,
        suggestion: 'Add more relevant skills from the job description'
      });
    }

    // 2. Formatting (15 points)
    const hasSections = Object.keys(resumeData.sections).length >= 3;
    if (hasSections) {
      score += 15;
      checks.formatting = true;
    } else {
      feedback.push({
        category: 'Format',
        severity: 'high',
        message: 'Missing key sections',
        suggestion: 'Include: Experience, Education, Skills, Projects'
      });
    }

    // 3. Keyword Optimization (20 points)
    const jobKeywords = tokenize(jobData.requiredSkills.join(' '));
    const resumeText = resumeData.rawText.toLowerCase();
    const keywordMatches = jobKeywords.filter(kw => resumeText.includes(kw)).length;
    const keywordScore = (keywordMatches / jobKeywords.length) * 20;
    score += keywordScore;
    checks.keywords = keywordScore > 12;

    if (keywordScore < 10) {
      feedback.push({
        category: 'Keywords',
        severity: 'medium',
        message: 'Low keyword density',
        suggestion: 'Naturally incorporate job description keywords'
      });
    }

    // 4. Length Check (10 points)
    const wordCount = resumeData.metadata.wordCount;
    if (wordCount >= 400 && wordCount <= 800) {
      score += 10;
      checks.length = true;
    } else if (wordCount < 400) {
      feedback.push({
        category: 'Length',
        severity: 'medium',
        message: `Too short (${wordCount} words)`,
        suggestion: 'Expand with more details (aim for 400-800 words)'
      });
    } else {
      feedback.push({
        category: 'Length',
        severity: 'low',
        message: `Too long (${wordCount} words)`,
        suggestion: 'Condense to 400-800 words for better readability'
      });
    }

    // 5. Contact Information (5 points)
    if (resumeData.metadata.email && resumeData.metadata.phone) {
      score += 5;
      checks.contact = true;
    } else {
      feedback.push({
        category: 'Contact',
        severity: 'high',
        message: 'Missing contact information',
        suggestion: 'Include email and phone number at the top'
      });
    }

    // 6. Section Completeness (10 points)
    const requiredSections = ['experience', 'education', 'skills'];
    const hasAllSections = requiredSections.every(s => resumeData.sections[s]);
    if (hasAllSections) {
      score += 10;
      checks.sections = true;
    } else {
      const missing = requiredSections.filter(s => !resumeData.sections[s]);
      feedback.push({
        category: 'Sections',
        severity: 'high',
        message: `Missing sections: ${missing.join(', ')}`,
        suggestion: 'Add all standard resume sections'
      });
    }

    // 7. Experience Relevance (10 points)
    const expSection = resumeData.sections.experience || [];
    if (expSection.length > 0) {
      score += 5;
      
      // Check for quantifiable achievements
      const hasNumbers = expSection.some(line => /\d+%|\d+\+|\$\d+|\d+ [a-z]+/i.test(line));
      if (hasNumbers) {
        score += 5;
        checks.quantifiable = true;
      } else {
        feedback.push({
          category: 'Experience',
          severity: 'medium',
          message: 'No quantifiable achievements',
          suggestion: 'Add metrics: "Increased X by Y%", "Reduced Z by N hours"'
        });
      }
      checks.experience = true;
    } else {
      feedback.push({
        category: 'Experience',
        severity: 'high',
        message: 'No work experience section found',
        suggestion: 'Add detailed work experience with achievements'
      });
    }

    return {
      score: Math.round(score),
      maxScore: 100,
      grade: score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F',
      feedback: feedback.sort((a, b) => {
        const severity = { high: 3, medium: 2, low: 1 };
        return severity[b.severity] - severity[a.severity];
      }),
      checks,
      readability: calculateReadability(resumeData),
      suggestions: generateImprovements(checks, resumeData)
    };
  };

  const calculateReadability = (resumeData) => {
    const text = resumeData.rawText;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;

    let score = 100;
    if (avgWordsPerSentence > 25) score -= 20;
    if (avgWordsPerSentence > 30) score -= 10;

    return {
      score,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      totalSentences: sentences.length,
      complexity: avgWordsPerSentence > 25 ? 'high' : avgWordsPerSentence > 20 ? 'medium' : 'low'
    };
  };

  const generateImprovements = (checks, resumeData) => {
    const improvements = [];

    if (!checks.quantifiable) {
      improvements.push('Add numbers and metrics to your achievements');
    }
    if (!checks.keywords) {
      improvements.push('Use more keywords from the job description');
    }
    if (!checks.skillMatch) {
      improvements.push('Highlight more relevant technical skills');
    }
    if (!checks.sections) {
      improvements.push('Organize content into clear sections');
    }

    return improvements;
  };

  // ==================== LEARNING ROADMAP GENERATOR ====================
  const generateLearningRoadmap = (skillGap) => {
    const roadmap = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    const allMissing = [...skillGap.missingRequired, ...skillGap.missingPreferred];
    
    // Prioritize based on importance
    const prioritized = allMissing
      .map(skill => ({
        skill,
        importance: skillGap.skillImportance[skill] || 1,
        resource: LEARNING_RESOURCES[skill] || { 
          platform: 'YouTube/Google', 
          course: `Search for "${skill} tutorial"`, 
          time: '2-4 weeks',
          priority: 'medium'
        }
      }))
      .sort((a, b) => b.importance - a.importance);

    // Categorize by timeline
    prioritized.forEach((item, idx) => {
      const entry = {
        skill: item.skill,
        resource: item.resource.course,
        platform: item.resource.platform,
        estimatedTime: item.resource.time,
        priority: item.resource.priority,
        importance: item.importance
      };

      if (idx < 3) {
        roadmap.immediate.push(entry);
      } else if (idx < 7) {
        roadmap.shortTerm.push(entry);
      } else {
        roadmap.longTerm.push(entry);
      }
    });

    return roadmap;
  };

  // ==================== MAIN ANALYSIS FUNCTION ====================
  const analyzeResume = async () => {
    if (!resume || !jobDesc.trim()) {
      alert('Please upload a resume and paste a job description');
      return;
    }

    setLoading(true);

    try {
      // Read resume text
      const resumeText = await resume.text();

      // Run all agents
      const resumeData = parseResume(resumeText);
      const jobData = analyzeJobDescription(jobDesc);
      const skillGapAnalysis = analyzeSkillGap(resumeData, jobData);
      const atsScore = calculateATSScore(resumeData, jobData, skillGapAnalysis);
      const roadmap = generateLearningRoadmap(skillGapAnalysis);

      // Semantic similarity using TF-IDF
      const corpus = [resumeText, jobDesc];
      const resumeTFIDF = computeTFIDF(resumeText, corpus);
      const jobTFIDF = computeTFIDF(jobDesc, corpus);
      const semanticSimilarity = cosineSimilarity(resumeTFIDF, jobTFIDF) * 100;

      setAnalysis({
        resume: resumeData,
        job: jobData,
        skillGap: skillGapAnalysis,
        atsScore,
        roadmap,
        semanticSimilarity: parseFloat(semanticSimilarity.toFixed(1))
      });

    } catch (error) {
      alert('Error analyzing resume: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-bold text-white">Resume Skill Gap Analyzer</h1>
          </div>
          <p className="text-cyan-200 text-sm md:text-base">Offline NLP • 4-Agent System • TF-IDF + Cosine Similarity</p>
          <p className="text-purple-300 text-xs md:text-sm mt-2">Parser → JD Analyzer → Skill Gap → ATS Score</p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Resume Upload */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Resume
            </h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 rounded-lg p-8 cursor-pointer hover:border-cyan-300 hover:bg-cyan-500/10 transition">
              <FileText className="w-12 h-12 text-cyan-400 mb-3" />
              <span className="text-white mb-1">Click to upload</span>
              <span className="text-xs text-cyan-200">TXT, PDF (text-based)</span>
              <input 
                type="file" 
                accept=".txt,.pdf" 
                onChange={(e) => setResume(e.target.files[0])}
                className="hidden" 
              />
            </label>
            {resume && (
              <p className="mt-3 text-cyan-200 text-sm">✓ {resume.name}</p>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Job Description
            </h2>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here...

Example:
We are looking for a Senior Python Developer with 5+ years of experience. Must have: Python, Django, REST API, PostgreSQL, Docker. Nice to have: AWS, Kubernetes, React."
              className="w-full h-48 bg-slate-900/50 text-white p-4 rounded-lg border border-purple-400/30 focus:border-purple-400 focus:outline-none resize-none text-sm"
            />
            <p className="mt-2 text-purple-300 text-xs">{jobDesc.length} characters</p>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="text-center mb-6">
          <button
            onClick={analyzeResume}
            disabled={!resume || !jobDesc.trim() || loading}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center gap-3 mx-auto"
          >
            <TrendingUp className="w-6 h-6" />
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mb-4"></div>
            <p className="text-cyan-200">🤖 Running multi-agent analysis...</p>
            <p className="text-purple-300 text-sm mt-2">Parsing → Analyzing → Matching → Scoring</p>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/50">
                <p className="text-green-200 text-sm mb-1">ATS Score</p>
                <p className="text-4xl font-bold text-white">{analysis.atsScore.score}</p>
                <p className="text-green-300 text-xs">Grade: {analysis.atsScore.grade}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/50">
                <p className="text-blue-200 text-sm mb-1">Skill Match</p>
                <p className="text-4xl font-bold text-white">{analysis.skillGap.matchPercentage}%</p>
                <p className="text-blue-300 text-xs">{analysis.skillGap.totalMatched}/{analysis.skillGap.totalRequired} skills</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/50">
                <p className="text-purple-200 text-sm mb-1">Semantic Match</p>
                <p className="text-4xl font-bold text-white">{analysis.semanticSimilarity}%</p>
                <p className="text-purple-300 text-xs">TF-IDF Cosine</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-4 border border-pink-500/50">
                <p className="text-pink-200 text-sm mb-1">Missing Skills</p>
                <p className="text-4xl font-bold text-white">{analysis.skillGap.missingRequired.length}</p>
                <p className="text-pink-300 text-xs">Required skills</p>
              </div>
            </div>

            {/* ATS Score Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-green-500/40">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-400" />
                ATS Score & Quality Analysis
              </h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Overall Score</span>
                  <span className="text-2xl font-bold text-green-400">{analysis.atsScore.score}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all ${
                      analysis.atsScore.score >= 80 ? 'bg-green-500' :
                      analysis.atsScore.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.atsScore.score}%` }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Quality Checks</h3>
                  <div className="space-y-2">
                    {Object.entries(analysis.atsScore.checks).map(([check, passed]) => (
                      <div key={check} className="flex items-center gap-2">
                        {passed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-sm ${passed ? 'text-green-300' : 'text-red-300'}`}>
                          {check.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Readability</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-300">Score</p>
                      <p className="text-2xl font-bold text-white">{analysis.atsScore.readability.score}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Avg Words/Sentence</p>
                      <p className="text-xl font-bold text-white">{analysis.atsScore.readability.avgWordsPerSentence}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Complexity</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        analysis.atsScore.readability.complexity === 'low' ? 'bg-green-600' :
                        analysis.atsScore.readability.complexity === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                      } text-white`}>
                        {analysis.atsScore.readability.complexity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">Feedback & Improvements</h3>
                {analysis.atsScore.feedback.length === 0 ? (
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                    <p className="text-green-300">🎉 Excellent! No major issues found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysis.atsScore.feedback.map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-lg ${
                        item.severity === 'high' ? 'bg-red-500/20 border border-red-500' :
                        item.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500' :
                        'bg-blue-500/20 border border-blue-500'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`font-semibold ${
                            item.severity === 'high' ? 'text-red-300' :
                            item.severity === 'medium' ? 'text-yellow-300' : 'text-blue-300'
                          }`}>{item.category}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.severity === 'high' ? 'bg-red-600' :
                            item.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                          } text-white uppercase`}>{item.severity}</span>
                        </div>
                        <p className="text-white text-sm mb-1">❌ {item.message}</p>
                        <p className="text-gray-300 text-sm">💡 {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/40">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-400" />
                Skill Gap Analysis
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500">
                  <h3 className="text-sm font-semibold text-green-300 mb-2">✓ Matched Skills</h3>
                  <p className="text-3xl font-bold text-white mb-2">{analysis.skillGap.matchedSkills.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillGap.matchedSkills.slice(0, 6).map((skill, idx) => (
                      <span key={idx} className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {analysis.skillGap.matchedSkills.length > 6 && (
                      <span className="text-green-300 text-xs">+{analysis.skillGap.matchedSkills.length - 6} more</span>
                    )}
                  </div>
                </div>

                <div className="bg-red-500/20 rounded-lg p-4 border border-red-500">
                  <h3 className="text-sm font-semibold text-red-300 mb-2">⚠ Missing Required</h3>
                  <p className="text-3xl font-bold text-white mb-2">{analysis.skillGap.missingRequired.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillGap.missingRequired.slice(0, 6).map((skill, idx) => (
                      <span key={idx} className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {analysis.skillGap.missingRequired.length > 6 && (
                      <span className="text-red-300 text-xs">+{analysis.skillGap.missingRequired.length - 6} more</span>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500">
                  <h3 className="text-sm font-semibold text-yellow-300 mb-2">⭐ Missing Preferred</h3>
                  <p className="text-3xl font-bold text-white mb-2">{analysis.skillGap.missingPreferred.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillGap.missingPreferred.slice(0, 6).map((skill, idx) => (
                      <span key={idx} className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {analysis.skillGap.missingPreferred.length > 6 && (
                      <span className="text-yellow-300 text-xs">+{analysis.skillGap.missingPreferred.length - 6} more</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Categorized Gaps */}
              {Object.keys(analysis.skillGap.categorizedGaps).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Missing Skills by Category</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(analysis.skillGap.categorizedGaps).map(([category, skills]) => (
                      <div key={category} className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                        <h4 className="font-semibold text-cyan-300 mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Learning Roadmap */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/40">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-cyan-400" />
                Personalized Learning Roadmap
              </h2>

              {/* Immediate (0-2 weeks) */}
              {analysis.roadmap.immediate.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      IMMEDIATE
                    </div>
                    <span className="text-gray-300 text-sm">Start Now (0-2 weeks)</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.roadmap.immediate.map((item, idx) => (
                      <div key={idx} className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white capitalize">{item.skill}</h3>
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                            {item.estimatedTime}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          📚 <strong>{item.platform}:</strong> {item.resource}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Priority:</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.priority === 'high' ? 'bg-red-600' : 'bg-orange-600'
                          } text-white uppercase`}>{item.priority}</span>
                          <span className="text-xs text-yellow-300">⭐ Importance: {item.importance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short-term (2-6 weeks) */}
              {analysis.roadmap.shortTerm.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      SHORT-TERM
                    </div>
                    <span className="text-gray-300 text-sm">Next Phase (2-6 weeks)</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {analysis.roadmap.shortTerm.map((item, idx) => (
                      <div key={idx} className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                        <h3 className="text-base font-bold text-white capitalize mb-2">{item.skill}</h3>
                        <p className="text-sm text-gray-300 mb-2">
                          📚 {item.platform}: {item.resource}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{item.estimatedTime}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.priority === 'high' ? 'bg-yellow-600' : 'bg-yellow-700'
                          } text-white uppercase`}>{item.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Long-term (6+ weeks) */}
              {analysis.roadmap.longTerm.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      LONG-TERM
                    </div>
                    <span className="text-gray-300 text-sm">Future Goals (6+ weeks)</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {analysis.roadmap.longTerm.map((item, idx) => (
                      <div key={idx} className="bg-green-500/20 border border-green-500 rounded-lg p-3">
                        <h3 className="text-sm font-bold text-white capitalize mb-1">{item.skill}</h3>
                        <p className="text-xs text-gray-300 mb-2">{item.platform}</p>
                        <span className="text-xs text-gray-400">{item.estimatedTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visualization: Skill Match Radar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/40">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Radar className="w-6 h-6 text-blue-400" />
                Visual Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Skill Distribution */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-4">Skill Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(analysis.skillGap.categorizedGaps).slice(0, 5).map(([category, skills]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{category}</span>
                          <span className="text-white font-bold">{skills.length}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${(skills.length / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Breakdown */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-4">Match Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Skill Match</span>
                        <span className="text-green-400 font-bold">{analysis.skillGap.matchPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${analysis.skillGap.matchPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Semantic Similarity</span>
                        <span className="text-purple-400 font-bold">{analysis.semanticSimilarity}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full"
                          style={{ width: `${analysis.semanticSimilarity}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">ATS Score</span>
                        <span className="text-cyan-400 font-bold">{analysis.atsScore.score}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-cyan-500 h-3 rounded-full"
                          style={{ width: `${analysis.atsScore.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Summary */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-6 border-2 border-cyan-400">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Action Summary
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="text-cyan-300 font-semibold mb-2">🎯 Focus Areas</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {analysis.roadmap.immediate.slice(0, 3).map((item, idx) => (
                      <li key={idx}>• Learn {item.skill}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="text-cyan-300 font-semibold mb-2">📝 Resume Updates</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {analysis.atsScore.suggestions.slice(0, 3).map((suggestion, idx) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="text-cyan-300 font-semibold mb-2">⏱ Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <span className="text-red-400 font-bold">Week 1-2:</span> {analysis.roadmap.immediate.length} skills
                    </p>
                    <p className="text-gray-300">
                      <span className="text-yellow-400 font-bold">Week 3-6:</span> {analysis.roadmap.shortTerm.length} skills
                    </p>
                    <p className="text-gray-300">
                      <span className="text-green-400 font-bold">Week 7+:</span> {analysis.roadmap.longTerm.length} skills
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;