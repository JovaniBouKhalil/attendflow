/**
 * Report Module
 * Generates attendance statistics and summary reports
 * Requirements: 6.1-6.8, 6.12, 6.13
 *
 * Task 8.1 scope: course/student report generation and summaries.
 * At-risk list generation is added in Task 8.2 and is intentionally NOT here.
 *
 * This module is a read-only aggregation layer. It builds on
 * calculateAbsenceRate() (attendanceModule) so every figure it reports uses
 * the same rounding and zero-session semantics as the rest of the app.
 */

/**
 * Generate a detailed report for a single course.
 * Includes total sessions, per-student absence breakdown, and the average
 * absence rate across all students who have at least one record in the course.
 * Requirements: 6.2, 6.4, 6.5, 6.12
 *
 * @param {string} courseCode - Course code to report on
 * @returns {Object|null} Course report, or null if the course does not exist:
 *   {
 *     courseCode, courseName,
 *     totalSessions,            // distinct session dates recorded
 *     studentStats: [           // one entry per student with records
 *       { studentId, studentName, totalSessions, absences, presences, rate }
 *     ],
 *     averageAbsenceRate        // number (1 decimal) or null when no data ("N/A")
 *   }
 */
function generateCourseReport(courseCode) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return null;

        const { students, courses, attendanceRecords } = loadResult.data;

        // Course must exist to report on it
        const course = courses.find(c => c.courseCode === courseCode);
        if (!course) return null;

        const courseRecords = attendanceRecords.filter(r => r.courseCode === courseCode);

        // Total distinct sessions recorded for the course (Requirement 6.2)
        const totalSessions = new Set(courseRecords.map(r => r.date)).size;

        // Per-student breakdown for students who have records in this course
        const studentIds = [...new Set(courseRecords.map(r => r.studentId))];

        const studentStats = studentIds.map(studentId => {
            const stats = calculateAbsenceRate(studentId, courseCode);
            const student = students.find(s => s.studentId === studentId) || null;

            return {
                studentId:     studentId,
                studentName:   student ? student.name : studentId,
                totalSessions: stats.totalSessions,
                absences:      stats.absences,
                presences:     stats.presences,
                rate:          stats.rate
            };
        });

        // Average absence rate across students with data (Requirement 6.5)
        // Zero students with data -> N/A (Requirement 6.12)
        let averageAbsenceRate = null;
        const ratedStudents = studentStats.filter(s => s.rate !== null);
        if (ratedStudents.length > 0) {
            const sum = ratedStudents.reduce((acc, s) => acc + s.rate, 0);
            averageAbsenceRate = Math.round((sum / ratedStudents.length) * 10) / 10;
        }

        // Sort student breakdown by name ascending for stable display
        studentStats.sort((a, b) => a.studentName.localeCompare(b.studentName));

        return {
            courseCode:         course.courseCode,
            courseName:         course.name,
            totalSessions:      totalSessions,
            studentStats:       studentStats,
            averageAbsenceRate: averageAbsenceRate
        };

    } catch (error) {
        console.error('Error generating course report:', error);
        return null;
    }
}

/**
 * Generate a detailed report for a single student.
 * Includes the student's absence rate in each course where they have records.
 * Requirements: 6.1, 6.3, 6.6, 6.7, 6.13
 *
 * @param {string} studentId - Student ID to report on
 * @returns {Object|null} Student report, or null if the student does not exist:
 *   {
 *     studentId, studentName,
 *     courseStats: [            // one entry per course with records
 *       { courseCode, courseName, totalSessions, absences, presences, rate }
 *     ],
 *     hasData                   // false when the student has no records anywhere
 *   }
 */
function generateStudentReport(studentId) {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return null;

        const { students, courses, attendanceRecords } = loadResult.data;

        // Student must exist to report on them
        const student = students.find(s => s.studentId === studentId);
        if (!student) return null;

        const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);

        // Courses in which this student has at least one record
        const courseCodes = [...new Set(studentRecords.map(r => r.courseCode))];

        const courseStats = courseCodes.map(courseCode => {
            const stats = calculateAbsenceRate(studentId, courseCode);
            const course = courses.find(c => c.courseCode === courseCode) || null;

            return {
                courseCode:    courseCode,
                courseName:    course ? course.name : courseCode,
                totalSessions: stats.totalSessions,
                absences:      stats.absences,
                presences:     stats.presences,
                rate:          stats.rate
            };
        });

        // Sort by course name ascending for stable display
        courseStats.sort((a, b) => a.courseName.localeCompare(b.courseName));

        return {
            studentId:   student.studentId,
            studentName: student.name,
            courseStats: courseStats,
            hasData:     courseStats.length > 0   // Requirement 6.13 empty-state flag
        };

    } catch (error) {
        console.error('Error generating student report:', error);
        return null;
    }
}

/**
 * Get summary statistics for every course in the system.
 * Requirements: 6.4, 6.5, 6.12
 *
 * @returns {Array<Object>} One summary per course:
 *   { courseCode, courseName, totalSessions, studentCount, averageAbsenceRate }
 *   averageAbsenceRate is null ("N/A") when the course has no rated students.
 */
function getCourseSummaries() {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        const { courses } = loadResult.data;

        const summaries = courses.map(course => {
            const report = generateCourseReport(course.courseCode);

            // generateCourseReport returns null only if the course vanished;
            // here it always exists, but guard defensively.
            if (!report) {
                return {
                    courseCode:         course.courseCode,
                    courseName:         course.name,
                    totalSessions:      0,
                    studentCount:       0,
                    averageAbsenceRate: null
                };
            }

            return {
                courseCode:         report.courseCode,
                courseName:         report.courseName,
                totalSessions:      report.totalSessions,
                studentCount:       report.studentStats.length,
                averageAbsenceRate: report.averageAbsenceRate
            };
        });

        // Stable ordering by course name
        summaries.sort((a, b) => a.courseName.localeCompare(b.courseName));

        return summaries;

    } catch (error) {
        console.error('Error getting course summaries:', error);
        return [];
    }
}

/**
 * Get summary statistics for every student in the system.
 * Requirements: 6.6, 6.7, 6.13
 *
 * @returns {Array<Object>} One summary per student:
 *   { studentId, studentName, courseCount, hasData }
 */
function getStudentSummaries() {
    try {
        const loadResult = loadData();
        if (!loadResult.success) return [];

        const { students } = loadResult.data;

        const summaries = students.map(student => {
            const report = generateStudentReport(student.studentId);

            if (!report) {
                return {
                    studentId:   student.studentId,
                    studentName: student.name,
                    courseCount: 0,
                    hasData:     false
                };
            }

            return {
                studentId:   report.studentId,
                studentName: report.studentName,
                courseCount: report.courseStats.length,
                hasData:     report.hasData
            };
        });

        // Stable ordering by student name
        summaries.sort((a, b) => a.studentName.localeCompare(b.studentName));

        return summaries;

    } catch (error) {
        console.error('Error getting student summaries:', error);
        return [];
    }
}
