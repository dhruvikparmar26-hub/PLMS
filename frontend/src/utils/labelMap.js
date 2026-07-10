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
  
  // ==================== QUIZ LABELS ====================
  RETRIEVING_EVALUATION_SPECS: 'Loading quiz data...',
  EVALUATION_RUN_BATTERY: 'Quiz',
  BACK_TO_SYLLABUS: 'Back to Course',
  EVALUATION_SUCCESSFUL: 'Quiz Passed',
  EVALUATION_FAILED: 'Quiz Failed',
  SCORE_PCT: 'Score',
  POINTS_EARNED: 'Points Earned',
  INITIALIZE_RETRY: 'Retry Quiz',
  EVALUATION_PARAMETER_SELECTION: 'Quiz Mode',
  ACTIVATE_ADAPTIVE_ENGINE: 'Enable Adaptive Mode',
  START_EVALUATION: 'Start Quiz',
  CURRENT_DIFFICULTY: 'Difficulty',
  STREAK_STATE: 'Streak',
  TOTAL_ANSWERED: 'Answered',
  CORRECT_VAL: 'Correct',
  INCORRECT_VAL: 'Incorrect',
  SUBMIT_VAL: 'Submit',
  NEXT_CARD: 'Next Question',
  VERIFYING_CODE: 'Verifying',
  VERIFYING_CODE_DISPLAY: 'Verifying code',
  
  // ==================== COURSE DETAIL LABELS ====================
  RETRIEVING_MODULE_MANIFEST: 'Loading course data...',
  COURSE_NOT_FOUND: 'Course not found',
  COURSE_SPECIFICATION: 'Course Details',
  INSTRUCTOR: 'Instructor',
  MODULE_PROGRESS: 'Module Progress',
  PROVISIONING_ENROLLMENT: 'Enrolling...',
  INITIALIZE_ENROLLMENT: 'Enroll Now',
  STUDENT_RATINGS: 'Student Ratings',
  PACE_FORECAST: 'Pace Forecast',
  COURSE_SYLLABUS_INDEX: 'Course Syllabus',
  COURSE_EVALUATION_BATTERY: 'Quizzes',
  MIN_PASS: 'Min Pass',
  EVAL_POINTS: 'points',
  RUN_EVALUATION: 'Take Quiz',
  
  // ==================== LESSON VIEWER LABELS ====================
  STREAMING_CONTENT_BUFFER: 'Loading lesson content...',
  RETURN_TO_SPEC: 'Back to Course',
  INSTRUCTOR_REF: 'Instructor',
  EVALUATION_BATTERIES: 'Quizzes',
  LESSON_STREAM_VIEWER: 'Lesson Viewer',
  ORDER_INDEX: 'Lesson',
  COMPLETING: 'Completing...',
  MARK_AS_COMPLETE: 'Mark as Complete',
  LESSON_NOTES: 'Lesson Notes',
  BACK_TO_SYLLABUS: 'Back to Syllabus',
  NEXT_LESSON: 'Next Lesson',
  RUN_FINAL_EVALUATION: 'Take Quiz',
  
  // ==================== COURSE CATALOG LABELS ====================
  COURSES_INDEX: 'Course Catalog',
  RESET_FILTERS: 'Reset Filters',
  FETCHING_MODULE_MANIFESTS: 'Loading courses...',
  EMPTY_SET: 'No courses found',
  WIREFRAME_PREVIEW: 'Preview',
  OPEN_SPEC: 'View Course',
  
  // ==================== INSTRUCTOR DASHBOARD LABELS ====================
  INITIALIZING_INSTRUCTOR_PORTAL: 'Loading instructor dashboard...',
  ANALYTICS_BOARD: 'Analytics Board',
  COURSES_ACTIVE: 'Active Courses',
  STUDENTS_ENROLLED: 'Students Enrolled',
  AVG_PROGRESS_PCT: 'Avg Progress',
  QUIZ_PASS_RATE: 'Quiz Pass Rate',
  COURSE_REGISTRY_METRICS: 'Course Registry',
  TELEMETRY_STREAM_LOG: 'Activity Log',
  TELEMETRY_LOG_IS_EMPTY: 'No recent activity',
  PROVISIONING: 'Creating...',
  PROVISION_COURSE_SPEC: 'Create Course',
  
  // ==================== COURSE EDITOR LABELS ====================
  LOADING_COURSE_DESIGNER: 'Loading course editor...',
  RETURN_TO_ANALYTICS: 'Back to Analytics',
  PREVIEW_SPEC: 'Preview Course',
  COURSE_SPECIFICATION_METADATA: 'Course Metadata',
  SAVE_METADATA: 'Save Metadata',
  CURRICULUM_MODULE_INDEX: 'Curriculum',
  ADD_LESSON: 'Add Lesson',
  ADD_MODULE: 'Add Module',
  EVALUATION_QUIZ_SETUP: 'Quiz Setup',
  QUESTION_PROMPT: 'Question',
  SAVE_QUIZ_SPEC: 'Save Quiz',
  UPDATE_LESSON: 'Update Lesson',
  PROVISION_LESSON: 'Create Lesson',
  COURSE_TITLE: 'Course Title',
  QUIZ_TITLE: 'Quiz Title',
  ADAPTIVE_TARGET: 'Target',
  WEIGHT: 'Weight',
  CARDS: 'cards',
  
  // ==================== COMPONENT LABELS ====================
  LOADING_THREADS: 'Loading discussions...',
  CRITICAL_SYSTEM_ERROR: 'Critical System Error',
  CRASH_DETECTED: 'Crash Detected',
  REBOOT_SESSION: 'Reload Application',
  FONT_SIZE: 'Font Size',
  HIGH_CONTRAST: 'High Contrast',
  DYSLEXIC_FONT: 'Dyslexic Font',
  REDUCE_MOTION: 'Reduce Motion',
  
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
