/**
 * Label Map - Human-readable translations for internal constants
 * Maps backend identifiers, enum values, and status codes to user-facing copy
 */

export const labelMap = {
  // ==================== FILTER OPTIONS ====================
  ALL_CATEGORIES: 'All Categories',
  ALL_LEVELS: 'All Levels',
  
  // ==================== EMPTY STATES ====================
  NO_BADGES_YET: 'No badges yet — complete courses to earn achievements',
  NO_LESSONS_LOADED: 'No lessons loaded',
  NO_LESSONS_PROVISIONED: 'No lessons available',
  NO_SYLLABUS_DATA_DEFINED: 'No syllabus information available',
  NO_EVALUATION_BATTERIES_REGISTERED: 'No quizzes available for this course',
  NO_COMPATIBLE_QUESTIONS_IN_SPECS: 'No questions match your current level',
  NO_VIDEO_MATERIAL_PROVISIONED: 'No video content available',
  NO_COURSES_IN_REGISTRY: 'No courses created yet — create your first course to get started',
  NO_LESSONS_IN_MODULE: 'No lessons in this module',
  
  // ==================== STATUS MESSAGES ====================
  REVIEW_QUEUE_NOMINAL: 'All caught up — nothing due for review right now',
  LEADERBOARD_COMMUNITY_OFFLINE: 'Leaderboard isn\'t active yet',
  SYNCHRONIZING: 'Joining leaderboard...',
  QUERYING_RANK_REGISTRY: 'Loading leaderboard data...',
  
  // ==================== ACTION LABELS ====================
  START_LEARNING: 'Start Learning',
  RESUME_LEARNING: 'Resume Learning',
  ACTIVATE_LEADERBOARD_FEED: 'Join the leaderboard',
  DEACTIVATE: 'Leave leaderboard',
  SUBMIT_FINISH: 'Finish Quiz',
  
  // ==================== UI LABELS ====================
  WEEKLY_LEADERBOARD: 'Weekly Leaderboard',
  WEEKLY_XP: 'Weekly XP',
  TOTAL_XP: 'Total XP',
  YOUR_CURRENT_RANK: 'Your rank',
  STATION_ONLINE: 'Online',
  
  // ==================== GAMIFICATION LABELS ====================
  ACTIVITY_STREAK: 'Activity Streak',
  DAILY_OBJECTIVE: 'Daily Goal',
  RECORD_LONGEST: 'Record',
  OBJECTIVE_SECURED: 'Goal completed',
  ACTIVE_LOGGING: 'In progress',
  XP_BASE: 'XP earned',
  
  // ==================== REVIEW QUEUE LABELS ====================
  DECK_REVIEW: 'Review Queue',
  QUIZ_TARGET: 'Quiz',
  CORRECT_TARGET_ACQUIRED: 'Correct!',
  TARGET_MISSED: 'Incorrect',
  RECORDING: 'Submitting...',
  SUBMIT_VAL: 'Submit',
  COMPLETE_VAL: 'Complete',
  NEXT_CARD: 'Next',
  
  // ==================== LOADING STATES ====================
  RETRIEVING_METRICS: 'Loading...',
  SCANNING_DECK: 'Scanning review queue...',
  LOADING_RECORDS: 'Loading data...',
  
  // ==================== DASHBOARD LABELS ====================
  ENROLLED: 'Enrolled',
  IN_PROGRESS: 'In Progress',
  MASTERED: 'Completed',
  TOTAL_ACTIVE: 'Active courses',
  ACTIVE_WORK: 'In progress',
  COMPLETED: 'Completed',
  TOP_PICK: 'Top recommendation',
  LEARNING_LOG: 'Learning Log',
  ADJUST_PREFERENCES: 'Adjust preferences',
  DESCRIPTION_SPEC: 'Description',
  
  // ==================== TIME LABELS ====================
  DAYS: 'days',
  LESSONS: 'lessons',
  MIN: 'minutes',
  LESSON: 'lesson',
  LESSONS_LOWER: 'lessons',
};

/**
 * Helper function to get human-readable label
 * Falls back to the original key if no mapping exists
 */
export const getLabel = (key) => {
  return labelMap[key] || key;
};

/**
 * Helper function to get label with optional CSS class for uppercase styling
 * This keeps the data clean while allowing visual styling
 */
export const getLabelWithClass = (key, className = '') => {
  const label = getLabel(key);
  return { text: label, className };
};

export default labelMap;
