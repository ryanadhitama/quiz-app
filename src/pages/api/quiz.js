import axios from 'axios';
import { decodeQuestionData, decodeAnswers } from '@/utils/string';

/**
 * Quiz Questions API Route
 * Server-side proxy to Open Trivia Database API
 * Handles HTML entity decoding on server to avoid client-side document errors
 * 
 * GET /api/quiz?amount=10&category=17&difficulty=medium&type=multiple
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use GET.' 
    });
  }

  try {
    // Extract query parameters with default values
    const {
      amount = 10,           // number of questions (1-50)
      category,              // category ID (optional)
      difficulty,            // difficulty: easy, medium, hard (optional)
      type = 'multiple'      // type: multiple or boolean
    } = req.query;

    // Validate amount parameter
    const questionCount = Math.min(Math.max(parseInt(amount) || 10, 1), 50);

    // Validate difficulty parameter
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty. Must be: easy, medium, or hard'
      });
    }

    // Validate type parameter
    if (type && !['multiple', 'boolean'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be: multiple or boolean'
      });
    }

    // Build URL with query parameters
    let apiUrl = `https://opentdb.com/api.php?amount=${questionCount}&type=${type}`;
    
    if (category) {
      apiUrl += `&category=${category}`;
    }
    
    if (difficulty) {
      apiUrl += `&difficulty=${difficulty}`;
    }

    console.log(`[Quiz API] Fetching questions: ${apiUrl}`);

    // Fetch data from Open Trivia Database API
    const response = await axios.get(apiUrl, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        'User-Agent': 'Quiz-App-Next.js',
        'Accept': 'application/json'
      }
    });

    const data = response.data;

    // Check response code from API
    if (data.response_code !== 0) {
      const errorMessages = {
        0: 'Success',
        1: 'No Results - Could not return results. The API doesn\'t have enough questions for your query.',
        2: 'Invalid Parameter - Contains an invalid parameter.',
        3: 'Token Not Found - Session Token does not exist.',
        4: 'Token Empty - Session Token has returned all possible questions for the specified query.',
        5: 'Token Not Found - Session Token does not exist.'
      };

      console.error(`[Quiz API] API Error Code: ${data.response_code}`);

      return res.status(400).json({
        success: false,
        message: errorMessages[data.response_code] || 'Unknown error occurred',
        response_code: data.response_code,
        metadata: {
          count: questionCount,
          category: category || 'Any',
          difficulty: difficulty || 'Any'
        }
      });
    }

    // Decode HTML entities on server-side
    // This prevents "document undefined" errors in SSR
    const decodedQuestions = data.results.map((question, index) => {
      const decoded = decodeQuestionData(question);
      
      // Also decode all answers and combine them
      const decodedCorrectAnswer = decodeHtml(question.correct_answer);
      const decodedIncorrectAnswers = decodeAnswers(question.incorrect_answers);
      
      return {
        id: `q_${Date.now()}_${index}`,
        index: index + 1,
        category: decoded.category,
        type: decoded.type,
        difficulty: decoded.difficulty,
        question: decoded.question,
        correct_answer: decodedCorrectAnswer,
        incorrect_answers: decodedIncorrectAnswers,
        all_answers: [
          ...decodedIncorrectAnswers,
          decodedCorrectAnswer
        ]
      };
    });

    // Return data with enhanced structure
    return res.status(200).json({
      success: true,
      message: 'Questions fetched successfully',
      data: {
        total: decodedQuestions.length,
        questions: decodedQuestions
      },
      metadata: {
        timestamp: new Date().toISOString(),
        count: questionCount,
        category: category || 'Any',
        difficulty: difficulty || 'Any',
        type: type
      }
    });

  } catch (error) {
    console.error('[Quiz API] Error fetching quiz data:', error);

    // Handle various error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Request timeout. The quiz server took too long to respond.',
        error_code: 'TIMEOUT'
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to quiz server. Please check your internet connection.',
        error_code: 'CONNECTION_FAILED'
      });
    }

    if (error.code === 'ENETUNREACH') {
      return res.status(503).json({
        success: false,
        message: 'Network is unreachable. Please check your internet connection.',
        error_code: 'NETWORK_UNREACHABLE'
      });
    }

    if (error.response) {
      // Error from API server
      const statusCode = error.response.status || 500;
      const errorMessage = error.response.statusText || 'Unknown API error';
      
      console.error(`[Quiz API] API Response Error: ${statusCode} - ${errorMessage}`);

      return res.status(statusCode).json({
        success: false,
        message: `Quiz API error: ${errorMessage}`,
        status: statusCode,
        error_code: 'API_ERROR'
      });
    }

    // Unknown errors
    const devErrorMessage = error.message || 'Unknown error occurred';
    
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching quiz questions.',
      error_code: 'INTERNAL_ERROR',
      error: process.env.NODE_ENV === 'development' ? devErrorMessage : undefined
    });
  }
}

/**
 * HTML decoding utility (inline version to avoid import issues)
 */
function decodeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Common HTML entities
  const htmlEntities = {
    '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&amp;': '&',
    '&quot;': '"', '&apos;': "'", '&cent;': '¢', '&pound;': '£',
    '&yen;': '¥', '&euro;': '€', '&copy;': '©', '&reg;': '®',
    '&trade;': '™', '&micro;': 'µ', '&para;': '¶', '&middot;': '·',
    '&bull;': '•', '&hellip;': '…', '&prime;': '′', '&Prime;': '″',
    '&ndash;': '–', '&mdash;': '—', '&lsquo;': '‘', '&rsquo;': '’',
    '&ldquo;': '"', '&rdquo;': '"', '&dagger;': '†', '&Dagger;': '‡',
    '&permil;': '‰', '&lsaquo;': '‹', '&rsaquo;': '›',
    '#039;': "'", '#39;': "'", '#34;': '"', '#38;': '&',
    '#60;': '<', '#62;': '>', '#160;': ' ', '#8217;': "'",
    '#8220;': '"', '#8221;': '"', '#8230;': '…'
  };

  // Replace named entities
  let decoded = html.replace(
    new RegExp(Object.keys(htmlEntities).join('|'), 'g'),
    (entity) => htmlEntities[entity] || entity
  );

  // Replace numeric entities (&#1234;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });

  // Replace hexadecimal entities (&#x1F600;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
}

// Configuration for Next.js API route
export const config = {
  api: {
    // Enable CORS
    externalResolver: true,
    // Body parser
    bodyParser: true,
    // Response limit
    responseLimit: '1mb',
  },
};