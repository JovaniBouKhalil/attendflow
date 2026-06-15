/**
 * Data Models
 * Defines the core data structures for Students, Courses, Attendance Records, and Enrollments
 * Requirements: 1.1, 2.1, 3.7, 9.1-9.15
 */

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
    return enrollments.find(enrollment => 
        enrollment.matches(studentId, courseCode)
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
