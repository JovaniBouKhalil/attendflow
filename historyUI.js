/**
 * historyUI.js — Attendance History Viewing
 * Task 14.1: read-only history views for a student and for a course.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8
 *
 * Data comes from the existing attendance module query functions:
 *   getStudentAttendance(studentId) → groups by course, records date-desc
 *   getCourseAttendance(courseCode) → groups by date (desc), records by name
 *
 * Scope: viewing only. Editing attendance is Task 14.2; reports are Task 15.
 */

'use strict';

// ─── Student history ──────────────────────────────────────────────────────────

/**
 * Render a student's attendance history, grouped by course.
 * Renders into the students section content area and sets a breadcrumb.
 * Requirements: 4.1, 4.2, 4.3 (empty), 4.5, 4.6, 4.8
 *
 * @param {string} studentId
 */
function openStudentHistory(studentId) {
    const student = getStudent(studentId);
    if (!student) {
        showError('Student not found.');
        return;
    }

    // Breadcrumb: Students › [Name] (History)
    if (typeof navigateToDetail === 'function') {
        navigateToDetail('students', `${student.name} — History`);
    }

    showLoading();
    const groups = getStudentAttendance(studentId);   // grouped by course
    hideLoading();

    const output = document.getElementById('student-list-output');
    if (!output) return;

    // Empty state (Requirement 4.3)
    if (groups.length === 0) {
        output.innerHTML = `
            <div class="history-view" role="region"
                 aria-label="Attendance history for ${escapeHTML(student.name)}">
                ${_historyHeader(student.name, 'Attendance History')}
                ${_buildHistoryEmpty('No attendance history for this student yet.')}
                ${_historyBackButton('btn-history-back', 'Back to Students')}
            </div>`;
        _wireStudentHistoryBack(studentId);
        return;
    }

    const groupsHTML = groups.map(group => `
        <section class="history-group" aria-label="Course ${escapeHTML(group.courseName)}">
            <h4 class="history-group__title">
                ${escapeHTML(group.courseName)}
                <span class="text-muted">(${escapeHTML(group.courseCode)})</span>
            </h4>
            ${_buildHistoryTable(group.records, 'student')}
        </section>`).join('');

    output.innerHTML = `
        <div class="history-view" role="region"
             aria-label="Attendance history for ${escapeHTML(student.name)}">
            ${_historyHeader(student.name, 'Attendance History')}
            ${groupsHTML}
            ${_historyBackButton('btn-history-back', 'Back to Students')}
        </div>`;

    _wireStudentHistoryBack(studentId);
}

/** Wire the back button on the student history view. */
function _wireStudentHistoryBack(studentId) {
    const back = document.getElementById('btn-history-back');
    if (back) {
        back.addEventListener('click', () => {
            // Return to the student detail view if available, else the list
            if (typeof openStudentDetail === 'function') {
                openStudentDetail(studentId);
            } else {
                navigateTo('students');
                refreshStudentList();
            }
        });
    }
}

// ─── Course history ───────────────────────────────────────────────────────────

/**
 * Render a course's attendance history, grouped by date (descending).
 * Renders into the courses section content area and sets a breadcrumb.
 * Requirements: 4.3, 4.4, 4.5, 4.6 (empty), 4.8
 *
 * @param {string} courseCode
 */
function openCourseHistory(courseCode) {
    const course = getCourse(courseCode);
    if (!course) {
        showError('Course not found.');
        return;
    }

    if (typeof navigateToDetail === 'function') {
        navigateToDetail('courses', `${course.name} — History`);
    }

    showLoading();
    const groups = getCourseAttendance(courseCode);    // grouped by date desc
    hideLoading();

    const output = document.getElementById('course-list-output');
    if (!output) return;

    // Empty state (Requirement 4.6)
    if (groups.length === 0) {
        output.innerHTML = `
            <div class="history-view" role="region"
                 aria-label="Attendance history for ${escapeHTML(course.name)}">
                ${_historyHeader(course.name, 'Attendance History')}
                ${_buildHistoryEmpty('No attendance history for this course yet.')}
                ${_historyBackButton('btn-course-history-back', 'Back to Courses')}
            </div>`;
        _wireCourseHistoryBack(courseCode);
        return;
    }

    const groupsHTML = groups.map(group => `
        <section class="history-group" aria-label="Session ${escapeHTML(group.date)}">
            <h4 class="history-group__title">
                ${escapeHTML(_formatDisplayDate(group.date))}
                <span class="text-muted">
                    (${group.records.length} record${group.records.length !== 1 ? 's' : ''})
                </span>
            </h4>
            ${_buildHistoryTable(group.records, 'course')}
        </section>`).join('');

    output.innerHTML = `
        <div class="history-view" role="region"
             aria-label="Attendance history for ${escapeHTML(course.name)}">
            ${_historyHeader(course.name, 'Attendance History')}
            ${groupsHTML}
            ${_historyBackButton('btn-course-history-back', 'Back to Courses')}
        </div>`;

    _wireCourseHistoryBack(courseCode);
}

/** Wire the back button on the course history view. */
function _wireCourseHistoryBack(courseCode) {
    const back = document.getElementById('btn-course-history-back');
    if (back) {
        back.addEventListener('click', () => {
            if (typeof openCourseDetail === 'function') {
                openCourseDetail(courseCode);
            } else {
                navigateTo('courses');
                refreshCourseList();
            }
        });
    }
}

// ─── Shared builders ──────────────────────────────────────────────────────────

/**
 * Build a history table for a group of records.
 * Columns depend on the context:
 *   'student' view → Date | Status  (course is the group heading)
 *   'course'  view → Student | Status  (date is the group heading)
 * Requirements: 4.5, 4.6, 4.8
 *
 * @param {Array<Object>} records - Already sorted by the module
 * @param {'student'|'course'} context
 * @returns {string} HTML
 */
function _buildHistoryTable(records, context) {
    const firstCol = context === 'student' ? 'Date' : 'Student';

    const rows = records.map(rec => {
        const firstCell = context === 'student'
            ? escapeHTML(_formatDisplayDate(rec.date))
            : escapeHTML(_resolveStudentName(rec.studentId));

        return `
            <tr>
                <td>${firstCell}</td>
                <td>${_statusBadge(rec.status)}</td>
            </tr>`;
    }).join('');

    return `
        <div class="table-wrapper">
            <table class="history-table">
                <thead>
                    <tr>
                        <th scope="col">${firstCol}</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>`;
}

/**
 * Status badge with colour and accessible text.
 * @param {string} status - 'present' | 'absent'
 * @returns {string} HTML
 */
function _statusBadge(status) {
    const isPresent = status === 'present';
    const cls   = isPresent ? 'status-badge--present' : 'status-badge--absent';
    const label = isPresent ? 'Present' : 'Absent';
    return `<span class="status-badge ${cls}">${label}</span>`;
}

/**
 * History view header (title + subject name).
 * @param {string} subjectName
 * @param {string} title
 * @returns {string} HTML
 */
function _historyHeader(subjectName, title) {
    return `
        <div class="history-view__header">
            <h3 class="history-view__title">${escapeHTML(title)}</h3>
            <p class="history-view__subject text-muted">${escapeHTML(subjectName)}</p>
        </div>`;
}

/**
 * Empty-state block for history views.
 * @param {string} message
 * @returns {string} HTML
 */
function _buildHistoryEmpty(message) {
    return `
        <div class="empty-state" role="status" aria-live="polite">
            <div class="empty-state-icon" aria-hidden="true">🗓️</div>
            <p class="fw-bold">No history</p>
            <p class="text-muted">${escapeHTML(message)}</p>
        </div>`;
}

/**
 * Back button markup.
 * @param {string} id
 * @param {string} label
 * @returns {string} HTML
 */
function _historyBackButton(id, label) {
    return `
        <div class="history-view__actions">
            <button class="btn btn-secondary" type="button"
                    id="${id}" aria-label="${escapeHTML(label)}">
                ← ${escapeHTML(label)}
            </button>
        </div>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve a student's display name from their ID, falling back to the ID.
 * @param {string} studentId
 * @returns {string}
 */
function _resolveStudentName(studentId) {
    const student = getStudent(studentId);
    return student ? student.name : studentId;
}

/**
 * Format a YYYY-MM-DD string into a more readable display date.
 * Falls back to the raw string if parsing fails.
 * @param {string} dateStr
 * @returns {string}
 */
function _formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts.map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
}
