import axios from 'axios';

// API endpoint untuk mengambil kategori quiz
// Ini akan dipanggil dari server-side rendering (getServerSideProps)
export default async function handler(req, res) {
  // Hanya izinkan metode GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use GET.' 
    });
  }

  try {
    // Cache control untuk mengurangi API calls
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    console.log('Fetching quiz categories from Open Trivia Database API');

    // Fetch data dari Open Trivia Database API - Categories endpoint
    const response = await axios.get('https://opentdb.com/api_category.php', {
      timeout: 10000, // 10 detik timeout
      headers: {
        'User-Agent': 'Quiz-App-Next.js',
      }
    });

    const data = response.data;

    // Validasi response data
    if (!data || !data.trivia_categories || !Array.isArray(data.trivia_categories)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid response from quiz server',
        data: data
      });
    }

    // Proses dan format kategori
    const categories = data.trivia_categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      index: index + 1
    }));

    // Kelompokkan kategori ke dalam grup yang lebih besar untuk kemudahan navigasi
    const categoryGroups = {
      general: categories.filter(c => 
        c.id === 9 || // General Knowledge
        c.name.includes('General') ||
        c.name.includes('Miscellaneous')
      ),
      entertainment: categories.filter(c => 
        c.name.includes('Entertainment') ||
        c.name.includes('Music') ||
        c.name.includes('Celebrities') ||
        c.name.includes('Anime') ||
        c.name.includes('Cartoon')
      ),
      science: categories.filter(c => 
        c.name.includes('Science') ||
        c.name.includes('Math') ||
        c.name.includes('Computers') ||
        c.name.includes('Nature') ||
        c.name.includes('Gadgets')
      ),
      geography: categories.filter(c => 
        c.name.includes('Geography') ||
        c.name.includes('History')
      ),
      sports: categories.filter(c => 
        c.name.includes('Sports')
      ),
      arts: categories.filter(c => 
        c.name.includes('Art') ||
        c.name.includes('Literature') ||
        c.name.includes('Mythology')
      )
    };

    // Return data dengan struktur yang lebih baik
    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: {
        total: categories.length,
        categories: categories,
        groups: categoryGroups,
        popular: categories.slice(0, 10), // 10 kategori populer
        all: categories // Semua kategori
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('Error fetching quiz categories:', error);

    // Handle berbagai tipe error
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Request timeout. The quiz server took too long to respond.'
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to quiz server. Please check your internet connection.'
      });
    }

    if (error.response) {
      // Error dari API server
      return res.status(error.response.status || 500).json({
        success: false,
        message: `Quiz API error: ${error.response.statusText || 'Unknown error'}`,
        status: error.response.status
      });
    }

    // Error lainnya
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching quiz categories.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Konfigurasi untuk Next.js API route
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