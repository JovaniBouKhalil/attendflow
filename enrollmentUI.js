/**
 * enrollmentUI.js — Enrollment Management Panel
 * Task 13.2: enroll / unenroll students for a course.
 * Requirements: 3.2, 3.3
 *
 * This is a reusable panel rendered inside the course detail view.
 * It reads/writes through the existing course module enrollment functions:
 *   enrollStudent, unenrollStudent, getEnrolledStudents, getStudentCourses
 * and the student module's getAllStudents.
 *
 * Scope: enrollment only. No attendance, history, or reports.
 */

'use strict';

/**
 * Render the enrollment manager for a course into a target container.
 * Shows two columns: currently enrolled students and available (not-yet-
 * enrolled) students, each with an action button.
 * Requirements: 3.2
 *
 * @param {string} courseCode     - Course whose roster is managed
 * @param {string} containerId    - id of the element to render into
 */
function renderEnrollmentManager(courseCode, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const course = getCourse(courseCode);
    if (!course) {
        container.innerHTML = '';
        return;
    }

    const allStudents = getAllStudents();
    const enrolled    = getEnrolledStudents(courseCode);

    // Build a set of enrolled student IDs for quick lookup
    const enrolledIds = new Set(enrolled.map(s => s.studentId));
    const available   = allStudents.filter(s => !enrolledIds.has(s.studentId));

    // Sort both lists alphabetically
    const enrolledSorted  = enrolled.slice().sort((a, b) => a.name.localeCompare(b.name));
    const availableSorted = available.slice().sort((a, b) => a.name.localeCompare(b.name));

    container.innerHTML = `
        <div class="enrollment-manager" role="region"
             aria-label="Enrollment management for ${escapeHTML(course.name)}">

            <h4 class="enrollment-manager__heading">Manage Enrollment</h4>

            <div class="enrollment-columns">

                <!-- Available students column -->
                <div class="enrollment-column">
                    <h5 class="enrollment-column__title">
                        Available Students
                        <span class="text-muted">(${availableSorted.length})</span>
                    </h5>
                    <ul class="enrollment-list" id="enroll-available-list" role="list">
                        ${availableSorted.length === 0
                            ? _buildEnrollmentEmpty('All students are enrolled.')
                            : availableSorted.map(s =>
                                _buildEnrollmentRow(s, 'available')).join('')}
                    </ul>
                </div>

                <!-- Enrolled students column -->
                <div class="enrollment-column">
                    <h5 class="enrollment-column__title">
                        Enrolled Students
                        <span class="text-muted">(${enrolledSorted.length})</span>
                    </h5>
                    <ul class="enrollment-list" id="enroll-enrolled-list" role="list">
                        ${enrolledSorted.length === 0
                            ? _buildEnrollmentEmpty('No students enrolled yet.')
                            : enrolledSorted.map(s =>
                                _buildEnrollmentRow(s, 'enrolled')).join('')}
                    </ul>
                </div>
            </div>
        </div>`;

    _wireEnrollmentButtons(courseCode, containerId);
}

/**
 * Build a single enrollment row.
 * @param {Object} student
 * @param {'available'|'enrolled'} column
 * @returns {string} HTML
 */
function _buildEnrollmentRow(student, column) {
    const id = escapeHTML(student.studentId);

    const actionBtn = column === 'available'
        ? `<button class="btn btn-success btn-sm btn-enroll"
                   type="button"
                   data-student-id="${id}"
                   aria-label="Enrol ${escapeHTML(student.name)}">
               + Enrol
           </button>`
        : `<button class="btn btn-danger btn-sm btn-unenroll"
                   type="button"
                   data-student-id="${id}"
                   aria-label="Remove ${escapeHTML(student.name)} from course">
               − Remove
           </button>`;

    return `
        <li class="enrollment-row" data-student-id="${id}">
            <div class="enrollment-row__student">
                <div class="student-avatar student-avatar--sm" aria-hidden="true">
                    ${_getInitials(student.name)}
                </div>
                <div class="enrollment-row__info">
                    <span class="enrollment-row__name">${escapeHTML(student.name)}</span>
                    <span class="enrollment-row__id text-muted">ID: ${id}</span>
                </div>
            </div>
            ${actionBtn}
        </li>`;
}

/**
 * Build an empty-column placeholder.
 * @param {string} message
 * @returns {string} HTML
 */
function _buildEnrollmentEmpty(message) {
    return `
        <li class="enrollment-empty text-muted" role="listitem">
            ${escapeHTML(message)}
        </li>`;
}

/**
 * Wire enrol / unenrol buttons.
 * @param {string} courseCode
 * @param {string} containerId
 */
function _wireEnrollmentButtons(courseCode, containerId) {
    // Enrol
    document.querySelectorAll('#' + containerId + ' .btn-enroll').forEach(btn => {
        btn.addEventListener('click', () => {
            const studentId = btn.getAttribute('data-student-id');
            _handleEnroll(courseCode, studentId, containerId);
        });
    });

    // Unenrol
    document.querySelectorAll('#' + containerId + ' .btn-unenroll').forEach(btn => {
        btn.addEventListener('click', () => {
            const studentId = btn.getAttribute('data-student-id');
            _handleUnenroll(courseCode, studentId, containerId);
        });
    });
}

/**
 * Enrol a student, then re-render the panel.
 * Requirements: 3.2, 3.3
 *
 * @param {string} courseCode
 * @param {string} studentId
 * @param {string} containerId
 */
function _handleEnroll(courseCode, studentId, containerId) {
    showLoading();
    const result = enrollStudent(studentId, courseCode);
    hideLoading();

    if (!result.success) {
        showError('Could not enrol student: ' +
                  result.errors.map(e => e.message).join(', '));
        return;
    }

    const student = getStudent(studentId);
    showSuccess(`${student ? student.name : 'Student'} enrolled.`);

    renderEnrollmentManager(courseCode, containerId);
    _refreshCourseDetailCount(courseCode);
}

/**
 * Unenrol a student (with confirmation), then re-render the panel.
 * Requirements: 3.2
 *
 * @param {string} courseCode
 * @param {string} studentId
 * @param {string} containerId
 */
async function _handleUnenroll(courseCode, studentId, containerId) {
    const student = getStudent(studentId);
    const name    = student ? student.name : studentId;

    const confirmed = await showConfirmDialog({
        title:        'Remove from Course',
        message:      `Remove "${name}" from this course? ` +
                      `Their existing attendance records will be kept.`,
        confirmLabel: 'Remove',
        cancelLabel:  'Cancel',
        confirmStyle: 'danger'
    });

    if (!confirmed) return;

    showLoading();
    const result = unenrollStudent(studentId, courseCode);
    hideLoading();

    if (!result.success) {
        showError('Could not remove student: ' +
                  result.errors.map(e => e.message).join(', '));
        return;
    }

    showSuccess(`${name} removed from course.`);

    renderEnrollmentManager(courseCode, containerId);
    _refreshCourseDetailCount(courseCode);
}

/**
 * Update the "Enrolled: N students" line in the surrounding course detail view,
 * if it is present. Keeps the detail header in sync without a full re-render.
 *
 * @param {string} courseCode
 */
function _refreshCourseDetailCount(courseCode) {
    const countEl = document.getElementById('course-enrolled-count');
    if (!countEl) return;
    const count = getEnrolledStudents(courseCode).length;
    countEl.textContent = `${count} student${count !== 1 ? 's' : ''}`;
}
