/**
 * Student Management Module
 * Handles all CRUD operations for students
 * Requirements: 1.1-1.11, 9.4, 9.12
 */

/**
 * Add a new student to the system
 * Requirements: 1.1, 1.2, 1.3, 9.4
 * 
 * @param {string} name - Student name
 * @param {string} studentId - Student ID (must be unique)
 * @param {string} email - Student email address
 * @returns {Object} Result with { success, student, errors }
 */
function addStudent(name, email, studentId) {
    try {
        // Load current data
        const loadResult = loadData();
        if (!loadResult.success) {
            return {
                success: false,
                student: null,
                errors: loadResult.errors
            };
        }
        
        const data = loadResult.data;
        
        // Validate student data
        const validation = validateStudentData(
            { name, studentId, email },
            data.students
        );
        
        if (!validation.valid) {
            return {
                success: false,
                student: null,
                errors: validation.errors
            };
        }
        
        // Create new student
        const student = new Student(studentId, name, email);
        
        // Add to data
        data.students.push(student.toJSON());
        
        // Save to storage
        const saveResult = saveData(data);
        if (!saveResult.success) {
            return {
                success: false,
                student: null,
                errors: saveResult.errors
            };
        }
        
        return {
            success: true,
            student: student.toJSON(),
            errors: []
        };
        
    } catch (error) {
        console.error('Error adding student:', error);
        return {
            success: false,
            student: null,
            errors: [{ field: 'system', message: 'Failed to add student: ' + error.message }]
        };
    }
}

/**
 * Get a student by student ID
 * Requirements: 1.5
 * 
 * @param {string} studentId - Student ID to find
 * @returns {Object|null} Student object or null if not found
 */
function getStudent(studentId) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return null;
        }
        
        const data = loadResult.data;
        return findStudentByStudentId(data.students, studentId);
        
    } catch (error) {
        console.error('Error getting student:', error);
        return null;
    }
}

/**
 * Get all students in the system
 * Requirements: 1.4
 * 
 * @returns {Array<Object>} Array of all students
 */
function getAllStudents() {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return [];
        }
        
        return loadResult.data.students;
        
    } catch (error) {
        console.error('Error getting all students:', error);
        return [];
    }
}

/**
 * Update an existing student's information
 * Note: studentId cannot be modified after creation (Requirement 9.12)
 * Requirements: 1.6, 1.7, 1.8, 9.12
 * 
 * @param {string} studentId - Student ID of the student to update
 * @param {Object} updates - Object containing fields to update { name, email }
 * @returns {Object} Result with { success, student, errors }
 */
function updateStudent(studentId, updates) {
    try {
        // Load current data
        const loadResult = loadData();
        if (!loadResult.success) {
            return {
                success: false,
                student: null,
                errors: loadResult.errors
            };
        }
        
        const data = loadResult.data;
        
        // Find the student
        const studentIndex = data.students.findIndex(s => s.studentId === studentId);
        if (studentIndex === -1) {
            return {
                success: false,
                student: null,
                errors: [{ field: 'studentId', message: `Student with ID "${studentId}" not found` }]
            };
        }
        
        const existingStudent = data.students[studentIndex];
        
        // Prevent studentId modification (Requirement 9.12)
        if (updates.studentId !== undefined && updates.studentId !== existingStudent.studentId) {
            return {
                success: false,
                student: null,
                errors: [{ field: 'studentId', message: 'Student ID cannot be modified after creation' }]
            };
        }
        
        // Prepare updated data (only name and email can be updated)
        const updatedData = {
            name: updates.name !== undefined ? updates.name : existingStudent.name,
            email: updates.email !== undefined ? updates.email : existingStudent.email,
            studentId: existingStudent.studentId
        };
        
        // Validate updated data (exclude current student from uniqueness check)
        const validation = validateStudentData(
            updatedData,
            data.students,
            existingStudent.id
        );
        
        if (!validation.valid) {
            return {
                success: false,
                student: null,
                errors: validation.errors
            };
        }
        
        // Reconstruct student and update fields
        const student = Student.fromJSON(existingStudent);
        student.updateFields(updates);
        
        // Update in data array
        data.students[studentIndex] = student.toJSON();
        
        // Save to storage
        const saveResult = saveData(data);
        if (!saveResult.success) {
            return {
                success: false,
                student: null,
                errors: saveResult.errors
            };
        }
        
        return {
            success: true,
            student: student.toJSON(),
            errors: []
        };
        
    } catch (error) {
        console.error('Error updating student:', error);
        return {
            success: false,
            student: null,
            errors: [{ field: 'system', message: 'Failed to update student: ' + error.message }]
        };
    }
}

/**
 * Delete a student from the system
 * Also removes all associated attendance records (cascade delete)
 * Requirements: 1.9, 1.10, 1.11
 * 
 * @param {string} studentId - Student ID of the student to delete
 * @returns {Object} Result with { success, deletedCount, errors }
 */
function deleteStudent(studentId) {
    try {
        // Load current data
        const loadResult = loadData();
        if (!loadResult.success) {
            return {
                success: false,
                deletedCount: { students: 0, enrollments: 0, attendanceRecords: 0 },
                errors: loadResult.errors
            };
        }
        
        const data = loadResult.data;
        
        // Find the student
        const studentIndex = data.students.findIndex(s => s.studentId === studentId);
        if (studentIndex === -1) {
            return {
                success: false,
                deletedCount: { students: 0, enrollments: 0, attendanceRecords: 0 },
                errors: [{ field: 'studentId', message: `Student with ID "${studentId}" not found` }]
            };
        }
        
        // Count related records before deletion (for confirmation dialog data)
        const enrollmentCount = data.enrollments.filter(e => e.studentId === studentId).length;
        const attendanceCount = data.attendanceRecords.filter(r => r.studentId === studentId).length;
        
        // Remove student
        data.students.splice(studentIndex, 1);
        
        // Cascade delete: Remove all enrollments for this student (Requirement 1.10)
        data.enrollments = data.enrollments.filter(e => e.studentId !== studentId);
        
        // Cascade delete: Remove all attendance records for this student (Requirement 1.10)
        data.attendanceRecords = data.attendanceRecords.filter(r => r.studentId !== studentId);
        
        // Save to storage
        const saveResult = saveData(data);
        if (!saveResult.success) {
            return {
                success: false,
                deletedCount: { students: 0, enrollments: 0, attendanceRecords: 0 },
                errors: saveResult.errors
            };
        }
        
        return {
            success: true,
            deletedCount: {
                students: 1,
                enrollments: enrollmentCount,
                attendanceRecords: attendanceCount
            },
            errors: []
        };
        
    } catch (error) {
        console.error('Error deleting student:', error);
        return {
            success: false,
            deletedCount: { students: 0, enrollments: 0, attendanceRecords: 0 },
            errors: [{ field: 'system', message: 'Failed to delete student: ' + error.message }]
        };
    }
}

/**
 * Search students by name or student ID
 * Filtering is case-insensitive and matches partial strings
 * Requirements: 5.1, 5.2, 5.3, 5.4
 *
 * @param {string} searchText - Text to search for in name or student ID
 * @returns {Array<Object>} Array of matching student objects (empty if none found)
 */
function searchStudents(searchText) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return [];
        }

        const students = loadResult.data.students;

        // Empty or whitespace-only query returns all students (Requirement 5.4)
        const trimmedText = trimWhitespace(searchText);
        if (isEmpty(trimmedText)) {
            return students;
        }

        // Normalise to lowercase once for comparison (Requirement 5.2)
        const query = trimmedText.toLowerCase();

        return students.filter(student => {
            const nameMatch    = student.name.toLowerCase().includes(query);
            const idMatch      = student.studentId.toLowerCase().includes(query);
            return nameMatch || idMatch;
        });

    } catch (error) {
        console.error('Error searching students:', error);
        return [];
    }
}

/**
 * Get all students currently marked as at-risk in at least one course
 * A student is at-risk when their absence rate in a course is >= 30.0%
 * Absence rate = (absences / totalSessions) * 100
 * Requirements: 5.5, 5.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 *
 * @returns {Array<Object>} Array of at-risk entries, each containing:
 *   { student: Object, courseCode: string, absenceRate: number }
 *   Sorted by absenceRate descending (Requirement 7.6)
 */
function getAtRiskStudents() {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return [];
        }

        const { students, courses, attendanceRecords } = loadResult.data;

        const atRiskEntries = [];

        // Evaluate every student against every course that has records for them
        for (const student of students) {
            // Collect unique course codes this student has attendance records in
            const courseCodes = [
                ...new Set(
                    attendanceRecords
                        .filter(r => r.studentId === student.studentId)
                        .map(r => r.courseCode)
                )
            ];

            for (const courseCode of courseCodes) {
                const courseRecords = attendanceRecords.filter(
                    r => r.studentId === student.studentId && r.courseCode === courseCode
                );

                const totalSessions = courseRecords.length;

                // Requirement 7.9: no at-risk status when zero records exist
                if (totalSessions === 0) {
                    continue;
                }

                const absences = courseRecords.filter(r => r.status === 'absent').length;
                const absenceRate = Math.round((absences / totalSessions) * 1000) / 10; // 1 decimal place

                // Requirement 7.1: at-risk when absence rate >= 30.0%
                if (absenceRate >= 30.0) {
                    // Resolve course name for display (Requirement 7.5)
                    const course = courses.find(c => c.courseCode === courseCode) || null;

                    atRiskEntries.push({
                        student: student,
                        courseCode: courseCode,
                        courseName: course ? course.name : courseCode,
                        absenceRate: absenceRate
                    });
                }
            }
        }

        // Requirement 7.6: sort by absence rate descending
        atRiskEntries.sort((a, b) => b.absenceRate - a.absenceRate);

        return atRiskEntries;

    } catch (error) {
        console.error('Error getting at-risk students:', error);
        return [];
    }
}

/**
 * Check whether a specific student is at-risk in at least one course
 * Used by the student list UI to decide whether to show the warning icon
 * Requirement: 7.3
 *
 * @param {string} studentId - Student ID to check
 * @returns {boolean} True if the student is at-risk in any course
 */
function isStudentAtRisk(studentId) {
    return getAtRiskStudents().some(entry => entry.student.studentId === studentId);
}
