/**
 * studentUI.js — Student List View
 * Task 11.1: render the student list, empty state, and at-risk indicators.
 * Requirements: 1.4, 1.5, 7.3
 *
 * Scope: read-only list rendering only.
 * Add/Edit/Delete forms, search controls, and filter controls are Task 11.2 / 11.3.
 */

'use strict';

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Mount the student list section into #students-content.
 * Called once by initializeApp() and again after any data mutation.
 * Requirements: 1.4
 */
function renderStudentSection() {
    const container = document.getElementById('students-content');
    if (!container) return;

    // Section header with "Add Student" button placeholder (wired in Task 11.2)
    container.innerHTML = `
        <div class="section-toolbar" role="toolbar" aria-label="Student actions">
            <button id="btn-add-student"
                    class="btn btn-primary"
                    type="button"
                    aria-label="Add a new student">
                <svg aria-hidden="true" focusable="false"
                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     width="18" height="18" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Student
            </button>
        </div>

        <!-- Search / filter bar — populated in Task 11.3 -->
        <div id="student-filter-bar"></div>

        <!-- List output -->
        <div id="student-list-output" aria-live="polite" aria-relevant="additions removals">
            <!-- Populated by refreshStudentList() -->
        </div>`;

    // Wire the Add button stub (no-op until Task 11.2 implements the form)
    const addBtn = document.getElementById('btn-add-student');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (typeof openStudentForm === 'function') {
                openStudentForm();           // Task 11.2
            }
        });
    }

    // Initial list render
    refreshStudentList();
}

// ─── List rendering ───────────────────────────────────────────────────────────

/**
 * Re-render the student list inside #student-list-output.
 * Reads directly from getAllStudents() and isStudentAtRisk() so it always
 * reflects the current data state.
 * Requirements: 1.4, 7.3
 */
function refreshStudentList() {
    const output = document.getElementById('student-list-output');
    if (!output) return;

    const students = getAllStudents();

    if (students.length === 0) {
        output.innerHTML = _buildEmptyState();
        return;
    }

    // Sort alphabetically by name for stable display
    const sorted = students.slice().sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    const listHTML = sorted.map(student => _buildStudentCard(student)).join('');

    output.innerHTML = `
        <ul class="student-list" role="list" aria-label="Student roster">
            ${listHTML}
        </ul>`;

    // Wire action buttons for each card
    _wireStudentCardButtons(sorted);
}

// ─── Card builder ─────────────────────────────────────────────────────────────

/**
 * Build the HTML for one student card.
 * Requirements: 1.4, 1.5, 7.3
 *
 * @param {Object} student - Plain student object from storage
 * @returns {string} HTML string for a <li> card
 */
function _buildStudentCard(student) {
    const atRisk       = isStudentAtRisk(student.studentId);
    const atRiskBadge  = atRisk ? _buildAtRiskBadge() : '';
    const atRiskClass  = atRisk ? ' student-card--at-risk' : '';

    return `
        <li class="student-card${atRiskClass}"
            data-student-id="${escapeHTML(student.studentId)}"
            role="listitem">

            <div class="student-card__identity">
                <!-- Avatar initials -->
                <div class="student-avatar" aria-hidden="true">
                    ${_getInitials(student.name)}
                </div>

                <div class="student-card__info">
                    <span class="student-card__name">
                        ${escapeHTML(student.name)}
                        ${atRiskBadge}
                    </span>
                    <span class="student-card__id text-muted">
                        ID: ${escapeHTML(student.studentId)}
                    </span>
                    <span class="student-card__email text-muted">
                        ${escapeHTML(student.email)}
                    </span>
                </div>
            </div>

            <div class="student-card__actions">
                <button class="btn btn-icon btn-view-student"
                        type="button"
                        data-student-id="${escapeHTML(student.studentId)}"
                        aria-label="View details for ${escapeHTML(student.name)}">
                    <svg aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="20" height="20" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39
                                 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12
                                 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5
                                 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3
                                 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                </button>
                <button class="btn btn-icon btn-edit-student"
                        type="button"
                        data-student-id="${escapeHTML(student.studentId)}"
                        aria-label="Edit ${escapeHTML(student.name)}">
                    <svg aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="20" height="20" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3
                                 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1
                                 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="btn btn-icon btn-delete-student"
                        type="button"
                        data-student-id="${escapeHTML(student.studentId)}"
                        aria-label="Delete ${escapeHTML(student.name)}">
                    <svg aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="20" height="20" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19
                                 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
        </li>`;
}

// ─── At-risk badge ────────────────────────────────────────────────────────────

/**
 * Build the inline at-risk warning badge / icon.
 * Requirement: 7.3 — red warning icon next to at-risk students.
 * The visually hidden text ensures screen readers announce it.
 *
 * @returns {string} HTML string
 */
function _buildAtRiskBadge() {
    return `
        <span class="at-risk-badge"
              title="At-risk: absence rate ≥ 30% in at least one course"
              aria-label="At-risk student">
            <svg aria-hidden="true" focusable="false"
                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 width="16" height="16" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span class="sr-only">At-risk</span>
        </span>`;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

/**
 * Build the empty-state placeholder shown when no students exist.
 * @returns {string} HTML string
 */
function _buildEmptyState() {
    return `
        <div class="empty-state" role="status" aria-live="polite">
            <div class="empty-state-icon" aria-hidden="true">👩‍🎓</div>
            <p class="fw-bold">No students yet</p>
            <p class="text-muted">
                Click <strong>Add Student</strong> to add your first student.
            </p>
        </div>`;
}

// ─── Button wiring ────────────────────────────────────────────────────────────

/**
 * Wire View / Edit / Delete buttons on each rendered card.
 * The actual handler implementations live in Task 11.2.
 * Here we call them if available, or log a warning otherwise.
 *
 * @param {Array<Object>} students - Sorted student array (matches rendered order)
 */
function _wireStudentCardButtons(students) {
    // View buttons
    document.querySelectorAll('.btn-view-student').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-student-id');
            if (typeof openStudentDetail === 'function') {
                openStudentDetail(id);        // Task 11.2
            } else {
                _showStudentDetailFallback(id);
            }
        });
    });

    // Edit buttons
    document.querySelectorAll('.btn-edit-student').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-student-id');
            if (typeof openStudentForm === 'function') {
                openStudentForm(id);          // Task 11.2
            }
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete-student').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-student-id');
            if (typeof handleDeleteStudent === 'function') {
                handleDeleteStudent(id);      // Task 11.2
            }
        });
    });
}

// ─── Fallback detail view (pre-Task 11.2) ────────────────────────────────────

/**
 * Minimal inline detail panel shown when the full detail form (Task 11.2)
 * is not yet implemented. Satisfies Requirement 1.5 at a basic level.
 * Will be replaced by the proper detail view in Task 11.2.
 *
 * @param {string} studentId
 */
function _showStudentDetailFallback(studentId) {
    const student = getStudent(studentId);
    if (!student) return;

    const output = document.getElementById('student-list-output');
    if (!output) return;

    const atRisk = isStudentAtRisk(studentId);

    output.innerHTML = `
        <div class="student-detail-card card" role="region"
             aria-label="Student detail: ${escapeHTML(student.name)}">

            <div class="student-detail-card__header">
                <div class="student-avatar student-avatar--lg" aria-hidden="true">
                    ${_getInitials(student.name)}
                </div>
                <div>
                    <h3 class="student-detail-card__name">
                        ${escapeHTML(student.name)}
                        ${atRisk ? _buildAtRiskBadge() : ''}
                    </h3>
                    ${atRisk
                        ? `<p class="text-danger" style="font-size:0.85rem;margin:0">
                               At-risk: absence rate ≥ 30 % in at least one course
                           </p>`
                        : ''}
                </div>
            </div>

            <dl class="student-detail-card__fields">
                <dt>Student ID</dt>
                <dd>${escapeHTML(student.studentId)}</dd>

                <dt>Email</dt>
                <dd>
                    <a href="mailto:${escapeHTML(student.email)}">
                        ${escapeHTML(student.email)}
                    </a>
                </dd>
            </dl>

            <div class="student-detail-card__actions">
                <button class="btn btn-secondary"
                        type="button"
                        id="btn-back-to-list"
                        aria-label="Back to student list">
                    ← Back to Students
                </button>
            </div>
        </div>`;

    document.getElementById('btn-back-to-list')
        .addEventListener('click', refreshStudentList);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive up to two initials from a name for the avatar circle.
 * Examples: "Alice Johnson" → "AJ", "José" → "J"
 *
 * @param {string} name
 * @returns {string} 1–2 uppercase characters
 */
function _getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
