const MasteryScore = require('../models/MasteryScore');

/**
 * Updates the mastery scores for a set of concepts based on user performance.
 * Applies temporal decay first, then computes the new score using Exponential Moving Average.
 *
 * @param {string} userId - The user's ObjectId
 * @param {Array<string>} conceptIds - Array of Concept ObjectIds to update
 * @param {number} performanceScore - The normalized performance score (0.0 to 1.0)
 * @param {number} alpha - The learning rate / weight constant (default: 0.2)
 */
const updateConceptMastery = async (userId, conceptIds, performanceScore, alpha = 0.2) => {
  if (!conceptIds || conceptIds.length === 0) return;

  const now = new Date();

  for (const conceptId of conceptIds) {
    try {
      // Find or initialize mastery score
      let mastery = await MasteryScore.findOne({ userId, conceptId });
      if (!mastery) {
        mastery = new MasteryScore({
          userId,
          conceptId,
          score: 0,
          lastAssessed: now,
        });
      }

      // 1. Calculate decay since last assessment
      const timeDiff = now - new Date(mastery.lastAssessed);
      const daysElapsed = Math.max(0, timeDiff / (1000 * 60 * 60 * 24));
      const decay = daysElapsed * (mastery.decayRate || 0.01);
      
      const decayedScore = Math.max(0, mastery.score - decay);

      // 2. Exponential Moving Average calculation
      const newScore = decayedScore * (1 - alpha) + performanceScore * alpha;
      
      // Update mastery record
      mastery.score = Math.min(1, Math.max(0, newScore));
      mastery.lastAssessed = now;

      await mastery.save();
    } catch (err) {
      console.error(`[MasteryUpdater] Failed to update concept ${conceptId} for user ${userId}:`, err.message);
    }
  }
};

module.exports = { updateConceptMastery };
