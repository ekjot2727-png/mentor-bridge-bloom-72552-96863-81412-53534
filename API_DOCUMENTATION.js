/**
 * API ENDPOINTS DOCUMENTATION
 * MentorBridge Bloom Platform
 * Base URL: http://localhost:3000/api
 * 
 * Total Endpoints: 40+
 * Last Updated: November 14, 2025
 */

// ============================================================================
// AUTHENTICATION MODULE (5 Endpoints)
// ============================================================================

/**
 * REGISTER - Create new user account
 * POST /auth/register
 * 
 * Request Body:
 * {
 *   email: string (required, unique)
 *   password: string (required, min 6 chars)
 *   firstName: string (required)
 *   lastName: string (required)
 *   role: 'student' | 'alumni' | 'admin'
 * }
 * 
 * Response (201):
 * {
 *   message: "User registered successfully",
 *   user: {
 *     id: uuid,
 *     email: string,
 *     role: string
 *   },
 *   accessToken: string (JWT, 24h expiration),
 *   refreshToken: string (JWT, 7d expiration)
 * }
 * 
 * Errors:
 * - 400: Invalid input or email already exists
 * - 500: Server error
 */

/**
 * LOGIN - Authenticate user
 * POST /auth/login
 * 
 * Request Body:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response (200):
 * {
 *   message: "Login successful",
 *   user: {
 *     id: uuid,
 *     email: string,
 *     role: string
 *   },
 *   accessToken: string,
 *   refreshToken: string
 * }
 * 
 * Errors:
 * - 401: Invalid credentials
 * - 404: User not found
 * - 500: Server error
 */

/**
 * REFRESH TOKEN - Extend session
 * POST /auth/refresh
 * 
 * Headers:
 * - Authorization: Bearer <refreshToken>
 * 
 * Response (200):
 * {
 *   accessToken: string,
 *   refreshToken: string
 * }
 * 
 * Errors:
 * - 401: Invalid or expired token
 */

/**
 * LOGOUT - End session
 * POST /auth/logout
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Response (200):
 * {
 *   message: "Logged out successfully"
 * }
 */

/**
 * GET PROFILE - Get current user profile
 * GET /auth/profile
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Response (200):
 * {
 *   data: {
 *     id: uuid,
 *     email: string,
 *     role: string,
 *     profile: { ...user profile data }
 *   }
 * }
 */

// ============================================================================
// PROFILES MODULE (6 Endpoints)
// ============================================================================

/**
 * GET PROFILE - Retrieve user profile by ID or email
 * GET /profiles/:userId
 * 
 * Path Parameters:
 * - userId: string (UUID or email)
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Response (200):
 * {
 *   data: {
 *     id: uuid,
 *     userId: uuid,
 *     firstName: string,
 *     lastName: string,
 *     bio: string,
 *     headline: string,
 *     phoneNumber: string,
 *     profilePhotoUrl: string,
 *     currentCompany: string,
 *     currentPosition: string,
 *     industry: string,
 *     location: string,
 *     city: string,
 *     country: string,
 *     skills: string[],
 *     yearsOfExperience: number,
 *     graduationYear: number,
 *     degreeType: string,
 *     departmentOrCourse: string,
 *     linkedinUrl: string,
 *     githubUrl: string,
 *     portfolioUrl: string,
 *     seekingMentorship: boolean,
 *     offeringMentorship: boolean,
 *     mentorshipTopics: string
 *   }
 * }
 * 
 * Errors:
 * - 404: Profile not found
 * - 401: Unauthorized
 */

/**
 * UPDATE PROFILE - Update user profile
 * PATCH /profiles/:userId
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Request Body: (all fields optional)
 * {
 *   firstName?: string,
 *   lastName?: string,
 *   bio?: string,
 *   headline?: string,
 *   phoneNumber?: string,
 *   currentCompany?: string,
 *   currentPosition?: string,
 *   industry?: string,
 *   location?: string,
 *   city?: string,
 *   country?: string,
 *   skills?: string[],
 *   yearsOfExperience?: number,
 *   graduationYear?: number,
 *   degreeType?: string,
 *   departmentOrCourse?: string,
 *   linkedinUrl?: string,
 *   githubUrl?: string,
 *   portfolioUrl?: string,
 *   seekingMentorship?: boolean,
 *   offeringMentorship?: boolean,
 *   mentorshipTopics?: string
 * }
 * 
 * Response (200):
 * {
 *   data: { ...updated profile }
 * }
 * 
 * Errors:
 * - 400: Invalid data
 * - 401: Unauthorized
 * - 403: Forbidden (can only update own profile)
 */

/**
 * UPLOAD PROFILE PHOTO - Upload or update profile picture
 * POST /profiles/:userId/photo
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * - Content-Type: multipart/form-data
 * 
 * Form Data:
 * - file: File (image, max 5MB)
 * 
 * Response (200):
 * {
 *   data: {
 *     profilePhotoUrl: string (URL to uploaded image)
 *   }
 * }
 * 
 * Errors:
 * - 400: Invalid file or file too large
 * - 401: Unauthorized
 */

/**
 * SEARCH ALUMNI - Search and filter alumni profiles
 * GET /profiles/alumni/search
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Query Parameters (all optional):
 * - company: string (filter by company)
 * - position: string (filter by position)
 * - location: string (filter by location)
 * - skills: string (comma-separated skills)
 * - industry: string (filter by industry)
 * - yearsOfExperience: number (minimum years)
 * - graduationYear: number (specific year)
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * 
 * Response (200):
 * {
 *   data: [
 *     { ...profile object },
 *     ...
 *   ],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     pages: number
 *   }
 * }
 * 
 * Example:
 * GET /profiles/alumni/search?company=Google&position=Engineer&limit=10
 */

/**
 * GET ALUMNI DIRECTORY - Get paginated list of alumni
 * GET /profiles/alumni/directory
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * 
 * Response (200):
 * {
 *   data: [ ...profiles ],
 *   pagination: { page, limit, total, pages }
 * }
 */

/**
 * BULK UPLOAD ALUMNI - Import alumni data from CSV/Excel
 * POST /profiles/bulk-upload
 * 
 * Headers:
 * - Authorization: Bearer <accessToken> (admin only)
 * - Content-Type: multipart/form-data
 * 
 * Form Data:
 * - file: File (.csv or .xlsx)
 * 
 * CSV Format (comma-separated):
 * firstName, lastName, email, company, position, location, skills, graduationYear, industry
 * 
 * Response (200):
 * {
 *   data: {
 *     imported: number,
 *     failed: number,
 *     errors: string[]
 *   }
 * }
 * 
 * Errors:
 * - 400: Invalid file format
 * - 401: Unauthorized
 * - 403: Admin only
 */

// ============================================================================
// MESSAGES MODULE (4 Endpoints)
// ============================================================================

/**
 * SEND MESSAGE - Send a message to another user
 * POST /messages
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Request Body:
 * {
 *   receiverId: string (UUID or email of recipient),
 *   content: string (message text, required)
 * }
 * 
 * Response (201):
 * {
 *   data: {
 *     id: uuid,
 *     senderId: uuid,
 *     senderEmail: string,
 *     receiverId: uuid,
 *     content: string,
 *     status: 'sent' | 'delivered' | 'read',
 *     createdAt: timestamp,
 *     updatedAt: timestamp
 *   }
 * }
 * 
 * Errors:
 * - 400: Invalid receiver ID or empty content
 * - 401: Unauthorized
 * - 404: Receiver not found
 */

/**
 * GET CONVERSATION - Get message history with specific user
 * GET /messages/:userId
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Path Parameters:
 * - userId: string (UUID or email of other party)
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 50)
 * 
 * Response (200):
 * {
 *   data: [
 *     {
 *       id: uuid,
 *       senderId: uuid,
 *       receiverId: uuid,
 *       content: string,
 *       status: string,
 *       createdAt: timestamp
 *     },
 *     ...
 *   ]
 * }
 * 
 * Errors:
 * - 401: Unauthorized
 * - 404: User not found
 */

/**
 * GET ALL CONVERSATIONS - List all conversations for current user
 * GET /messages
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * 
 * Response (200):
 * {
 *   data: [
 *     {
 *       userId: uuid,
 *       email: string,
 *       firstName: string,
 *       lastName: string,
 *       lastMessage: string,
 *       lastMessageTime: timestamp,
 *       unreadCount: number
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * MARK MESSAGE AS READ - Update message status to read
 * PATCH /messages/:messageId/read
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Response (200):
 * {
 *   data: { ...updated message }
 * }
 */

// ============================================================================
// CONNECTIONS MODULE (5 Endpoints)
// ============================================================================

/**
 * SEND CONNECTION REQUEST - Request to connect with another user
 * POST /connections
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Request Body:
 * {
 *   receiverId: string (UUID or email),
 *   message?: string (optional intro message)
 * }
 * 
 * Response (201):
 * {
 *   data: {
 *     id: uuid,
 *     userId: uuid,
 *     connectedUserId: uuid,
 *     status: 'pending',
 *     message: string,
 *     createdAt: timestamp
 *   }
 * }
 * 
 * Errors:
 * - 400: Invalid receiver ID
 * - 401: Unauthorized
 * - 409: Connection already exists
 */

/**
 * RESPOND TO CONNECTION - Accept or reject connection request
 * PATCH /connections/:connectionId
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Request Body:
 * {
 *   accepted: boolean (true to accept, false to reject)
 * }
 * 
 * Response (200):
 * {
 *   data: {
 *     id: uuid,
 *     status: 'accepted' | 'rejected'
 *   }
 * }
 */

/**
 * GET ALL CONNECTIONS - List all accepted connections
 * GET /connections
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * 
 * Response (200):
 * {
 *   data: [
 *     {
 *       id: uuid,
 *       connectedUserId: uuid,
 *       connectedUserEmail: string,
 *       connectedUserFirstName: string,
 *       connectedUserLastName: string,
 *       status: 'accepted'
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * GET PENDING REQUESTS - List pending connection requests
 * GET /connections/pending
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Query Parameters:
 * - page: number
 * - limit: number
 * 
 * Response (200):
 * {
 *   data: [
 *     {
 *       id: uuid,
 *       connectedUserId: uuid,
 *       connectedUserEmail: string,
 *       connectedUserFirstName: string,
 *       status: 'pending',
 *       message?: string,
 *       createdAt: timestamp
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * REMOVE CONNECTION - Delete or block a connection
 * DELETE /connections/:connectionId
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Response (200):
 * {
 *   message: "Connection removed"
 * }
 */

// ============================================================================
// ANALYTICS MODULE (5 Endpoints) - ADMIN ONLY
// ============================================================================

/**
 * GET USER STATISTICS - Get user-related analytics
 * GET /analytics/users
 * 
 * Headers:
 * - Authorization: Bearer <accessToken> (admin required)
 * 
 * Query Parameters:
 * - startDate?: string (ISO date)
 * - endDate?: string (ISO date)
 * 
 * Response (200):
 * {
 *   data: {
 *     totalUsers: number,
 *     totalStudents: number,
 *     totalAlumni: number,
 *     newUsersThisMonth: number,
 *     activeUsers: number
 *   }
 * }
 * 
 * Errors:
 * - 403: Admin access required
 */

/**
 * GET ENGAGEMENT METRICS - Get platform engagement data
 * GET /analytics/engagement
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Query Parameters:
 * - startDate?: string
 * - endDate?: string
 * 
 * Response (200):
 * {
 *   data: [
 *     {
 *       date: string,
 *       messages: number,
 *       connections: number,
 *       logins: number
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * GET PLATFORM HEALTH - System and platform statistics
 * GET /analytics/platform
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Response (200):
 * {
 *   data: {
 *     status: 'healthy' | 'warning' | 'error',
 *     uptime: number,
 *     responseTime: number,
 *     activeConnections: number,
 *     databaseStatus: string
 *   }
 * }
 */

/**
 * GET DASHBOARD SUMMARY - Combined analytics for dashboard
 * GET /analytics/dashboard
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Query Parameters:
 * - startDate?: string
 * - endDate?: string
 * 
 * Response (200):
 * {
 *   data: {
 *     stats: { ...user stats },
 *     engagement: [ ...engagement data ],
 *     health: { ...platform health }
 *   }
 * }
 */

/**
 * EXPORT ANALYTICS - Export analytics data
 * POST /analytics/export
 * 
 * Headers:
 * - Authorization: Bearer <accessToken>
 * 
 * Request Body:
 * {
 *   format: 'csv' | 'pdf',
 *   filters?: {
 *     startDate?: string,
 *     endDate?: string,
 *     role?: string
 *   }
 * }
 * 
 * Response (200): File blob
 * 
 * Note: Response is a file stream, save as analytics-report.csv or .pdf
 */

// ============================================================================
// COMMON RESPONSE PATTERNS
// ============================================================================

/**
 * Success Response Format:
 * {
 *   message?: string,
 *   data: any,
 *   timestamp?: string
 * }
 * 
 * Error Response Format:
 * {
 *   statusCode: number,
 *   message: string,
 *   error: string
 * }
 * 
 * Pagination Format:
 * {
 *   page: number,
 *   limit: number,
 *   total: number,
 *   pages: number
 * }
 */

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

/**
 * 200 OK - Request successful
 * 201 Created - Resource created
 * 204 No Content - Successful deletion
 * 400 Bad Request - Invalid input
 * 401 Unauthorized - Missing/invalid token
 * 403 Forbidden - Insufficient permissions
 * 404 Not Found - Resource not found
 * 409 Conflict - Resource already exists
 * 500 Internal Server Error - Server error
 */

// ============================================================================
// AUTHENTICATION HEADERS
// ============================================================================

/**
 * All protected endpoints require:
 * Header: Authorization: Bearer <accessToken>
 * 
 * Where <accessToken> is the JWT token received from login/register
 * 
 * Token Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Expiration: 24 hours
 * Refresh: Use refreshToken to get new accessToken
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Login and Store Token
 * 
 * POST /auth/login
 * Content-Type: application/json
 * 
 * {
 *   "email": "student@mentorbridge.com",
 *   "password": "student@123"
 * }
 * 
 * Response:
 * {
 *   "message": "Login successful",
 *   "user": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "email": "student@mentorbridge.com",
 *     "role": "student"
 *   },
 *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Store accessToken and use in headers:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * Example: Get Profile with Auth
 * 
 * GET /profiles/student@mentorbridge.com
 * Authorization: Bearer <accessToken>
 * 
 * Response:
 * {
 *   "data": {
 *     "id": "...",
 *     "firstName": "John",
 *     "lastName": "Student",
 *     "email": "student@mentorbridge.com",
 *     "skills": ["JavaScript", "React", "Node.js"],
 *     "currentCompany": "Tech Corp",
 *     "currentPosition": "Junior Developer"
 *   }
 * }
 */

/**
 * Example: Send Message
 * 
 * POST /messages
 * Authorization: Bearer <accessToken>
 * Content-Type: application/json
 * 
 * {
 *   "receiverId": "alumni@mentorbridge.com",
 *   "content": "Hi! I would like to chat with you about career growth."
 * }
 * 
 * Response:
 * {
 *   "data": {
 *     "id": "...",
 *     "senderId": "...",
 *     "receiverId": "...",
 *     "content": "Hi! I would like to chat with you about career growth.",
 *     "status": "sent",
 *     "createdAt": "2025-11-14T10:30:00Z"
 *   }
 * }
 */

module.exports = { API_BASE: 'http://localhost:3000/api' };
