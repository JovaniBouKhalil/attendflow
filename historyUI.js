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

/**
 * Tracks the currently displayed history view so it can be re-rendered
 * after an edit. { type: 'student'|'course', id: string }
 */
let _historyContext = null;

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

    _historyContext = { type: 'student', id: studentId };

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
    _wireAttendanceEditButtons();
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

    _historyContext = { type: 'course', id: courseCode };

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
    _wireAttendanceEditButtons();
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

        const recId = escapeHTML(rec.id);

        return `
            <tr data-record-id="${recId}">
                <td>${firstCell}</td>
                <td class="history-status-cell" data-record-id="${recId}">
                    ${_statusBadge(rec.status)}
                </td>
                <td class="history-action-cell">
                    <button class="btn btn-icon btn-edit-attendance"
                            type="button"
                            data-record-id="${recId}"
                            data-current-status="${escapeHTML(rec.status)}"
                            aria-label="Edit attendance status">
                        <svg aria-hidden="true" focusable="false"
                             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                             width="18" height="18" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3
                                     17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1
                                     1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                </td>
            </tr>`;
    }).join('');

    return `
        <div class="table-wrapper">
            <table class="history-table">
                <thead>
                    <tr>
                        <th scope="col">${firstCol}</th>
                        <th scope="col">Status</th>
                        <th scope="col"><span class="sr-only">Actions</span></th>
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

// ─── Task 14.2: Editing attendance status from history ────────────────────────

/**
 * Wire all "Edit attendance" buttons in the current history view.
 * Called after every history render.
 */
function _wireAttendanceEditButtons() {
    document.querySelectorAll('.btn-edit-attendance').forEach(btn => {
        btn.addEventListener('click', () => {
            const recordId      = btn.getAttribute('data-record-id');
            const currentStatus = btn.getAttribute('data-current-status');
            _startInlineStatusEdit(recordId, currentStatus, btn);
        });
    });
}

/**
 * Replace a status cell with an inline editor (select + Save/Cancel).
 * Requirements: 4.9
 *
 * @param {string} recordId
 * @param {string} currentStatus - 'present' | 'absent'
 * @param {HTMLElement} editBtn  - the edit button that was clicked
 */
function _startInlineStatusEdit(recordId, currentStatus, editBtn) {
    const cell = document.querySelector(
        `.history-status-cell[data-record-id="${CSS.escape(recordId)}"]`
    );
    if (!cell) return;

    // Hide the row's edit button while editing
    if (editBtn) editBtn.classList.add('hidden');

    // Preserve the current cell content so Cancel can restore it
    const original = cell.innerHTML;

    cell.innerHTML = `
        <div class="status-edit" role="group" aria-label="Edit attendance status">
            <select class="status-edit__select" aria-label="Attendance status">
                <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>
                    Present
                </option>
                <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>
                    Absent
                </option>
            </select>
            <button type="button" class="btn btn-success btn-sm status-edit__save"
                    aria-label="Save attendance status">Save</button>
            <button type="button" class="btn btn-secondary btn-sm status-edit__cancel"
                    aria-label="Cancel editing">Cancel</button>
        </div>`;

    const select = cell.querySelector('.status-edit__select');
    const saveBtn = cell.querySelector('.status-edit__save');
    const cancelBtn = cell.querySelector('.status-edit__cancel');

    if (select) select.focus();

    // Cancel — restore original cell and show the edit button again
    function cancel() {
        cell.innerHTML = original;
        if (editBtn) editBtn.classList.remove('hidden');
    }

    cancelBtn.addEventListener('click', cancel);

    // Escape cancels
    cell.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    });

    // Save
    saveBtn.addEventListener('click', () => {
        _saveInlineStatusEdit(recordId, select.value);
    });
}

/**
 * Persist an edited attendance status and refresh the view + statistics.
 * Requirements: 4.10, 4.11, 4.12
 *
 * @param {string} recordId
 * @param {string} newStatus - 'present' | 'absent'
 */
function _saveInlineStatusEdit(recordId, newStatus) {
    showLoading();

    // Update the record via the existing module function (Requirement 4.10)
    const result = updateAttendanceRecord(recordId, newStatus);

    if (!result.success) {
        hideLoading();
        // Validation / failure feedback (Requirement 4.12)
        showError('Could not update attendance: ' +
                  result.errors.map(e => e.message).join(', '));
        return;
    }

    // Recalculate absence rate + at-risk status for the affected pair
    // (Requirements 4.11, 7.7)
    if (typeof recalculateStatistics === 'function' && result.record) {
        recalculateStatistics(result.record.studentId, result.record.courseCode);
    }

    hideLoading();
    showSuccess('Attendance updated.');

    // Re-render the current history view so it reflects the change
    _rerenderHistory();
}

/**
 * Re-render whichever history view is currently active.
 * Uses _historyContext set by the open* functions.
 */
function _rerenderHistory() {
    if (!_historyContext) return;
    if (_historyContext.type === 'student') {
        openStudentHistory(_historyContext.id);
    } else if (_historyContext.type === 'course') {
        openCourseHistory(_historyContext.id);
    }
}
