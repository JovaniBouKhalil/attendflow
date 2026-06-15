/**
 * Course Management Module
 * Handles all CRUD operations for courses and enrollment management
 * Requirements: 2.1-2.21, 9.7, 9.13
 */

/**
 * Add a new course to the system
 * Requirements: 2.1, 2.2-2.8, 9.7
 *
 * @param {string} name        - Course name (1-200 chars)
 * @param {string} courseCode  - Course code (1-20 chars, must be unique)
 * @param {string} description - Course description (0-1000 chars, optional)
 * @returns {Object} { success, course, errors }
 */
function addCourse(name, courseCode, description = '') {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return { success: false, course: null, errors: loadResult.errors };
        }

        const data = loadResult.data;

        // Validate course data (name, code, description + uniqueness)
        const validation = validateCourseData(
            { name, courseCode, description },
            data.courses
        );

        if (!validation.valid) {
            return { success: false, course: null, errors: validation.errors };
        }

        // Create and persist
        const course = new Course(courseCode, name, description);
        data.courses.push(course.toJSON());

        const saveResult = saveData(data);
        if (!saveResult.success) {
            return { success: false, course: null, errors: saveResult.errors };
        }

        return { success: true, course: course.toJSON(), errors: [] };

    } catch (error) {
        console.error('Error adding course:', error);
        return {
            success: false,
            course: null,
            errors: [{ field: 'system', message: 'Failed to add course: ' + error.message }]
        };
    }
}

/**
 * Get a single course by course code
 * Requirements: 2.10
 *
 * @param {string} courseCode - Course code to find
 * @returns {Object|null} Course plain object or null if not found
 */
function getCourse(courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return null;

        return findCourseByCourseCode(loadResult.data.courses, courseCode);

    } catch (error) {
        console.error('Error getting course:', error);
        return null;
    }
}

/**
 * Get all courses in the system
 * Requirements: 2.9
 *
 * @returns {Array<Object>} Array of all course plain objects
 */
function getAllCourses() {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        return loadResult.data.courses;

    } catch (error) {
        console.error('Error getting all courses:', error);
        return [];
    }
}

/**
 * Update an existing course's name and/or description
 * Course code is immutable after creation (Requirement 9.13)
 * Requirements: 2.11, 2.12, 2.13-2.16, 9.13
 *
 * @param {string} courseCode - Course code of the course to update
 * @param {Object} updates    - Fields to update: { name?, description? }
 * @returns {Object} { success, course, errors }
 */
function updateCourse(courseCode, updates) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return { success: false, course: null, errors: loadResult.errors };
        }

        const data = loadResult.data;

        // Find the course
        const courseIndex = data.courses.findIndex(c => c.courseCode === courseCode);
        if (courseIndex === -1) {
            return {
                success: false,
                course: null,
                errors: [{ field: 'courseCode', message: `Course with code "${courseCode}" not found` }]
            };
        }

        const existing = data.courses[courseIndex];

        // Prevent course code modification (Requirement 9.13)
        if (updates.courseCode !== undefined && updates.courseCode !== existing.courseCode) {
            return {
                success: false,
                course: null,
                errors: [{ field: 'courseCode', message: 'Course code cannot be modified after creation' }]
            };
        }

        // Merge updates — only name and description are editable
        const updatedData = {
            name:        updates.name        !== undefined ? updates.name        : existing.name,
            courseCode:  existing.courseCode,
            description: updates.description !== undefined ? updates.description : existing.description
        };

        // Validate (exclude current course from uniqueness check)
        const validation = validateCourseData(updatedData, data.courses, existing.id);
        if (!validation.valid) {
            return { success: false, course: null, errors: validation.errors };
        }

        // Apply and save
        const course = Course.fromJSON(existing);
        course.updateFields(updates);
        data.courses[courseIndex] = course.toJSON();

        const saveResult = saveData(data);
        if (!saveResult.success) {
            return { success: false, course: null, errors: saveResult.errors };
        }

        return { success: true, course: course.toJSON(), errors: [] };

    } catch (error) {
        console.error('Error updating course:', error);
        return {
            success: false,
            course: null,
            errors: [{ field: 'system', message: 'Failed to update course: ' + error.message }]
        };
    }
}

/**
 * Delete a course from the system
 * Cascade-deletes all enrollments and attendance records for this course
 * Requirements: 2.17, 2.18, 2.19, 2.20, 2.21
 *
 * @param {string} courseCode - Course code of the course to delete
 * @returns {Object} { success, deletedCount, errors }
 *   deletedCount: { courses, enrollments, attendanceRecords }
 */
function deleteCourse(courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return {
                success: false,
                deletedCount: { courses: 0, enrollments: 0, attendanceRecords: 0 },
                errors: loadResult.errors
            };
        }

        const data = loadResult.data;

        // Find the course
        const courseIndex = data.courses.findIndex(c => c.courseCode === courseCode);
        if (courseIndex === -1) {
            return {
                success: false,
                deletedCount: { courses: 0, enrollments: 0, attendanceRecords: 0 },
                errors: [{ field: 'courseCode', message: `Course with code "${courseCode}" not found` }]
            };
        }

        // Count related records before deletion (drives confirmation dialog, Requirement 2.19)
        const enrollmentCount      = data.enrollments.filter(e => e.courseCode === courseCode).length;
        const attendanceCount      = data.attendanceRecords.filter(r => r.courseCode === courseCode).length;

        // Remove course
        data.courses.splice(courseIndex, 1);

        // Cascade delete enrollments (Requirement 2.18)
        data.enrollments = data.enrollments.filter(e => e.courseCode !== courseCode);

        // Cascade delete attendance records (Requirement 2.18)
        data.attendanceRecords = data.attendanceRecords.filter(r => r.courseCode !== courseCode);

        const saveResult = saveData(data);
        if (!saveResult.success) {
            return {
                success: false,
                deletedCount: { courses: 0, enrollments: 0, attendanceRecords: 0 },
                errors: saveResult.errors
            };
        }

        return {
            success: true,
            deletedCount: { courses: 1, enrollments: enrollmentCount, attendanceRecords: attendanceCount },
            errors: []
        };

    } catch (error) {
        console.error('Error deleting course:', error);
        return {
            success: false,
            deletedCount: { courses: 0, enrollments: 0, attendanceRecords: 0 },
            errors: [{ field: 'system', message: 'Failed to delete course: ' + error.message }]
        };
    }
}

// ─── Enrollment Management ──────────────────────────────────────────────────

/**
 * Enroll a student in a course
 * Requirements: 3.2, 3.3
 *
 * @param {string} studentId  - Student ID to enroll
 * @param {string} courseCode - Course code to enroll into
 * @returns {Object} { success, enrollment, errors }
 */
function enrollStudent(studentId, courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return { success: false, enrollment: null, errors: loadResult.errors };
        }

        const data = loadResult.data;

        // Validate both references exist
        const studentCheck = validateStudentExists(data.students, studentId);
        if (!studentCheck.valid) {
            return { success: false, enrollment: null, errors: [{ field: 'studentId', message: studentCheck.error }] };
        }

        const courseCheck = validateCourseExists(data.courses, courseCode);
        if (!courseCheck.valid) {
            return { success: false, enrollment: null, errors: [{ field: 'courseCode', message: courseCheck.error }] };
        }

        // Prevent duplicate enrollment
        if (findEnrollment(data.enrollments, studentId, courseCode)) {
            return {
                success: false,
                enrollment: null,
                errors: [{ field: 'enrollment', message: `Student "${studentId}" is already enrolled in course "${courseCode}"` }]
            };
        }

        // Create and persist
        const enrollment = new Enrollment(studentId, courseCode);
        data.enrollments.push(enrollment.toJSON());

        const saveResult = saveData(data);
        if (!saveResult.success) {
            return { success: false, enrollment: null, errors: saveResult.errors };
        }

        return { success: true, enrollment: enrollment.toJSON(), errors: [] };

    } catch (error) {
        console.error('Error enrolling student:', error);
        return {
            success: false,
            enrollment: null,
            errors: [{ field: 'system', message: 'Failed to enroll student: ' + error.message }]
        };
    }
}

/**
 * Remove a student from a course
 * Requirements: 3.2 (enrollment management)
 *
 * @param {string} studentId  - Student ID to unenroll
 * @param {string} courseCode - Course code to unenroll from
 * @returns {Object} { success, errors }
 */
function unenrollStudent(studentId, courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return { success: false, errors: loadResult.errors };
        }

        const data = loadResult.data;

        // Confirm enrollment exists
        const existing = findEnrollment(data.enrollments, studentId, courseCode);
        if (!existing) {
            return {
                success: false,
                errors: [{ field: 'enrollment', message: `Student "${studentId}" is not enrolled in course "${courseCode}"` }]
            };
        }

        // Remove enrollment
        data.enrollments = data.enrollments.filter(
            e => !(e.studentId === studentId && e.courseCode === courseCode)
        );

        const saveResult = saveData(data);
        if (!saveResult.success) {
            return { success: false, errors: saveResult.errors };
        }

        return { success: true, errors: [] };

    } catch (error) {
        console.error('Error unenrolling student:', error);
        return {
            success: false,
            errors: [{ field: 'system', message: 'Failed to unenroll student: ' + error.message }]
        };
    }
}

/**
 * Get all students enrolled in a course
 * Requirements: 3.4
 *
 * @param {string} courseCode - Course code
 * @returns {Array<Object>} Array of student plain objects enrolled in the course
 */
function getEnrolledStudents(courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        const { students, enrollments } = loadResult.data;

        // Collect student IDs enrolled in this course
        const enrolledIds = enrollments
            .filter(e => e.courseCode === courseCode)
            .map(e => e.studentId);

        // Return full student objects in that set
        return students.filter(s => enrolledIds.includes(s.studentId));

    } catch (error) {
        console.error('Error getting enrolled students:', error);
        return [];
    }
}

/**
 * Get all courses a specific student is enrolled in
 * Requirements: 3.2 (enrollment management), 6.7
 *
 * @param {string} studentId - Student ID
 * @returns {Array<Object>} Array of course plain objects the student is enrolled in
 */
function getStudentCourses(studentId) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        const { courses, enrollments } = loadResult.data;

        // Collect course codes for this student
        const enrolledCodes = enrollments
            .filter(e => e.studentId === studentId)
            .map(e => e.courseCode);

        // Return full course objects in that set
        return courses.filter(c => enrolledCodes.includes(c.courseCode));

    } catch (error) {
        console.error('Error getting student courses:', error);
        return [];
    }
}
