/**
 * attendanceUI.js — Attendance Recording View
 * Task 13.1: course + date selection, enrolled student roster,
 * present/absent controls, save and load existing attendance.
 * Requirements: 3.1, 3.4, 3.5, 3.6, 3.7, 3.8, 3.11, 3.12
 *
 * Scope: recording interface only.
 * Enrollment management (Task 13.2) and history viewing (Task 14) are excluded.
 */

'use strict';

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Mount the attendance recording section into #attendance-content.
 * Requirements: 3.1
 */
function renderAttendanceSection() {
    const container = document.getElementById('attendance-content');
    if (!container) return;

    const courses = getAllCourses();
    const today   = getTodayDate();

    container.innerHTML = `
        <form id="attendance-selector" class="attendance-selector card" novalidate>
            <div class="attendance-selector__fields">
                <!-- Course selector (Requirement 3.1) -->
                <div class="form-group">
                    <label for="att-course">Course</label>
                    <select id="att-course"
                            name="course"
                            aria-describedby="att-course-error">
                        <option value="">— Select a course —</option>
                        ${courses
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(c => `
                                <option value="${escapeHTML(c.courseCode)}">
                                    ${escapeHTML(c.name)} (${escapeHTML(c.courseCode)})
                                </option>`)
                            .join('')}
                    </select>
                    <span id="att-course-error"
                          class="form-error hidden"
                          role="alert" aria-live="polite"></span>
                </div>

                <!-- Date selector (Requirement 3.1, 3.8) -->
                <div class="form-group">
                    <label for="att-date">Date</label>
                    <input type="date"
                           id="att-date"
                           name="date"
                           max="${today}"
                           value="${today}"
                           aria-describedby="att-date-hint att-date-error">
                    <span id="att-date-hint" class="form-hint">
                        Future dates are not allowed.
                    </span>
                    <span id="att-date-error"
                          class="form-error hidden"
                          role="alert" aria-live="polite"></span>
                </div>
            </div>
        </form>

        ${courses.length === 0 ? _buildNoCoursesState() : ''}

        <!-- Roster output -->
        <div id="attendance-roster"
             aria-live="polite"
             aria-relevant="additions removals">
            <!-- Populated by loadAttendanceRoster() -->
        </div>`;

    if (courses.length === 0) return;

    // Wire selectors — reload roster whenever course or date changes
    const courseSel = document.getElementById('att-course');
    const dateInput = document.getElementById('att-date');

    courseSel.addEventListener('change', loadAttendanceRoster);
    dateInput.addEventListener('change', loadAttendanceRoster);
}

// ─── Roster loading ───────────────────────────────────────────────────────────

/**
 * Load and render the enrolled-student roster for the selected course + date.
 * Pre-populates present/absent controls from any existing records.
 * Requirements: 3.4, 3.5, 3.6, 3.8, 3.11
 */
function loadAttendanceRoster() {
    const roster    = document.getElementById('attendance-roster');
    const courseSel = document.getElementById('att-course');
    const dateInput = document.getElementById('att-date');
    if (!roster || !courseSel || !dateInput) return;

    _clearAttendanceErrors();

    const courseCode = courseSel.value;
    const date       = dateInput.value;

    // Nothing selected yet
    if (!courseCode) {
        roster.innerHTML = '';
        return;
    }

    // Validate date (format + not future) (Requirement 3.8, 3.11)
    const dateCheck = validateAttendanceDate(date);
    if (!dateCheck.valid) {
        _showFieldError('att-date-error', 'att-date', dateCheck.error);
        roster.innerHTML = '';
        return;
    }

    // Enrolled students (Requirement 3.4)
    const enrolled = getEnrolledStudents(courseCode);

    // No enrolled students (Requirement 3.5)
    if (enrolled.length === 0) {
        roster.innerHTML = _buildNoEnrolledState();
        return;
    }

    // Existing attendance for this course/date, keyed by studentId (Requirement 3.8 load)
    const existing = getAttendance(courseCode, date);
    const statusByStudent = {};
    existing.forEach(rec => { statusByStudent[rec.studentId] = rec.status; });

    // Sort roster alphabetically
    const sorted = enrolled.slice().sort((a, b) => a.name.localeCompare(b.name));

    const rowsHTML = sorted.map(student =>
        _buildAttendanceRow(student, statusByStudent[student.studentId])
    ).join('');

    roster.innerHTML = `
        <div class="attendance-roster-card card">
            <div class="attendance-roster__header">
                <h3 class="attendance-roster__title">
                    Mark Attendance
                    <span class="text-muted attendance-roster__count">
                        (${sorted.length} student${sorted.length !== 1 ? 's' : ''})
                    </span>
                </h3>
                <div class="attendance-bulk" role="group" aria-label="Mark all students">
                    <button type="button" class="btn btn-secondary btn-sm"
                            id="att-mark-all-present">All Present</button>
                    <button type="button" class="btn btn-secondary btn-sm"
                            id="att-mark-all-absent">All Absent</button>
                </div>
            </div>

            <ul class="attendance-list" role="list">
                ${rowsHTML}
            </ul>

            <div id="att-form-error"
                 class="form-error-summary hidden"
                 role="alert" aria-live="assertive"></div>

            <div class="attendance-actions">
                <button type="button" id="att-save" class="btn btn-success">
                    Save Attendance
                </button>
            </div>
        </div>`;

    _wireRosterControls(courseCode, date);
}

// ─── Row builder ──────────────────────────────────────────────────────────────

/**
 * Build one attendance row with present/absent radio controls.
 * Requirements: 3.6
 *
 * @param {Object} student        - Enrolled student
 * @param {string|undefined} status - Existing status ('present'|'absent') if any
 * @returns {string} HTML string
 */
function _buildAttendanceRow(student, status) {
    const id          = escapeHTML(student.studentId);
    const presentChk  = status === 'present' ? 'checked' : '';
    const absentChk   = status === 'absent'  ? 'checked' : '';
    const groupName   = `att-status-${id}`;

    return `
        <li class="attendance-row" data-student-id="${id}">
            <div class="attendance-row__student">
                <div class="student-avatar student-avatar--sm" aria-hidden="true">
                    ${_getInitials(student.name)}
                </div>
                <div class="attendance-row__info">
                    <span class="attendance-row__name">${escapeHTML(student.name)}</span>
                    <span class="attendance-row__id text-muted">ID: ${id}</span>
                </div>
            </div>

            <div class="attendance-row__controls"
                 role="radiogroup"
                 aria-label="Attendance status for ${escapeHTML(student.name)}">
                <label class="status-option status-option--present">
                    <input type="radio"
                           name="${groupName}"
                           value="present"
                           ${presentChk}>
                    <span>Present</span>
                </label>
                <label class="status-option status-option--absent">
                    <input type="radio"
                           name="${groupName}"
                           value="absent"
                           ${absentChk}>
                    <span>Absent</span>
                </label>
            </div>
        </li>`;
}

// ─── Control wiring ───────────────────────────────────────────────────────────

/**
 * Wire the bulk-mark buttons and the Save button.
 *
 * @param {string} courseCode
 * @param {string} date
 */
function _wireRosterControls(courseCode, date) {
    // Bulk mark all present / absent
    const allPresent = document.getElementById('att-mark-all-present');
    const allAbsent  = document.getElementById('att-mark-all-absent');

    if (allPresent) {
        allPresent.addEventListener('click', () => _bulkMark('present'));
    }
    if (allAbsent) {
        allAbsent.addEventListener('click', () => _bulkMark('absent'));
    }

    // Save
    const saveBtn = document.getElementById('att-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => _handleSaveAttendance(courseCode, date));
    }
}

/**
 * Set every student's radio to the given status.
 * @param {'present'|'absent'} status
 */
function _bulkMark(status) {
    document.querySelectorAll('.attendance-row').forEach(row => {
        const radio = row.querySelector(`input[value="${status}"]`);
        if (radio) radio.checked = true;
        row.classList.remove('attendance-row--error');
    });
}

// ─── Save handler ─────────────────────────────────────────────────────────────

/**
 * Gather the marked statuses and save via recordAttendance().
 * Enforces that every enrolled student is marked (Requirement 3.12).
 * Requirements: 3.4, 3.7, 3.10, 3.12
 *
 * @param {string} courseCode
 * @param {string} date
 */
function _handleSaveAttendance(courseCode, date) {
    _clearAttendanceErrors();

    const rows = Array.from(document.querySelectorAll('.attendance-row'));
    const records = [];
    const unmarked = [];

    rows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        const checked   = row.querySelector('input[type="radio"]:checked');

        if (!checked) {
            unmarked.push({ row, studentId });
        } else {
            records.push({ studentId, status: checked.value });
        }
    });

    // Completeness check (Requirement 3.12)
    if (unmarked.length > 0) {
        unmarked.forEach(u => u.row.classList.add('attendance-row--error'));
        _showFormError(
            `Please mark attendance for all students. ` +
            `${unmarked.length} student${unmarked.length !== 1 ? 's are' : ' is'} unmarked.`
        );
        // Focus the first unmarked row's first radio
        const firstRadio = unmarked[0].row.querySelector('input[type="radio"]');
        if (firstRadio) firstRadio.focus();
        return;
    }

    showLoading();
    const result = recordAttendance(courseCode, date, records);
    hideLoading();

    if (!result.success) {
        _showFormError(result.errors.map(e => e.message).join(' '));
        return;
    }

    showSuccess(`Attendance saved for ${result.savedCount} student${result.savedCount !== 1 ? 's' : ''}.`);

    // Reload roster so it reflects the now-persisted statuses
    loadAttendanceRoster();
}

// ─── Empty / error states ─────────────────────────────────────────────────────

/**
 * State shown when no courses exist at all.
 * @returns {string} HTML
 */
function _buildNoCoursesState() {
    return `
        <div class="empty-state" role="status" aria-live="polite">
            <div class="empty-state-icon" aria-hidden="true">📚</div>
            <p class="fw-bold">No courses available</p>
            <p class="text-muted">
                Create a course first, then return here to record attendance.
            </p>
        </div>`;
}

/**
 * State shown when the selected course has no enrolled students.
 * Requirement: 3.5
 * @returns {string} HTML
 */
function _buildNoEnrolledState() {
    return `
        <div class="empty-state" role="status" aria-live="polite">
            <div class="empty-state-icon" aria-hidden="true">👥</div>
            <p class="fw-bold">No students enrolled</p>
            <p class="text-muted">
                Enrol students in this course before recording attendance.
            </p>
        </div>`;
}

// ─── Error helpers ────────────────────────────────────────────────────────────

/** Clear all attendance field and form errors. */
function _clearAttendanceErrors() {
    ['att-course-error', 'att-date-error'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.classList.add('hidden'); }
    });
    ['att-course', 'att-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('aria-invalid');
    });
    const summary = document.getElementById('att-form-error');
    if (summary) { summary.textContent = ''; summary.classList.add('hidden'); }

    document.querySelectorAll('.attendance-row--error')
        .forEach(r => r.classList.remove('attendance-row--error'));
}

/**
 * Show a single field-level error.
 * @param {string} errorId - id of the error span
 * @param {string} inputId - id of the related input
 * @param {string} message
 */
function _showFieldError(errorId, inputId, message) {
    const el    = document.getElementById(errorId);
    const input = document.getElementById(inputId);
    if (el)    { el.textContent = message; el.classList.remove('hidden'); }
    if (input) { input.setAttribute('aria-invalid', 'true'); }
}

/**
 * Show the form-level error summary in the roster card.
 * @param {string} message
 */
function _showFormError(message) {
    const summary = document.getElementById('att-form-error');
    if (summary) {
        summary.textContent = message;
        summary.classList.remove('hidden');
    }
}
