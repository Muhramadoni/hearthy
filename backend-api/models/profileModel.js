const { pool } = require('../database/pool');

const profileModel = {
  findByUserId: async (userId) => {
    const { rows } = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1 LIMIT 1', [userId]
    );
    return rows[0] || null;
  },

  create: async (userId) => {
    const { rows } = await pool.query(
      `INSERT INTO profiles (user_id) VALUES ($1)
       RETURNING *`,
      [userId]
    );
    return rows[0];
  },

  upsert: async (userId, data) => {
    const {
      age, gender, height, weight, blood_type,
      activity_level, health_goals, medical_conditions,
      medications, avatar_url, bio,
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO profiles
         (user_id, age, gender, height, weight, blood_type,
          activity_level, health_goals, medical_conditions,
          medications, avatar_url, bio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (user_id) DO UPDATE SET
         age               = COALESCE(EXCLUDED.age,               profiles.age),
         gender            = COALESCE(EXCLUDED.gender,            profiles.gender),
         height            = COALESCE(EXCLUDED.height,            profiles.height),
         weight            = COALESCE(EXCLUDED.weight,            profiles.weight),
         blood_type        = COALESCE(EXCLUDED.blood_type,        profiles.blood_type),
         activity_level    = COALESCE(EXCLUDED.activity_level,    profiles.activity_level),
         health_goals      = COALESCE(EXCLUDED.health_goals,      profiles.health_goals),
         medical_conditions= COALESCE(EXCLUDED.medical_conditions,profiles.medical_conditions),
         medications       = COALESCE(EXCLUDED.medications,       profiles.medications),
         avatar_url        = COALESCE(EXCLUDED.avatar_url,        profiles.avatar_url),
         bio               = COALESCE(EXCLUDED.bio,               profiles.bio),
         updated_at        = NOW()
       RETURNING *`,
      [
        userId, age, gender, height, weight, blood_type,
        activity_level,
        health_goals      ? JSON.stringify(health_goals)       : null,
        medical_conditions? JSON.stringify(medical_conditions) : null,
        medications       ? JSON.stringify(medications)        : null,
        avatar_url, bio,
      ]
    );
    return rows[0];
  },
};

module.exports = profileModel;
