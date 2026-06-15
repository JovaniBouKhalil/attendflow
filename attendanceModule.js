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
