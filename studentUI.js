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

    // Render search / filter bar (Task 11.3)
    renderStudentFilterBar();

    // Initial list render
    refreshStudentList();
}

// ─── List rendering ───────────────────────────────────────────────────────────

/**
 * Re-render the student list inside #student-list-output.
 * Routes through _applyFilters() so active search/filter state is preserved.
 * Requirements: 1.4, 7.3
 */
function refreshStudentList() {
    // If filters are active, re-apply them; otherwise render the full list
    const hasFilter = _studentFilter.searchText !== '' || _studentFilter.atRiskOnly;
    if (hasFilter) {
        _applyFilters();
        return;
    }

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

// ─── Task 11.2: Add / Edit forms, Detail view, Delete workflow ────────────────

/**
 * Open the student form modal.
 * When studentId is provided it populates the form for editing;
 * when omitted it opens a blank Add form.
 * Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8, 9.12
 *
 * @param {string|null} studentId - Student ID to edit, or null/undefined for Add
 */
function openStudentForm(studentId) {
    const isEdit   = Boolean(studentId);
    const student  = isEdit ? getStudent(studentId) : null;

    // If editing but student not found, bail gracefully
    if (isEdit && !student) {
        showError('Student not found.');
        return;
    }

    const title = isEdit ? 'Edit Student' : 'Add Student';

    const modalHTML = `
        <div id="student-form-overlay" class="modal-overlay" role="presentation">
            <dialog id="student-form-dialog"
                    class="student-form-dialog"
                    aria-modal="true"
                    aria-labelledby="student-form-title">

                <div class="dialog-header">
                    <h3 id="student-form-title" class="dialog-title">
                        ${escapeHTML(title)}
                    </h3>
                    <button class="btn btn-icon dialog-close"
                            type="button"
                            id="student-form-close"
                            aria-label="Close dialog">
                        <svg aria-hidden="true" focusable="false"
                             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                             width="20" height="20" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5
                                     6.41 10.59 12 5 17.59 6.41 19 12
                                     13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>

                <form id="student-form" novalidate autocomplete="off">

                    <!-- Name -->
                    <div class="form-group">
                        <label for="sf-name">
                            Full Name
                            <span class="required-marker" aria-hidden="true">*</span>
                        </label>
                        <input type="text"
                               id="sf-name"
                               name="name"
                               maxlength="100"
                               autocomplete="off"
                               aria-required="true"
                               aria-describedby="sf-name-error"
                               value="${escapeHTML(student ? student.name : '')}">
                        <span id="sf-name-error"
                              class="form-error hidden"
                              role="alert"
                              aria-live="polite"></span>
                    </div>

                    <!-- Student ID — disabled in edit mode (Requirement 9.12) -->
                    <div class="form-group">
                        <label for="sf-student-id">
                            Student ID
                            <span class="required-marker" aria-hidden="true">*</span>
                        </label>
                        <input type="text"
                               id="sf-student-id"
                               name="studentId"
                               maxlength="50"
                               autocomplete="off"
                               aria-required="true"
                               aria-describedby="sf-id-hint sf-id-error"
                               ${isEdit ? 'disabled aria-disabled="true"' : ''}
                               value="${escapeHTML(student ? student.studentId : '')}">
                        ${isEdit
                            ? `<span id="sf-id-hint" class="form-hint">
                                   Student ID cannot be changed after creation.
                               </span>`
                            : `<span id="sf-id-hint" class="form-hint">
                                   1–50 characters. Must be unique.
                               </span>`}
                        <span id="sf-id-error"
                              class="form-error hidden"
                              role="alert"
                              aria-live="polite"></span>
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                        <label for="sf-email">
                            Email Address
                            <span class="required-marker" aria-hidden="true">*</span>
                        </label>
                        <input type="email"
                               id="sf-email"
                               name="email"
                               autocomplete="off"
                               aria-required="true"
                               aria-describedby="sf-email-error"
                               value="${escapeHTML(student ? student.email : '')}">
                        <span id="sf-email-error"
                              class="form-error hidden"
                              role="alert"
                              aria-live="polite"></span>
                    </div>

                    <!-- Form-level error summary -->
                    <div id="sf-form-error"
                         class="form-error-summary hidden"
                         role="alert"
                         aria-live="assertive"></div>

                    <div class="dialog-actions">
                        <button type="button"
                                id="sf-cancel"
                                class="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit"
                                id="sf-submit"
                                class="btn btn-primary">
                            ${isEdit ? 'Save Changes' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </dialog>
        </div>`;

    // Inject modal into body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('student-form-overlay');
    const dialog  = document.getElementById('student-form-dialog');
    const form    = document.getElementById('student-form');

    // Open native dialog if supported
    if (typeof dialog.showModal === 'function') dialog.showModal();

    // Focus first editable field
    const firstInput = isEdit
        ? document.getElementById('sf-name')
        : document.getElementById('sf-name');
    if (firstInput) firstInput.focus();

    // ── Submit ──────────────────────────────────────────────────────────────
    form.addEventListener('submit', e => {
        e.preventDefault();
        _handleStudentFormSubmit(isEdit, student ? student.studentId : null);
    });

    // ── Cancel / close ──────────────────────────────────────────────────────
    function closeModal() {
        if (typeof dialog.close === 'function') dialog.close();
        overlay.remove();
    }

    document.getElementById('sf-cancel').addEventListener('click', closeModal);
    document.getElementById('student-form-close').addEventListener('click', closeModal);

    // Escape key
    dialog.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
        _trapFocus(e, dialog);
    });

    // Click backdrop
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });
}

/**
 * Process the student form submission.
 * Validates, calls the appropriate module function, shows feedback.
 *
 * @param {boolean}     isEdit    - True if editing an existing student
 * @param {string|null} studentId - Existing student ID (edit only)
 */
function _handleStudentFormSubmit(isEdit, studentId) {
    // Clear previous errors
    _clearFormErrors('sf');

    const name  = document.getElementById('sf-name').value;
    const rawId = document.getElementById('sf-student-id').value;
    const email = document.getElementById('sf-email').value;

    // In edit mode the ID field is disabled; use the original ID
    const id = isEdit ? studentId : rawId;

    showLoading();

    let result;
    if (isEdit) {
        result = updateStudent(studentId, { name, email });
    } else {
        result = addStudent(name, email, id);
    }

    hideLoading();

    if (!result.success) {
        _displayFormErrors('sf', result.errors);
        return;
    }

    // Close modal
    const overlay = document.getElementById('student-form-overlay');
    const dialog  = document.getElementById('student-form-dialog');
    if (dialog && typeof dialog.close === 'function') dialog.close();
    if (overlay) overlay.remove();

    // Refresh list + toast
    refreshStudentList();
    showSuccess(isEdit
        ? `Student "${result.student.name}" updated successfully.`
        : `Student "${result.student.name}" added successfully.`
    );
}

// ─── Student detail view ──────────────────────────────────────────────────────

/**
 * Open the full student detail view.
 * Replaces the fallback introduced in Task 11.1.
 * Requirements: 1.5, 7.3
 *
 * @param {string} studentId
 */
function openStudentDetail(studentId) {
    const student = getStudent(studentId);
    if (!student) {
        showError('Student not found.');
        return;
    }

    navigateToDetail('students', student.name);

    const atRisk       = isStudentAtRisk(studentId);
    const atRiskBadge  = atRisk ? _buildAtRiskBadge() : '';
    const atRiskNote   = atRisk
        ? `<p class="at-risk-note text-danger">
               <svg aria-hidden="true" focusable="false"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    width="16" height="16" fill="currentColor">
                   <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
               </svg>
               This student is at-risk (absence rate ≥ 30 %) in at least one course.
           </p>`
        : '';

    const output = document.getElementById('student-list-output');
    output.innerHTML = `
        <div class="student-detail-card card"
             role="region"
             aria-labelledby="detail-heading">

            <div class="student-detail-card__header">
                <div class="student-avatar student-avatar--lg" aria-hidden="true">
                    ${_getInitials(student.name)}
                </div>
                <div>
                    <h3 id="detail-heading" class="student-detail-card__name">
                        ${escapeHTML(student.name)}
                        ${atRiskBadge}
                    </h3>
                    ${atRiskNote}
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
                <button class="btn btn-primary"
                        type="button"
                        id="btn-detail-edit"
                        aria-label="Edit ${escapeHTML(student.name)}">
                    Edit
                </button>
                <button class="btn btn-secondary"
                        type="button"
                        id="btn-detail-history"
                        aria-label="View attendance history for ${escapeHTML(student.name)}">
                    View History
                </button>
                <button class="btn btn-danger"
                        type="button"
                        id="btn-detail-delete"
                        aria-label="Delete ${escapeHTML(student.name)}">
                    Delete
                </button>
            </div>
        </div>`;

    document.getElementById('btn-back-to-list').addEventListener('click', () => {
        navigateTo('students');
        refreshStudentList();
    });

    document.getElementById('btn-detail-edit').addEventListener('click', () => {
        openStudentForm(studentId);
    });

    document.getElementById('btn-detail-history').addEventListener('click', () => {
        if (typeof openStudentHistory === 'function') openStudentHistory(studentId);
    });

    document.getElementById('btn-detail-delete').addEventListener('click', () => {
        handleDeleteStudent(studentId);
    });
}

// ─── Delete workflow ──────────────────────────────────────────────────────────

/**
 * Confirm and delete a student.
 * Requirements: 1.9, 1.10, 1.11
 *
 * @param {string} studentId
 */
async function handleDeleteStudent(studentId) {
    const student = getStudent(studentId);
    if (!student) {
        showError('Student not found.');
        return;
    }

    // Load current data to show record count in confirmation (Requirement 1.11)
    const loadResult = loadData();
    const attendanceCount = loadResult.success
        ? loadResult.data.attendanceRecords.filter(r => r.studentId === studentId).length
        : 0;

    const countNote = attendanceCount > 0
        ? ` This will also delete ${attendanceCount} attendance record${attendanceCount !== 1 ? 's' : ''}.`
        : '';

    const confirmed = await showConfirmDialog({
        title:        'Delete Student',
        message:      `Delete "${student.name}"?${countNote}`,
        confirmLabel: 'Delete',
        cancelLabel:  'Cancel',
        confirmStyle: 'danger'
    });

    if (!confirmed) return;

    showLoading();
    const result = deleteStudent(studentId);
    hideLoading();

    if (!result.success) {
        showError('Failed to delete student: ' + result.errors.map(e => e.message).join(', '));
        return;
    }

    showSuccess(`Student "${student.name}" deleted.`);

    // Return to list (handles case where delete was triggered from detail view)
    navigateTo('students');
    refreshStudentList();
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

/**
 * Clear all field-level and form-level errors for a given form prefix.
 * @param {string} prefix - e.g. 'sf' for the student form
 */
function _clearFormErrors(prefix) {
    ['name', 'id', 'email'].forEach(field => {
        const el = document.getElementById(`${prefix}-${field}-error`);
        if (el) { el.textContent = ''; el.classList.add('hidden'); }
        // Remove aria-invalid from the corresponding input
        const input = document.querySelector(`[aria-describedby~="${prefix}-${field}-error"]`);
        if (input) input.removeAttribute('aria-invalid');
    });

    const summary = document.getElementById(`${prefix}-form-error`);
    if (summary) { summary.textContent = ''; summary.classList.add('hidden'); }
}

/**
 * Display field-level validation errors returned from a module function.
 * Requirements: 1.3, 1.8, 9.11
 *
 * @param {string} prefix - Form prefix ('sf')
 * @param {Array<{field: string, message: string}>} errors
 */
function _displayFormErrors(prefix, errors) {
    // Map module field names to form element suffixes
    const fieldMap = { name: 'name', studentId: 'id', email: 'email' };

    let firstErrorInput = null;

    errors.forEach(err => {
        const suffix  = fieldMap[err.field];
        const errorEl = suffix ? document.getElementById(`${prefix}-${suffix}-error`) : null;
        const inputEl = suffix
            ? document.querySelector(`[aria-describedby~="${prefix}-${suffix}-error"]`)
            : null;

        if (errorEl) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
        if (inputEl) {
            inputEl.setAttribute('aria-invalid', 'true');
            if (!firstErrorInput) firstErrorInput = inputEl;
        }
    });

    // Fallback: show any unmapped errors in the form-level summary
    const unmapped = errors.filter(e => !fieldMap[e.field]);
    if (unmapped.length > 0) {
        const summary = document.getElementById(`${prefix}-form-error`);
        if (summary) {
            summary.textContent = unmapped.map(e => e.message).join(' ');
            summary.classList.remove('hidden');
        }
    }

    // Move focus to the first invalid input
    if (firstErrorInput) firstErrorInput.focus();
}

/**
 * Trap keyboard focus inside a dialog element.
 * Requirements: 10.7 (keyboard navigation), WCAG 2.1.2
 *
 * @param {KeyboardEvent} e
 * @param {HTMLElement}   dialog
 */
function _trapFocus(e, dialog) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), ' +
        'select:not([disabled]), textarea:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"])'
    ));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
    }
}

// ─── Task 11.3: Search, Filter, and No-Results State ─────────────────────────

/**
 * Active filter state.
 * Mutated by the search input and at-risk toggle; read by _applyFilters().
 */
const _studentFilter = {
    searchText: '',
    atRiskOnly: false
};

/**
 * Mount the search + filter bar into #student-filter-bar.
 * Called by renderStudentSection() once the container exists.
 * Requirements: 5.1, 5.5, 5.9
 */
function renderStudentFilterBar() {
    const bar = document.getElementById('student-filter-bar');
    if (!bar) return;

    bar.innerHTML = `
        <div class="filter-bar" role="search" aria-label="Search and filter students">

            <!-- Search input (Requirement 5.1) -->
            <div class="filter-bar__search">
                <label for="student-search" class="sr-only">Search students</label>
                <div class="search-input-wrapper">
                    <svg class="search-icon" aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="18" height="18" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16
                                 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59
                                 4.23-1.57l.27.28v.79l5 4.99L20.49
                                 19l-4.99-5zm-6 0C7.01 14 5 11.99 5
                                 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99
                                 14 9.5 14z"/>
                    </svg>
                    <input type="search"
                           id="student-search"
                           class="search-input"
                           placeholder="Search by name or ID…"
                           autocomplete="off"
                           aria-controls="student-list-output"
                           aria-label="Search students by name or ID">
                </div>
            </div>

            <!-- At-risk filter toggle (Requirement 5.5) -->
            <div class="filter-bar__filters">
                <label class="filter-toggle" for="filter-at-risk">
                    <input type="checkbox"
                           id="filter-at-risk"
                           class="filter-toggle__checkbox"
                           aria-controls="student-list-output"
                           aria-label="Show only at-risk students">
                    <svg class="filter-toggle__icon" aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="16" height="16" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    At-risk only
                </label>
            </div>

            <!-- Clear button (Requirement 5.9) -->
            <button id="btn-clear-filters"
                    class="btn btn-secondary filter-bar__clear hidden"
                    type="button"
                    aria-label="Clear all search and filter criteria">
                Clear
            </button>
        </div>

        <!-- Live result count for screen readers (Requirement 5.8) -->
        <p id="student-results-count"
           class="results-count sr-only"
           role="status"
           aria-live="polite"
           aria-atomic="true"></p>`;

    _wireFilterBar();
}

/**
 * Wire event listeners for the search input, at-risk checkbox, and clear button.
 */
function _wireFilterBar() {
    const searchInput  = document.getElementById('student-search');
    const atRiskToggle = document.getElementById('filter-at-risk');
    const clearBtn     = document.getElementById('btn-clear-filters');

    if (!searchInput || !atRiskToggle || !clearBtn) return;

    // Search — debounced at 500 ms (Requirement 5.3)
    const debouncedSearch = debounce(value => {
        _studentFilter.searchText = value.trim();
        _applyFilters();
    }, 500);

    searchInput.addEventListener('input', e => {
        debouncedSearch(e.target.value);
        _updateClearButtonVisibility();
    });

    // At-risk toggle (Requirement 5.5, 5.6)
    atRiskToggle.addEventListener('change', () => {
        _studentFilter.atRiskOnly = atRiskToggle.checked;
        _applyFilters();
        _updateClearButtonVisibility();
    });

    // Clear (Requirement 5.9, 5.10)
    clearBtn.addEventListener('click', () => {
        searchInput.value          = '';
        atRiskToggle.checked       = false;
        _studentFilter.searchText  = '';
        _studentFilter.atRiskOnly  = false;
        _applyFilters();
        _updateClearButtonVisibility();
        searchInput.focus();       // return focus to search field
    });
}

/**
 * Apply the current filter state and re-render the list output.
 * Requirements: 5.2, 5.3, 5.4, 5.6, 5.7, 5.8
 */
function _applyFilters() {
    const output = document.getElementById('student-list-output');
    if (!output) return;

    // Start with all students
    let students = getAllStudents();

    // Text filter — case-insensitive partial match on name or student ID
    // (Requirement 5.2, 5.4)
    if (_studentFilter.searchText !== '') {
        const query = _studentFilter.searchText.toLowerCase();
        students = students.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.studentId.toLowerCase().includes(query)
        );
    }

    // At-risk filter — AND logic when combined with search (Requirement 5.7)
    if (_studentFilter.atRiskOnly) {
        students = students.filter(s => isStudentAtRisk(s.studentId));
    }

    // No results (Requirement 5.8)
    if (students.length === 0) {
        const isFiltered = _studentFilter.searchText !== '' || _studentFilter.atRiskOnly;
        output.innerHTML = isFiltered
            ? _buildNoResultsState()
            : _buildEmptyState();
        _updateResultCount(0);
        return;
    }

    // Sort alphabetically for stable display
    students = students.slice().sort((a, b) => a.name.localeCompare(b.name));

    output.innerHTML = `
        <ul class="student-list" role="list" aria-label="Student roster">
            ${students.map(s => _buildStudentCard(s)).join('')}
        </ul>`;

    _wireStudentCardButtons(students);
    _updateResultCount(students.length);
}

/**
 * Show/hide the Clear button based on whether any filter is active.
 * Requirement: 5.9
 */
function _updateClearButtonVisibility() {
    const clearBtn = document.getElementById('btn-clear-filters');
    if (!clearBtn) return;
    const hasFilter = _studentFilter.searchText !== '' || _studentFilter.atRiskOnly;
    clearBtn.classList.toggle('hidden', !hasFilter);
}

/**
 * Update the screen-reader-only result count announcement.
 * @param {number} count
 */
function _updateResultCount(count) {
    const el = document.getElementById('student-results-count');
    if (!el) return;
    el.textContent = count === 1
        ? '1 student found'
        : `${count} students found`;
}

/**
 * Build the "no results" state shown when filters match nothing.
 * Requirement: 5.8
 * @returns {string} HTML string
 */
function _buildNoResultsState() {
    return `
        <div class="empty-state" role="status" aria-live="polite">
            <div class="empty-state-icon" aria-hidden="true">🔍</div>
            <p class="fw-bold">No students found</p>
            <p class="text-muted">
                Try a different search term or clear the filters.
            </p>
        </div>`;
}
