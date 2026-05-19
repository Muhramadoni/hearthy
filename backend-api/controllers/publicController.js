/**
 * @fileoverview Pengontrol Publik (Public Controller).
 * Menangani permintaan untuk data statis publik yang tidak memerlukan autentikasi,
 * seperti daftar artikel kesehatan, tips harian, dan kategori asesmen.
 */
// Static/mock data for public endpoints — replace with DB queries as needed

const ARTICLES = [
  { id: '1', title: '10 Tips for Better Sleep', category: 'sleep', summary: 'Improve your sleep quality with these science-backed tips.', readTime: '5 min', publishedAt: '2024-01-15' },
  { id: '2', title: 'Managing Stress in Modern Life', category: 'mental_health', summary: 'Practical strategies to reduce daily stress and anxiety.', readTime: '7 min', publishedAt: '2024-02-01' },
  { id: '3', title: 'The Power of Morning Exercise', category: 'physical', summary: 'Why working out in the morning can transform your health.', readTime: '4 min', publishedAt: '2024-02-10' },
  { id: '4', title: 'Nutrition Basics for Busy People', category: 'nutrition', summary: 'Simple eating habits that make a big difference.', readTime: '6 min', publishedAt: '2024-03-01' },
  { id: '5', title: 'Mindfulness Meditation for Beginners', category: 'mental_health', summary: 'Start your mindfulness journey with these easy techniques.', readTime: '8 min', publishedAt: '2024-03-15' },
  { id: '6', title: 'Hydration: How Much Water Do You Need?', category: 'nutrition', summary: 'The science behind staying properly hydrated every day.', readTime: '3 min', publishedAt: '2024-04-01' },
];

const TIPS = [
  { id: '1', tip: 'Drink a glass of water first thing in the morning.', category: 'nutrition' },
  { id: '2', tip: 'Take a 5-minute walk every hour if you sit at a desk.', category: 'physical' },
  { id: '3', tip: 'Practice deep breathing for 2 minutes to reduce stress.', category: 'mental_health' },
  { id: '4', tip: 'Avoid screens 30 minutes before bedtime for better sleep.', category: 'sleep' },
  { id: '5', tip: 'Eat at least 5 portions of fruits and vegetables daily.', category: 'nutrition' },
  { id: '6', tip: 'Write 3 things you are grateful for each morning.', category: 'mental_health' },
  { id: '7', tip: 'Aim for 7–9 hours of sleep per night.', category: 'sleep' },
  { id: '8', tip: 'Replace sugary drinks with water or herbal tea.', category: 'nutrition' },
];

const CATEGORIES = [
  { id: 'mental_health', name: 'Mental Health', icon: '🧠', description: 'Emotional well-being, stress, and mindfulness' },
  { id: 'physical',      name: 'Physical Health', icon: '💪', description: 'Exercise, fitness, and body health' },
  { id: 'sleep',         name: 'Sleep',          icon: '😴', description: 'Sleep quality and healthy sleep habits' },
  { id: 'nutrition',     name: 'Nutrition',      icon: '🥗', description: 'Diet, eating habits, and hydration' },
  { id: 'stress',        name: 'Stress',         icon: '🌊', description: 'Stress management and relaxation techniques' },
];

const ASSESSMENT_TYPES = [
  { type: 'mental_health', name: 'Mental Health Check', description: 'Evaluate your emotional well-being (PHQ-9 based)', questions: 9,  icon: '🧠' },
  { type: 'physical',      name: 'Physical Health',     description: 'Assess your physical activity and fitness level',    questions: 8,  icon: '💪' },
  { type: 'sleep',         name: 'Sleep Quality',       description: 'Measure how well you sleep each night',              questions: 7,  icon: '😴' },
  { type: 'nutrition',     name: 'Nutrition Check',     description: 'Review your eating habits and diet quality',         questions: 8,  icon: '🥗' },
  { type: 'stress',        name: 'Stress Level',        description: 'Gauge your current stress and burnout risk',         questions: 10, icon: '🌊' },
];

/**
 * Objek Pengontrol (Controller) Data Publik.
 * Memuat berbagai *handler* untuk _endpoint_ `/api/public`.
 */
const publicController = {
  /**
   * Mengambil daftar artikel kesehatan, opsional dapat disaring berdasarkan kategori.
   * @param {Object} req - Objek permintaan HTTP.
   * @param {Object} res - Objek respons HTTP.
   */
  getArticles: (req, res) => {
    const { category } = req.query;
    const data = category ? ARTICLES.filter(a => a.category === category) : ARTICLES;
    res.json({ status: 'success', data: { articles: data, total: data.length } });
  },

  getArticleById: (req, res) => {
    const article = ARTICLES.find(a => a.id === req.params.id);
    if (!article) return res.status(404).json({ status: 'error', message: 'Article not found.' });
    res.json({ status: 'success', data: { article } });
  },

  getTips: (req, res) => {
    const { category } = req.query;
    const data = category ? TIPS.filter(t => t.category === category) : TIPS;
    res.json({ status: 'success', data: { tips: data, total: data.length } });
  },

  getCategories: (req, res) => {
    res.json({ status: 'success', data: { categories: CATEGORIES } });
  },

  getAssessmentTypes: (req, res) => {
    res.json({ status: 'success', data: { assessmentTypes: ASSESSMENT_TYPES } });
  },
};

module.exports = publicController;
