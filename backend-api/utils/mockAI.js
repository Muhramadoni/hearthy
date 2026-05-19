/**
 * @fileoverview Mock AI & Recommendation Engine.
 * Menyediakan logika simulasi *scoring* dan *recommendation* untuk asesmen kesehatan (selain kardiovaskular).
 * Menggunakan pendekatan berbasis aturan (*rule-based*) sederhana sebagai purwarupa.
 *
 * Catatan: Dapat digantikan oleh model ML/API asli di produksi.
 */

// ── Score Calculators ─────────────────────────────────────────────────────────

const scorers = {
  mental_health: (answers) => {
    // PHQ-9 style: 9 questions, each 0–3 → max 27
    const values = Object.values(answers).map(Number).filter(v => !isNaN(v));
    const score  = values.reduce((a, b) => a + b, 0);
    const max    = 27;
    let severity;
    if      (score <= 4)  severity = 'minimal';
    else if (score <= 9)  severity = 'mild';
    else if (score <= 14) severity = 'moderate';
    else if (score <= 19) severity = 'moderately_severe';
    else                  severity = 'severe';
    return { score, maxScore: max, severity };
  },

  physical: (answers) => {
    const values = Object.values(answers).map(Number).filter(v => !isNaN(v));
    const score  = values.reduce((a, b) => a + b, 0);
    const max    = 40;
    let severity;
    if      (score >= 32) severity = 'excellent';
    else if (score >= 22) severity = 'good';
    else if (score >= 12) severity = 'fair';
    else                  severity = 'poor';
    return { score, maxScore: max, severity };
  },

  sleep: (answers) => {
    const values = Object.values(answers).map(Number).filter(v => !isNaN(v));
    const score  = values.reduce((a, b) => a + b, 0);
    const max    = 21;
    let severity;
    if      (score <= 5)  severity = 'good';
    else if (score <= 10) severity = 'mild_issues';
    else if (score <= 15) severity = 'moderate_issues';
    else                  severity = 'severe_issues';
    return { score, maxScore: max, severity };
  },

  nutrition: (answers) => {
    const values = Object.values(answers).map(Number).filter(v => !isNaN(v));
    const score  = values.reduce((a, b) => a + b, 0);
    const max    = 40;
    let severity;
    if      (score >= 32) severity = 'excellent';
    else if (score >= 22) severity = 'good';
    else if (score >= 12) severity = 'fair';
    else                  severity = 'poor';
    return { score, maxScore: max, severity };
  },

  stress: (answers) => {
    const values = Object.values(answers).map(Number).filter(v => !isNaN(v));
    const score  = values.reduce((a, b) => a + b, 0);
    const max    = 40;
    let severity;
    if      (score <= 10) severity = 'low';
    else if (score <= 20) severity = 'moderate';
    else if (score <= 30) severity = 'high';
    else                  severity = 'very_high';
    return { score, maxScore: max, severity };
  },
};

const calculateScore = (type, answers) => {
  const scorer = scorers[type];
  if (!scorer) return { score: 0, maxScore: 0, severity: 'unknown' };
  return scorer(answers);
};

// ── Recommendation Engine ─────────────────────────────────────────────────────

const RECOMMENDATIONS = {
  mental_health: {
    minimal:           ['Keep up your positive mental habits! 🌟', 'Continue regular self-care activities.', 'Stay connected with friends and family.'],
    mild:              ['Consider journaling your thoughts daily.', 'Practice mindfulness for 10 minutes each day.', 'Talk to someone you trust about your feelings.', 'Ensure you get adequate sleep.'],
    moderate:          ['We recommend speaking with a mental health professional.', 'Practice daily relaxation techniques like deep breathing.', 'Limit alcohol and avoid recreational drugs.', 'Establish a regular daily routine.'],
    moderately_severe: ['Please consult a doctor or therapist as soon as possible.', 'Reach out to a trusted person in your life today.', 'Consider calling a mental health helpline.'],
    severe:            ['Seek immediate professional help — contact a healthcare provider now.', 'You are not alone. Please reach out to a crisis helpline.'],
  },
  physical: {
    excellent: ['Amazing! Keep up your active lifestyle. 💪', 'Try advanced fitness challenges to stay motivated.'],
    good:      ['You\'re doing well! Add 1–2 more active days per week.', 'Include strength training if you haven\'t already.'],
    fair:      ['Aim for 150 minutes of moderate exercise per week.', 'Start with 15-minute daily walks and build up gradually.', 'Reduce sedentary time — stand up every hour.'],
    poor:      ['Consult a doctor before starting a new exercise routine.', 'Begin with gentle activities like walking or stretching.', 'Set a small goal: 10 minutes of movement today.'],
  },
  sleep: {
    good:           ['Great sleep habits! 😴 Keep your consistent schedule.'],
    mild_issues:    ['Try to go to bed and wake up at the same time each day.', 'Avoid caffeine after 2 PM.', 'Create a calming bedtime routine.'],
    moderate_issues:['Limit screen time 1 hour before bed.', 'Keep your bedroom cool and dark.', 'Try relaxation techniques like progressive muscle relaxation.'],
    severe_issues:  ['Consider speaking to a doctor about sleep issues.', 'Sleep disorders like insomnia or sleep apnea may need treatment.'],
  },
  nutrition: {
    excellent: ['Outstanding diet! 🥗 Keep exploring healthy new foods.'],
    good:      ['Your diet is solid. Try adding more variety of vegetables.', 'Consider meal prepping to stay consistent.'],
    fair:      ['Increase fruit and vegetable intake to 5+ servings per day.', 'Reduce processed foods and added sugars.', 'Drink more water — aim for 8 glasses per day.'],
    poor:      ['Start small: replace one unhealthy snack with a fruit today.', 'Consider consulting a nutritionist.', 'Cook more meals at home to control ingredients.'],
  },
  stress: {
    low:       ['You manage stress well! 🌊 Keep your healthy coping strategies.'],
    moderate:  ['Schedule regular breaks throughout your day.', 'Try a hobby or creative outlet to decompress.', 'Practice gratitude journaling.'],
    high:      ['Identify your top stressors and tackle one at a time.', 'Try meditation or yoga for stress relief.', 'Talk to a counselor or trusted person.'],
    very_high: ['Your stress is very high — please seek professional support.', 'Prioritize rest and set firm work-life boundaries.', 'Consider taking time off if possible.'],
  },
};

const AI_INSIGHTS = {
  mental_health: {
    minimal: 'Your mental health appears to be in great shape! Maintaining your current lifestyle is key.',
    mild: 'You\'re experiencing mild symptoms. Small daily changes can make a big difference.',
    moderate: 'Moderate symptoms detected. Professional guidance will be very beneficial at this stage.',
    moderately_severe: 'Your symptoms indicate you would greatly benefit from professional support.',
    severe: 'Your results suggest significant distress. Please reach out to a professional today.',
  },
  physical: {
    excellent: 'Excellent physical health! You\'re a role model for an active lifestyle.',
    good: 'Good fitness level. A few targeted improvements can push you to the next level.',
    fair: 'Your physical activity can be improved. Consistency is the most important factor.',
    poor: 'Your results suggest low physical activity. Even small increases can dramatically improve health.',
  },
  sleep: {
    good: 'Your sleep patterns look healthy. Quality sleep supports everything from mood to immunity.',
    mild_issues: 'Minor sleep disruptions detected. Simple routine changes can restore better sleep.',
    moderate_issues: 'Moderate sleep issues may be affecting your daily energy and focus.',
    severe_issues: 'Significant sleep problems detected. This may impact your overall health significantly.',
  },
  nutrition: {
    excellent: 'Your nutrition is excellent! A well-balanced diet fuels both body and mind.',
    good: 'Good dietary habits. Small tweaks can optimize your nutrition further.',
    fair: 'Your diet has room for improvement. Focus on whole foods and hydration.',
    poor: 'Nutritional gaps detected. Prioritizing diet changes will have a major positive impact.',
  },
  stress: {
    low: 'Your stress levels are well-managed. Keep up your healthy coping strategies.',
    moderate: 'Moderate stress is common but worth addressing before it escalates.',
    high: 'High stress detected. Taking action now can prevent burnout.',
    very_high: 'Very high stress levels detected. This is a serious health concern — please seek help.',
  },
};

const getRecommendationsByScore = (type, score, maxScore, severity) => {
  const recs    = RECOMMENDATIONS[type]?.[severity] || ['Stay consistent with healthy habits. 🌿'];
  const insight = AI_INSIGHTS[type]?.[severity]     || 'Keep tracking your health with Hearthy.';
  return { recommendations: recs, aiInsights: insight };
};

module.exports = { calculateScore, getRecommendationsByScore };
