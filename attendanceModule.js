/**
 * Attendance Management Module
 * Handles recording, retrieving, and editing of attendance records
 * Requirements: 3.1, 3.4, 3.6, 3.7, 3.8, 3.9, 9.10
 *
 * Task 7.1 scope: attendance recording operations only.
 * History queries, absence-rate, and at-risk calculations are added in
 * later sub-tasks (7.2, 7.3, 7.4) and are intentionally NOT included here.
 */

/**
 * Record (create or update) attendance for a batch of students in a course on a date.
 *
 * Each record in the batch is keyed by the unique combination
 * (studentId, courseCode, date). If a record for that combination already
 * exists, its status and updatedAt timestamp are updated; otherwise a new
 * record is created. This makes recording idempotent for a given session.
 *
 * Requirements: 3.4, 3.6, 3.7, 3.9, 9.10
 *
 * @param {string} courseCode - Course code the session belongs to
 * @param {string} date       - Session date in YYYY-MM-DD format
 * @param {Array<{studentId: string, status: string}>} records - Per-student statuses
 * @returns {Object} { success, savedCount, errors }
 */
function recordAttendance(courseCode, date, records) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return { success: false, savedCount: 0, errors: loadResult.errors };
        }

        const data = loadResult.data;
        const errors = [];

        // --- Validate the course reference once (Requirement 9.10) ---
        const courseCheck = validateCourseExists(data.courses, courseCode);
        if (!courseCheck.valid) {
            return { success: false, savedCount: 0, errors: [{ field: 'courseCode', message: courseCheck.error }] };
        }

        // --- Validate the date once (format + not future) (Requirement 3.8 handled in validation) ---
        const dateCheck = validateAttendanceDate(date);
        if (!dateCheck.valid) {
            return { success: false, savedCount: 0, errors: [{ field: 'date', message: dateCheck.error }] };
        }

        // --- Validate the batch shape ---
        if (!Array.isArray(records) || records.length === 0) {
            return {
                success: false,
                savedCount: 0,
                errors: [{ field: 'records', message: 'At least one attendance entry is required' }]
            };
        }

        // --- Validate every entry BEFORE mutating anything (all-or-nothing) ---
        records.forEach((entry, index) => {
            const studentCheck = validateStudentExists(data.students, entry.studentId);
            if (!studentCheck.valid) {
                errors.push({ field: `records[${index}].studentId`, message: studentCheck.error });
            }

            const statusCheck = validateAttendanceStatus(entry.status);
            if (!statusCheck.valid) {
                errors.push({ field: `records[${index}].status`, message: statusCheck.error });
            }
        });

        // --- Guard against duplicate students within the same batch ---
        const seen = new Set();
        records.forEach((entry, index) => {
            if (seen.has(entry.studentId)) {
                errors.push({
                    field: `records[${index}].studentId`,
                    message: `Duplicate entry for student "${entry.studentId}" in this batch`
                });
            }
            seen.add(entry.studentId);
        });

        if (errors.length > 0) {
            return { success: false, savedCount: 0, errors };
        }

        // --- Apply: upsert each entry (Requirement 3.7, unique constraint) ---
        let savedCount = 0;

        for (const entry of records) {
            const existing = findAttendanceRecord(
                data.attendanceRecords,
                entry.studentId,
                courseCode,
                date
            );

            if (existing) {
                // Update existing record's status + timestamp (Requirement 3.9)
                const record = AttendanceRecord.fromJSON(existing);
                record.updateStatus(entry.status);

                const idx = data.attendanceRecords.findIndex(r => r.id === existing.id);
                data.attendanceRecords[idx] = record.toJSON();
            } else {
                // Create a brand-new record
                const record = new AttendanceRecord(entry.studentId, courseCode, date, entry.status);
                data.attendanceRecords.push(record.toJSON());
            }

            savedCount++;
        }

        const saveResult = saveData(data);
        if (!saveResult.success) {
            return { success: false, savedCount: 0, errors: saveResult.errors };
        }

        return { success: true, savedCount, errors: [] };

    } catch (error) {
        console.error('Error recording attendance:', error);
        return {
            success: false,
            savedCount: 0,
            errors: [{ field: 'system', message: 'Failed to record attendance: ' + error.message }]
        };
    }
}

/**
 * Get all attendance records for a specific course and date.
 * Used to pre-populate the recording UI when editing an existing session.
 * Requirements: 3.1
 *
 * @param {string} courseCode - Course code
 * @param {string} date       - Session date in YYYY-MM-DD format
 * @returns {Array<Object>} Matching attendance record plain objects
 */
function getAttendance(courseCode, date) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        return loadResult.data.attendanceRecords.filter(
            r => r.courseCode === courseCode && r.date === date
        );

    } catch (error) {
        console.error('Error getting attendance:', error);
        return [];
    }
}

/**
 * Update the status of a single existing attendance record by its internal id.
 * Requirements: 3.7, 3.9, 9.10
 *
 * @param {string} recordId - Internal UUID of the attendance record
 * @param {string} status   - New attendance status ('present' | 'absent')
 * @returns {Object} { success, record, errors }
 */
function updateAttendanceRecord(recordId, status) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return { success: false, record: null, errors: loadResult.errors };
        }

        const data = loadResult.data;

        // Locate the record
        const idx = data.attendanceRecords.findIndex(r => r.id === recordId);
        if (idx === -1) {
            return {
                success: false,
                record: null,
                errors: [{ field: 'recordId', message: `Attendance record "${recordId}" not found` }]
            };
        }

        // Validate the new status (Requirement 4.12 / 3.7)
        const statusCheck = validateAttendanceStatus(status);
        if (!statusCheck.valid) {
            return { success: false, record: null, errors: [{ field: 'status', message: statusCheck.error }] };
        }

        // Apply update + refresh timestamp (Requirement 3.9)
        const record = AttendanceRecord.fromJSON(data.attendanceRecords[idx]);
        record.updateStatus(status);
        data.attendanceRecords[idx] = record.toJSON();

        const saveResult = saveData(data);
        if (!saveResult.success) {
            return { success: false, record: null, errors: saveResult.errors };
        }

        return { success: true, record: record.toJSON(), errors: [] };

    } catch (error) {
        console.error('Error updating attendance record:', error);
        return {
            success: false,
            record: null,
            errors: [{ field: 'system', message: 'Failed to update attendance record: ' + error.message }]
        };
    }
}

// ─── Attendance History Queries (Task 7.2) ──────────────────────────────────

/**
 * Get all attendance records for a specific student, grouped by course.
 * Within each course group, records are sorted by date descending.
 * Requirements: 4.1, 4.2, 4.6, 4.8
 *
 * @param {string} studentId - Student ID whose history is requested
 * @returns {Array<Object>} Array of course groups, each:
 *   {
 *     courseCode: string,
 *     courseName: string,
 *     records: Array<Object>   // attendance records, date descending
 *   }
 *   Groups are ordered by courseName ascending. Empty array if none.
 */
function getStudentAttendance(studentId) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        const { courses, attendanceRecords } = loadResult.data;

        // All records for this student
        const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
        if (studentRecords.length === 0) {
            return [];
        }

        // Group by course code
        const groupsByCode = {};
        for (const record of studentRecords) {
            if (!groupsByCode[record.courseCode]) {
                groupsByCode[record.courseCode] = [];
            }
            groupsByCode[record.courseCode].push(record);
        }

        // Build group objects with course name + sorted records
        const groups = Object.keys(groupsByCode).map(courseCode => {
            const course = courses.find(c => c.courseCode === courseCode) || null;
            const records = groupsByCode[courseCode]
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date)); // date descending

            return {
                courseCode: courseCode,
                courseName: course ? course.name : courseCode,
                records: records
            };
        });

        // Order groups by course name ascending for stable display
        groups.sort((a, b) => a.courseName.localeCompare(b.courseName));

        return groups;

    } catch (error) {
        console.error('Error getting student attendance:', error);
        return [];
    }
}

/**
 * Get all attendance records for a specific course, grouped by date.
 * Date groups are ordered by date descending; within each date, records are
 * ordered by student name ascending for stable display.
 * Requirements: 4.3, 4.4, 4.6, 4.8
 *
 * @param {string} courseCode - Course code whose history is requested
 * @returns {Array<Object>} Array of date groups, each:
 *   {
 *     date: string,            // YYYY-MM-DD
 *     records: Array<Object>   // attendance records for that date
 *   }
 *   Empty array if no records exist for the course.
 */
function getCourseAttendance(courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        const { students, attendanceRecords } = loadResult.data;

        // All records for this course
        const courseRecords = attendanceRecords.filter(r => r.courseCode === courseCode);
        if (courseRecords.length === 0) {
            return [];
        }

        // Lookup map for student names (avoids repeated find calls)
        const nameByStudentId = {};
        for (const student of students) {
            nameByStudentId[student.studentId] = student.name;
        }

        // Group by date
        const groupsByDate = {};
        for (const record of courseRecords) {
            if (!groupsByDate[record.date]) {
                groupsByDate[record.date] = [];
            }
            groupsByDate[record.date].push(record);
        }

        // Build group objects, records sorted by student name ascending
        const groups = Object.keys(groupsByDate).map(date => {
            const records = groupsByDate[date]
                .slice()
                .sort((a, b) => {
                    const nameA = nameByStudentId[a.studentId] || a.studentId;
                    const nameB = nameByStudentId[b.studentId] || b.studentId;
                    return nameA.localeCompare(nameB);
                });

            return { date: date, records: records };
        });

        // Order date groups by date descending (Requirement 4.8)
        groups.sort((a, b) => b.date.localeCompare(a.date));

        return groups;

    } catch (error) {
        console.error('Error getting course attendance:', error);
        return [];
    }
}

// ─── Absence Rate Calculation (Task 7.3) ────────────────────────────────────

/**
 * Calculate the absence rate for a student in a specific course.
 * Absence rate = (absences / totalSessions) * 100, rounded to 1 decimal place.
 * Requirements: 6.1, 6.3, 6.8
 *
 * @param {string} studentId  - Student ID
 * @param {string} courseCode - Course code
 * @returns {Object} {
 *   totalSessions: number,   // count of attendance records for the pair
 *   absences:      number,   // count of 'absent' records
 *   presences:     number,   // count of 'present' records
 *   rate:          number|null  // absence rate %, 1 decimal; null when no sessions
 * }
 */
function calculateAbsenceRate(studentId, courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) {
            return { totalSessions: 0, absences: 0, presences: 0, rate: null };
        }

        const courseRecords = loadResult.data.attendanceRecords.filter(
            r => r.studentId === studentId && r.courseCode === courseCode
        );

        const totalSessions = courseRecords.length;

        // No sessions -> rate is undefined/N-A (Requirement 6.8 zero-session edge case)
        if (totalSessions === 0) {
            return { totalSessions: 0, absences: 0, presences: 0, rate: null };
        }

        const absences  = courseRecords.filter(r => r.status === 'absent').length;
        const presences = courseRecords.filter(r => r.status === 'present').length;

        // Round to 1 decimal place (Requirement 6.8)
        const rate = Math.round((absences / totalSessions) * 1000) / 10;

        return { totalSessions, absences, presences, rate };

    } catch (error) {
        console.error('Error calculating absence rate:', error);
        return { totalSessions: 0, absences: 0, presences: 0, rate: null };
    }
}

// ─── At-Risk Status & Statistics Recalculation (Task 7.4) ───────────────────

/**
 * The absence-rate threshold (percent) at or above which a student is
 * considered at-risk of dropping a course.
 * Requirement: 7.1
 */
const AT_RISK_THRESHOLD = 30.0;

/**
 * Determine whether a student is at-risk in a specific course.
 * A student is at-risk when their absence rate in the course is >= 30.0%.
 * A student with zero recorded sessions is never at-risk (Requirement 7.9).
 * Requirements: 7.1, 7.2, 7.9
 *
 * @param {string} studentId  - Student ID
 * @param {string} courseCode - Course code
 * @returns {boolean} True if the student is at-risk in the course
 */
function calculateAtRiskStatus(studentId, courseCode) {
    try {
        const stats = calculateAbsenceRate(studentId, courseCode);

        // No sessions -> rate is null -> never at-risk (Requirement 7.9)
        if (stats.rate === null) {
            return false;
        }

        // At-risk when absence rate meets or exceeds the threshold (Requirement 7.1)
        return stats.rate >= AT_RISK_THRESHOLD;

    } catch (error) {
        console.error('Error calculating at-risk status:', error);
        return false;
    }
}

/**
 * Recalculate the current statistics for a student in a course.
 *
 * Absence rate and at-risk status are computed values that are NOT persisted;
 * they are always derived on demand from the attendance records. This function
 * provides a single entry point that callers invoke after any attendance
 * record is added, updated, or deleted, returning the freshly computed
 * statistics so the UI can update immediately.
 *
 * Requirements: 3.10, 4.11, 7.7, 7.8
 *
 * @param {string} studentId  - Student ID
 * @param {string} courseCode - Course code
 * @returns {Object} {
 *   studentId, courseCode,
 *   totalSessions, absences, presences,
 *   rate,        // absence rate %, 1 decimal, or null when no sessions
 *   isAtRisk     // boolean
 * }
 */
function recalculateStatistics(studentId, courseCode) {
    try {
        const stats = calculateAbsenceRate(studentId, courseCode);
        const isAtRisk = stats.rate === null ? false : stats.rate >= AT_RISK_THRESHOLD;

        return {
            studentId:     studentId,
            courseCode:    courseCode,
            totalSessions: stats.totalSessions,
            absences:      stats.absences,
            presences:     stats.presences,
            rate:          stats.rate,
            isAtRisk:      isAtRisk
        };

    } catch (error) {
        console.error('Error recalculating statistics:', error);
        return {
            studentId:     studentId,
            courseCode:    courseCode,
            totalSessions: 0,
            absences:      0,
            presences:     0,
            rate:          null,
            isAtRisk:      false
        };
    }
}
