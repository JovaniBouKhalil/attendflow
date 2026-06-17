/**
 * Data Models
 * Defines the core data structures for Students, Courses, Attendance Records, and Enrollments
 * Requirements: 1.1, 2.1, 3.7, 9.1-9.15
 */

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validate student name
 * Must contain only letters, spaces, hyphens, and apostrophes
 * Must be between 1 and 100 characters
 * Requirements: 9.1, 9.2, 9.14, 9.15
 * 
 * @param {string} name - Student name to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateStudentName(name) {
    // Trim whitespace (Requirement 9.15)
    const trimmedName = trimWhitespace(name);
    
    // Check if empty (Requirement 9.14)
    if (isEmpty(trimmedName)) {
        return {
            valid: false,
            error: 'Student name is required and cannot be empty'
        };
    }
    
    // Check length constraints (Requirement 9.2)
    if (trimmedName.length < 1 || trimmedName.length > 100) {
        return {
            valid: false,
            error: 'Student name must be between 1 and 100 characters'
        };
    }
    
    // Check character pattern (Requirement 9.1)
    // Must contain only letters (including accented/international), spaces, hyphens, and apostrophes
    // Using Unicode property escapes to support all letter characters
    const namePattern = /^[\p{L}\s'-]+$/u;
    if (!namePattern.test(trimmedName)) {
        return {
            valid: false,
            error: 'Student name must contain only letters, spaces, hyphens, and apostrophes'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate student ID
 * Must be between 1 and 50 characters
 * Requirements: 9.3, 9.14, 9.15
 * 
 * @param {string} studentId - Student ID to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateStudentId(studentId) {
    // Trim whitespace (Requirement 9.15)
    const trimmedId = trimWhitespace(studentId);
    
    // Check if empty (Requirement 9.14)
    if (isEmpty(trimmedId)) {
        return {
            valid: false,
            error: 'Student ID is required and cannot be empty'
        };
    }
    
    // Check length constraints (Requirement 9.3)
    if (trimmedId.length < 1 || trimmedId.length > 50) {
        return {
            valid: false,
            error: 'Student ID must be between 1 and 50 characters'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate email format
 * Must be a valid email address
 * Requirements: 1.1, 9.15
 * 
 * @param {string} email - Email address to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateEmail(email) {
    // Trim whitespace (Requirement 9.15)
    const trimmedEmail = trimWhitespace(email);
    
    // Check if empty
    if (isEmpty(trimmedEmail)) {
        return {
            valid: false,
            error: 'Email address is required and cannot be empty'
        };
    }
    
    // Basic email format validation
    // Matches: user@domain.com, user.name@domain.co.uk, etc.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
        return {
            valid: false,
            error: 'Email address must be in valid format (e.g., user@example.com)'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate course name
 * Must be between 1 and 200 characters
 * Requirements: 9.5, 9.14, 9.15
 * 
 * @param {string} name - Course name to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateCourseName(name) {
    // Trim whitespace (Requirement 9.15)
    const trimmedName = trimWhitespace(name);
    
    // Check if empty (Requirement 9.14)
    if (isEmpty(trimmedName)) {
        return {
            valid: false,
            error: 'Course name is required and cannot be empty'
        };
    }
    
    // Check length constraints (Requirement 9.5)
    if (trimmedName.length < 1 || trimmedName.length > 200) {
        return {
            valid: false,
            error: 'Course name must be between 1 and 200 characters'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate course code
 * Must be between 1 and 20 characters
 * Requirements: 9.6, 9.14, 9.15
 * 
 * @param {string} code - Course code to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateCourseCode(code) {
    // Trim whitespace (Requirement 9.15)
    const trimmedCode = trimWhitespace(code);
    
    // Check if empty (Requirement 9.14)
    if (isEmpty(trimmedCode)) {
        return {
            valid: false,
            error: 'Course code is required and cannot be empty'
        };
    }
    
    // Check length constraints (Requirement 9.6)
    if (trimmedCode.length < 1 || trimmedCode.length > 20) {
        return {
            valid: false,
            error: 'Course code must be between 1 and 20 characters'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate course description
 * Must be between 0 and 1000 characters (optional field)
 * Requirements: 9.8, 9.15
 * 
 * @param {string} description - Course description to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateCourseDescription(description) {
    // Trim whitespace (Requirement 9.15)
    const trimmedDescription = trimWhitespace(description);
    
    // Description is optional, empty is valid
    if (isEmpty(trimmedDescription)) {
        return { valid: true, error: null };
    }
    
    // Check length constraints (Requirement 9.8)
    if (trimmedDescription.length > 1000) {
        return {
            valid: false,
            error: 'Course description must not exceed 1000 characters'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate attendance date format
 * Must be in YYYY-MM-DD format
 * Must not be in the future
 * Requirements: 9.9, 3.11, 9.15
 * 
 * @param {string} dateString - Date string to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateAttendanceDate(dateString) {
    // Trim whitespace (Requirement 9.15)
    const trimmedDate = trimWhitespace(dateString);
    
    // Check if empty
    if (isEmpty(trimmedDate)) {
        return {
            valid: false,
            error: 'Date is required and cannot be empty'
        };
    }
    
    // Check date format YYYY-MM-DD (Requirement 9.9)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(trimmedDate)) {
        return {
            valid: false,
            error: 'Date must be in YYYY-MM-DD format'
        };
    }
    
    // Validate that it's a real date (e.g., not 2024-13-45)
    const [year, month, day] = trimmedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
        return {
            valid: false,
            error: 'Date is not a valid calendar date'
        };
    }
    
    // Check if date is in the future (Requirement 3.11)
    if (isFutureDate(trimmedDate)) {
        return {
            valid: false,
            error: 'Future dates are not allowed for attendance recording'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate attendance status
 * Must be either 'present' or 'absent'
 * Requirements: 3.7, 4.12
 * 
 * @param {string} status - Attendance status to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateAttendanceStatus(status) {
    // Check if empty
    if (isEmpty(status)) {
        return {
            valid: false,
            error: 'Attendance status is required'
        };
    }
    
    // Check if status is valid enum value
    const validStatuses = ['present', 'absent'];
    if (!validStatuses.includes(status)) {
        return {
            valid: false,
            error: 'Attendance status must be either "present" or "absent"'
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate that student ID exists in the system
 * Requirements: 9.10
 * 
 * @param {Array<Student>} students - Array of existing students
 * @param {string} studentId - Student ID to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateStudentExists(students, studentId) {
    const trimmedId = trimWhitespace(studentId);
    
    if (isEmpty(trimmedId)) {
        return {
            valid: false,
            error: 'Student ID is required'
        };
    }
    
    const student = findStudentByStudentId(students, trimmedId);
    
    if (!student) {
        return {
            valid: false,
            error: `Student with ID "${trimmedId}" does not exist`
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate that course code exists in the system
 * Requirements: 9.10
 * 
 * @param {Array<Course>} courses - Array of existing courses
 * @param {string} courseCode - Course code to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateCourseExists(courses, courseCode) {
    const trimmedCode = trimWhitespace(courseCode);
    
    if (isEmpty(trimmedCode)) {
        return {
            valid: false,
            error: 'Course code is required'
        };
    }
    
    const course = findCourseByCourseCode(courses, trimmedCode);
    
    if (!course) {
        return {
            valid: false,
            error: `Course with code "${trimmedCode}" does not exist`
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate student uniqueness
 * Checks if student ID is already taken by another student
 * Requirements: 9.4
 * 
 * @param {Array<Student>} students - Array of existing students
 * @param {string} studentId - Student ID to check
 * @param {string} excludeId - Internal ID to exclude (for updates)
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateStudentUniqueness(students, studentId, excludeId = null) {
    const trimmedId = trimWhitespace(studentId);
    
    if (isStudentIdTaken(students, trimmedId, excludeId)) {
        return {
            valid: false,
            error: `Student ID "${trimmedId}" is already taken`
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate course uniqueness
 * Checks if course code is already taken by another course
 * Requirements: 9.7
 * 
 * @param {Array<Course>} courses - Array of existing courses
 * @param {string} courseCode - Course code to check
 * @param {string} excludeId - Internal ID to exclude (for updates)
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateCourseUniqueness(courses, courseCode, excludeId = null) {
    const trimmedCode = trimWhitespace(courseCode);
    
    if (isCourseCodeTaken(courses, trimmedCode, excludeId)) {
        return {
            valid: false,
            error: `Course code "${trimmedCode}" is already taken`
        };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate complete student data
 * Performs all student validations at once
 * Requirements: 1.1, 1.3, 9.1, 9.2, 9.3, 9.4, 9.14, 9.15
 * 
 * @param {Object} studentData - Student data to validate
 * @param {Array<Student>} existingStudents - Array of existing students
 * @param {string} excludeId - Internal ID to exclude (for updates)
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateStudentData(studentData, existingStudents = [], excludeId = null) {
    const errors = [];
    
    // Validate name
    const nameValidation = validateStudentName(studentData.name);
    if (!nameValidation.valid) {
        errors.push({ field: 'name', message: nameValidation.error });
    }
    
    // Validate student ID
    const idValidation = validateStudentId(studentData.studentId);
    if (!idValidation.valid) {
        errors.push({ field: 'studentId', message: idValidation.error });
    } else {
        // Check uniqueness only if format is valid
        const uniquenessValidation = validateStudentUniqueness(
            existingStudents, 
            studentData.studentId, 
            excludeId
        );
        if (!uniquenessValidation.valid) {
            errors.push({ field: 'studentId', message: uniquenessValidation.error });
        }
    }
    
    // Validate email
    const emailValidation = validateEmail(studentData.email);
    if (!emailValidation.valid) {
        errors.push({ field: 'email', message: emailValidation.error });
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate complete course data
 * Performs all course validations at once
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 9.5, 9.6, 9.7, 9.8, 9.14, 9.15
 * 
 * @param {Object} courseData - Course data to validate
 * @param {Array<Course>} existingCourses - Array of existing courses
 * @param {string} excludeId - Internal ID to exclude (for updates)
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateCourseData(courseData, existingCourses = [], excludeId = null) {
    const errors = [];
    
    // Validate course name
    const nameValidation = validateCourseName(courseData.name);
    if (!nameValidation.valid) {
        errors.push({ field: 'name', message: nameValidation.error });
    }
    
    // Validate course code
    const codeValidation = validateCourseCode(courseData.courseCode);
    if (!codeValidation.valid) {
        errors.push({ field: 'courseCode', message: codeValidation.error });
    } else {
        // Check uniqueness only if format is valid
        const uniquenessValidation = validateCourseUniqueness(
            existingCourses, 
            courseData.courseCode, 
            excludeId
        );
        if (!uniquenessValidation.valid) {
            errors.push({ field: 'courseCode', message: uniquenessValidation.error });
        }
    }
    
    // Validate description (optional)
    const descriptionValidation = validateCourseDescription(courseData.description || '');
    if (!descriptionValidation.valid) {
        errors.push({ field: 'description', message: descriptionValidation.error });
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate complete attendance record data
 * Performs all attendance validations at once
 * Requirements: 3.7, 3.11, 9.9, 9.10
 * 
 * @param {Object} attendanceData - Attendance data to validate
 * @param {Array<Student>} students - Array of existing students
 * @param {Array<Course>} courses - Array of existing courses
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateAttendanceData(attendanceData, students = [], courses = []) {
    const errors = [];
    
    // Validate student exists
    const studentValidation = validateStudentExists(students, attendanceData.studentId);
    if (!studentValidation.valid) {
        errors.push({ field: 'studentId', message: studentValidation.error });
    }
    
    // Validate course exists
    const courseValidation = validateCourseExists(courses, attendanceData.courseCode);
    if (!courseValidation.valid) {
        errors.push({ field: 'courseCode', message: courseValidation.error });
    }
    
    // Validate date
    const dateValidation = validateAttendanceDate(attendanceData.date);
    if (!dateValidation.valid) {
        errors.push({ field: 'date', message: dateValidation.error });
    }
    
    // Validate status
    const statusValidation = validateAttendanceStatus(attendanceData.status);
    if (!statusValidation.valid) {
        errors.push({ field: 'status', message: statusValidation.error });
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ========================================
// DATA MODELS
// ========================================

/**
 * Student Model
 * Represents a student in the system
 * Requirements: 1.1, 9.1, 9.2, 9.3, 9.14, 9.15
 */
class Student {
    /**
     * Create a new Student
     * @param {string} studentId - Unique student identifier (1-50 chars, immutable after creation)
     * @param {string} name - Student name (1-100 chars, letters/spaces/hyphens/apostrophes only)
     * @param {string} email - Student email address (valid email format)
     */
    constructor(studentId, name, email) {
        // Internal UUID (immutable, generated once)
        this.id = generateUUID();
        
        // Student ID (1-50 chars, unique, immutable after creation)
        this.studentId = trimWhitespace(studentId);
        
        // Student name (1-100 chars, letters/spaces/hyphens/apostrophes only)
        this.name = trimWhitespace(name);
        
        // Student email (valid email format)
        this.email = trimWhitespace(email);
        
        // Timestamps
        this.createdAt = getCurrentTimestamp();
        this.updatedAt = getCurrentTimestamp();
    }
    
    /**
     * Update student information
     * Note: studentId cannot be modified after creation
     * @param {Object} updates - Object containing fields to update (name, email)
     */
    updateFields(updates) {
        if (updates.name !== undefined) {
            this.name = trimWhitespace(updates.name);
        }
        
        if (updates.email !== undefined) {
            this.email = trimWhitespace(updates.email);
        }
        
        // Update timestamp
        this.updatedAt = getCurrentTimestamp();
    }
    
    /**
     * Convert student to plain object for storage
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            studentId: this.studentId,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    
    /**
     * Create Student instance from stored data
     * @param {Object} data - Plain object from storage
     * @returns {Student} Student instance
     */
    static fromJSON(data) {
        const student = new Student(data.studentId, data.name, data.email);
        
        // Restore original timestamps and ID
        student.id = data.id;
        student.createdAt = data.createdAt;
        student.updatedAt = data.updatedAt;
        
        return student;
    }
}

/**
 * Course Model
 * Represents a course in the system
 * Requirements: 2.1, 9.5, 9.6, 9.7, 9.8, 9.14, 9.15
 */
class Course {
    /**
     * Create a new Course
     * @param {string} courseCode - Unique course code (1-20 chars, immutable after creation)
     * @param {string} name - Course name (1-200 chars)
     * @param {string} description - Course description (0-1000 chars, optional)
     */
    constructor(courseCode, name, description = '') {
        // Internal UUID (immutable, generated once)
        this.id = generateUUID();
        
        // Course code (1-20 chars, unique, immutable after creation)
        this.courseCode = trimWhitespace(courseCode);
        
        // Course name (1-200 chars)
        this.name = trimWhitespace(name);
        
        // Course description (0-1000 chars, optional)
        this.description = trimWhitespace(description);
        
        // Timestamps
        this.createdAt = getCurrentTimestamp();
        this.updatedAt = getCurrentTimestamp();
    }
    
    /**
     * Update course information
     * Note: courseCode cannot be modified after creation
     * @param {Object} updates - Object containing fields to update (name, description)
     */
    updateFields(updates) {
        if (updates.name !== undefined) {
            this.name = trimWhitespace(updates.name);
        }
        
        if (updates.description !== undefined) {
            this.description = trimWhitespace(updates.description);
        }
        
        // Update timestamp
        this.updatedAt = getCurrentTimestamp();
    }
    
    /**
     * Convert course to plain object for storage
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            courseCode: this.courseCode,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    
    /**
     * Create Course instance from stored data
     * @param {Object} data - Plain object from storage
     * @returns {Course} Course instance
     */
    static fromJSON(data) {
        const course = new Course(data.courseCode, data.name, data.description);
        
        // Restore original timestamps and ID
        course.id = data.id;
        course.createdAt = data.createdAt;
        course.updatedAt = data.updatedAt;
        
        return course;
    }
}

/**
 * AttendanceRecord Model
 * Represents a single attendance record for a student in a course on a specific date
 * Requirements: 3.7, 9.9, 9.10, 9.14
 */
class AttendanceRecord {
    /**
     * Create a new AttendanceRecord
     * @param {string} studentId - Student ID (foreign key reference)
     * @param {string} courseCode - Course code (foreign key reference)
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} status - Attendance status ('present' or 'absent')
     */
    constructor(studentId, courseCode, date, status) {
        // Internal UUID (immutable, generated once)
        this.id = generateUUID();
        
        // Foreign key references
        this.studentId = trimWhitespace(studentId);
        this.courseCode = trimWhitespace(courseCode);
        
        // Date in YYYY-MM-DD format (cannot be in the future)
        this.date = trimWhitespace(date);
        
        // Attendance status: 'present' or 'absent'
        this.status = status;
        
        // Timestamps
        this.createdAt = getCurrentTimestamp();
        this.updatedAt = getCurrentTimestamp();
    }
    
    /**
     * Update attendance status
     * @param {string} newStatus - New attendance status ('present' or 'absent')
     */
    updateStatus(newStatus) {
        this.status = newStatus;
        this.updatedAt = getCurrentTimestamp();
    }
    
    /**
     * Convert attendance record to plain object for storage
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            studentId: this.studentId,
            courseCode: this.courseCode,
            date: this.date,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    
    /**
     * Create AttendanceRecord instance from stored data
     * @param {Object} data - Plain object from storage
     * @returns {AttendanceRecord} AttendanceRecord instance
     */
    static fromJSON(data) {
        const record = new AttendanceRecord(
            data.studentId,
            data.courseCode,
            data.date,
            data.status
        );
        
        // Restore original timestamps and ID
        record.id = data.id;
        record.createdAt = data.createdAt;
        record.updatedAt = data.updatedAt;
        
        return record;
    }
}

/**
 * Enrollment Model
 * Represents the many-to-many relationship between students and courses
 * Requirements: 3.2, 3.3
 */
class Enrollment {
    /**
     * Create a new Enrollment
     * @param {string} studentId - Student ID (foreign key reference)
     * @param {string} courseCode - Course code (foreign key reference)
     */
    constructor(studentId, courseCode) {
        // Foreign key references
        this.studentId = trimWhitespace(studentId);
        this.courseCode = trimWhitespace(courseCode);
        
        // Timestamp for enrollment date
        this.enrolledAt = getCurrentTimestamp();
    }
    
    /**
     * Convert enrollment to plain object for storage
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            studentId: this.studentId,
            courseCode: this.courseCode,
            enrolledAt: this.enrolledAt
        };
    }
    
    /**
     * Create Enrollment instance from stored data
     * @param {Object} data - Plain object from storage
     * @returns {Enrollment} Enrollment instance
     */
    static fromJSON(data) {
        const enrollment = new Enrollment(data.studentId, data.courseCode);
        
        // Restore original timestamp
        enrollment.enrolledAt = data.enrolledAt;
        
        return enrollment;
    }
    
    /**
     * Check if this enrollment matches the given student and course
     * @param {string} studentId - Student ID to check
     * @param {string} courseCode - Course code to check
     * @returns {boolean} True if matches
     */
    matches(studentId, courseCode) {
        return this.studentId === studentId && this.courseCode === courseCode;
    }
}

/**
 * Helper function to create a composite key for unique constraints
 * Used for checking uniqueness of (studentId, courseCode, date) combinations
 * @param {string} studentId - Student ID
 * @param {string} courseCode - Course code
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 * @returns {string} Composite key
 */
function createCompositeKey(studentId, courseCode, date = null) {
    if (date) {
        return `${studentId}|${courseCode}|${date}`;
    }
    return `${studentId}|${courseCode}`;
}

/**
 * Helper function to check if a student ID is already taken
 * @param {Array<Student>} students - Array of existing students
 * @param {string} studentId - Student ID to check
 * @param {string} excludeId - Optional internal ID to exclude (for updates)
 * @returns {boolean} True if student ID already exists
 */
function isStudentIdTaken(students, studentId, excludeId = null) {
    return students.some(student => 
        student.studentId === studentId && student.id !== excludeId
    );
}

/**
 * Helper function to check if a course code is already taken
 * @param {Array<Course>} courses - Array of existing courses
 * @param {string} courseCode - Course code to check
 * @param {string} excludeId - Optional internal ID to exclude (for updates)
 * @returns {boolean} True if course code already exists
 */
function isCourseCodeTaken(courses, courseCode, excludeId = null) {
    return courses.some(course => 
        course.courseCode === courseCode && course.id !== excludeId
    );
}

/**
 * Helper function to find a student by student ID
 * @param {Array<Student>} students - Array of students
 * @param {string} studentId - Student ID to find
 * @returns {Student|null} Student instance or null if not found
 */
function findStudentByStudentId(students, studentId) {
    return students.find(student => student.studentId === studentId) || null;
}

/**
 * Helper function to find a course by course code
 * @param {Array<Course>} courses - Array of courses
 * @param {string} courseCode - Course code to find
 * @returns {Course|null} Course instance or null if not found
 */
function findCourseByCourseCode(courses, courseCode) {
    return courses.find(course => course.courseCode === courseCode) || null;
}

/**
 * Helper function to find an enrollment
 * @param {Array<Enrollment>} enrollments - Array of enrollments
 * @param {string} studentId - Student ID
 * @param {string} courseCode - Course code
 * @returns {Enrollment|null} Enrollment instance or null if not found
 */
function findEnrollment(enrollments, studentId, courseCode) {
    // Compare fields directly: items from Local Storage are plain objects,
    // not Enrollment instances, so they have no matches() method.
    return enrollments.find(enrollment =>
        enrollment.studentId === studentId &&
        enrollment.courseCode === courseCode
    ) || null;
}

/**
 * Helper function to find an attendance record
 * @param {Array<AttendanceRecord>} records - Array of attendance records
 * @param {string} studentId - Student ID
 * @param {string} courseCode - Course code
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {AttendanceRecord|null} AttendanceRecord instance or null if not found
 */
function findAttendanceRecord(records, studentId, courseCode, date) {
    return records.find(record => 
        record.studentId === studentId && 
        record.courseCode === courseCode && 
        record.date === date
    ) || null;
}
