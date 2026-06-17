/**
 * courseUI.js — Course List View
 * Task 12.1: render the course list, empty state, and course information.
 * Requirements: 2.9, 2.10
 *
 * Scope: read-only list rendering only.
 * Add/Edit/Delete forms and enrollment UI are Task 12.2 / 13.2.
 */

'use strict';

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Mount the course list section into #courses-content.
 * Called once by initializeApp() and again after any data mutation.
 * Requirements: 2.9
 */
function renderCourseSection() {
    const container = document.getElementById('courses-content');
    if (!container) return;

    container.innerHTML = `
        <div class="section-toolbar" role="toolbar" aria-label="Course actions">
            <button id="btn-add-course"
                    class="btn btn-primary"
                    type="button"
                    aria-label="Add a new course">
                <svg aria-hidden="true" focusable="false"
                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     width="18" height="18" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Course
            </button>
        </div>

        <!-- List output -->
        <div id="course-list-output" aria-live="polite" aria-relevant="additions removals">
            <!-- Populated by refreshCourseList() -->
        </div>`;

    // Wire the Add button (no-op until Task 12.2 implements the form)
    const addBtn = document.getElementById('btn-add-course');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (typeof openCourseForm === 'function') {
                openCourseForm();            // Task 12.2
            }
        });
    }

    refreshCourseList();
}

// ─── List rendering ───────────────────────────────────────────────────────────

/**
 * Re-render the course list inside #course-list-output.
 * Reads directly from getAllCourses() so it always reflects current data.
 * Requirements: 2.9
 */
function refreshCourseList() {
    const output = document.getElementById('course-list-output');
    if (!output) return;

    const courses = getAllCourses();

    if (courses.length === 0) {
        output.innerHTML = _buildCourseEmptyState();
        return;
    }

    // Sort alphabetically by course name for stable display
    const sorted = courses.slice().sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    const listHTML = sorted.map(course => _buildCourseCard(course)).join('');

    output.innerHTML = `
        <ul class="course-list" role="list" aria-label="Course catalogue">
            ${listHTML}
        </ul>`;

    _wireCourseCardButtons();
}

// ─── Card builder ─────────────────────────────────────────────────────────────

/**
 * Build the HTML for one course card.
 * Requirements: 2.9, 2.10
 *
 * @param {Object} course - Plain course object from storage
 * @returns {string} HTML string for a <li> card
 */
function _buildCourseCard(course) {
    // Enrolled student count for context (read-only display)
    const enrolledCount = typeof getEnrolledStudents === 'function'
        ? getEnrolledStudents(course.courseCode).length
        : 0;

    // Truncated description preview (full text shown in detail/Task 12.2)
    const descPreview = course.description
        ? escapeHTML(course.description)
        : '<span class="text-muted">No description</span>';

    return `
        <li class="course-card"
            data-course-code="${escapeHTML(course.courseCode)}"
            role="listitem">

            <div class="course-card__identity">
                <div class="course-code-badge" aria-hidden="true">
                    ${escapeHTML(course.courseCode)}
                </div>

                <div class="course-card__info">
                    <span class="course-card__name">
                        ${escapeHTML(course.name)}
                    </span>
                    <span class="course-card__code text-muted">
                        Code: ${escapeHTML(course.courseCode)}
                    </span>
                    <span class="course-card__meta text-muted">
                        ${enrolledCount} student${enrolledCount !== 1 ? 's' : ''} enrolled
                    </span>
                    <span class="course-card__desc">
                        ${descPreview}
                    </span>
                </div>
            </div>

            <div class="course-card__actions">
                <button class="btn btn-icon btn-view-course"
                        type="button"
                        data-course-code="${escapeHTML(course.courseCode)}"
                        aria-label="View details for ${escapeHTML(course.name)}">
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
                <button class="btn btn-icon btn-edit-course"
                        type="button"
                        data-course-code="${escapeHTML(course.courseCode)}"
                        aria-label="Edit ${escapeHTML(course.name)}">
                    <svg aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="20" height="20" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3
                                 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1
                                 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="btn btn-icon btn-delete-course"
                        type="button"
                        data-course-code="${escapeHTML(course.courseCode)}"
                        aria-label="Delete ${escapeHTML(course.name)}">
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

// ─── Empty state ──────────────────────────────────────────────────────────────

/**
 * Build the empty-state placeholder shown when no courses exist.
 * @returns {string} HTML string
 */
function _buildCourseEmptyState() {
    return `
        <div class="empty-state" role="status" aria-live="polite">
            <div class="empty-state-icon" aria-hidden="true">📚</div>
            <p class="fw-bold">No courses yet</p>
            <p class="text-muted">
                Click <strong>Add Course</strong> to create your first course.
            </p>
        </div>`;
}

// ─── Button wiring ────────────────────────────────────────────────────────────

/**
 * Wire View / Edit / Delete buttons on each rendered course card.
 * Handler implementations live in Task 12.2; View falls back to an inline
 * detail panel here so Requirement 2.10 is met in this task.
 */
function _wireCourseCardButtons() {
    document.querySelectorAll('.btn-view-course').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-course-code');
            if (typeof openCourseDetail === 'function') {
                openCourseDetail(code);       // Task 12.2
            } else {
                _showCourseDetailFallback(code);
            }
        });
    });

    document.querySelectorAll('.btn-edit-course').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-course-code');
            if (typeof openCourseForm === 'function') {
                openCourseForm(code);         // Task 12.2
            }
        });
    });

    document.querySelectorAll('.btn-delete-course').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-course-code');
            if (typeof handleDeleteCourse === 'function') {
                handleDeleteCourse(code);     // Task 12.2
            }
        });
    });
}

// ─── Fallback detail view (pre-Task 12.2) ────────────────────────────────────

/**
 * Minimal inline detail panel shown when the full detail view (Task 12.2)
 * is not yet implemented. Satisfies Requirement 2.10 at a basic level.
 *
 * @param {string} courseCode
 */
function _showCourseDetailFallback(courseCode) {
    const course = getCourse(courseCode);
    if (!course) return;

    const output = document.getElementById('course-list-output');
    if (!output) return;

    const enrolledCount = typeof getEnrolledStudents === 'function'
        ? getEnrolledStudents(courseCode).length
        : 0;

    output.innerHTML = `
        <div class="course-detail-card card" role="region"
             aria-label="Course detail: ${escapeHTML(course.name)}">

            <div class="course-detail-card__header">
                <div class="course-code-badge course-code-badge--lg" aria-hidden="true">
                    ${escapeHTML(course.courseCode)}
                </div>
                <h3 class="course-detail-card__name">
                    ${escapeHTML(course.name)}
                </h3>
            </div>

            <dl class="course-detail-card__fields">
                <dt>Course Code</dt>
                <dd>${escapeHTML(course.courseCode)}</dd>

                <dt>Enrolled</dt>
                <dd>${enrolledCount} student${enrolledCount !== 1 ? 's' : ''}</dd>

                <dt>Description</dt>
                <dd>${course.description
                        ? escapeHTML(course.description)
                        : '<span class="text-muted">No description</span>'}</dd>
            </dl>

            <div class="course-detail-card__actions">
                <button class="btn btn-secondary"
                        type="button"
                        id="btn-back-to-courses"
                        aria-label="Back to course list">
                    ← Back to Courses
                </button>
            </div>
        </div>`;

    document.getElementById('btn-back-to-courses')
        .addEventListener('click', refreshCourseList);
}

// ─── Task 12.2: Add / Edit forms, Detail view, Delete workflow ────────────────

/**
 * Open the course form modal.
 * When courseCode is provided it populates the form for editing;
 * when omitted it opens a blank Add form.
 * Requirements: 2.1, 2.8, 2.11, 2.12, 2.16, 9.13
 *
 * @param {string|null} courseCode - Course code to edit, or null for Add
 */
function openCourseForm(courseCode) {
    const isEdit = Boolean(courseCode);
    const course = isEdit ? getCourse(courseCode) : null;

    if (isEdit && !course) {
        showError('Course not found.');
        return;
    }

    const title = isEdit ? 'Edit Course' : 'Add Course';

    const modalHTML = `
        <div id="course-form-overlay" class="modal-overlay" role="presentation">
            <dialog id="course-form-dialog"
                    class="course-form-dialog"
                    aria-modal="true"
                    aria-labelledby="course-form-title">

                <div class="dialog-header">
                    <h3 id="course-form-title" class="dialog-title">
                        ${escapeHTML(title)}
                    </h3>
                    <button class="btn btn-icon dialog-close"
                            type="button"
                            id="course-form-close"
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

                <form id="course-form" novalidate autocomplete="off">

                    <!-- Course name -->
                    <div class="form-group">
                        <label for="cf-name">
                            Course Name
                            <span class="required-marker" aria-hidden="true">*</span>
                        </label>
                        <input type="text"
                               id="cf-name"
                               name="name"
                               maxlength="200"
                               autocomplete="off"
                               aria-required="true"
                               aria-describedby="cf-name-error"
                               value="${escapeHTML(course ? course.name : '')}">
                        <span id="cf-name-error"
                              class="form-error hidden"
                              role="alert"
                              aria-live="polite"></span>
                    </div>

                    <!-- Course code — disabled in edit mode (Requirement 9.13, 2.12) -->
                    <div class="form-group">
                        <label for="cf-code">
                            Course Code
                            <span class="required-marker" aria-hidden="true">*</span>
                        </label>
                        <input type="text"
                               id="cf-code"
                               name="courseCode"
                               maxlength="20"
                               autocomplete="off"
                               aria-required="true"
                               aria-describedby="cf-code-hint cf-code-error"
                               ${isEdit ? 'disabled aria-disabled="true"' : ''}
                               value="${escapeHTML(course ? course.courseCode : '')}">
                        ${isEdit
                            ? `<span id="cf-code-hint" class="form-hint">
                                   Course code cannot be changed after creation.
                               </span>`
                            : `<span id="cf-code-hint" class="form-hint">
                                   1–20 characters. Must be unique.
                               </span>`}
                        <span id="cf-code-error"
                              class="form-error hidden"
                              role="alert"
                              aria-live="polite"></span>
                    </div>

                    <!-- Description -->
                    <div class="form-group">
                        <label for="cf-description">Description</label>
                        <textarea id="cf-description"
                                  name="description"
                                  maxlength="1000"
                                  rows="4"
                                  aria-describedby="cf-description-hint cf-description-error"
                                  >${escapeHTML(course ? course.description : '')}</textarea>
                        <span id="cf-description-hint" class="form-hint">
                            Optional. Up to 1000 characters.
                        </span>
                        <span id="cf-description-error"
                              class="form-error hidden"
                              role="alert"
                              aria-live="polite"></span>
                    </div>

                    <!-- Form-level error summary -->
                    <div id="cf-form-error"
                         class="form-error-summary hidden"
                         role="alert"
                         aria-live="assertive"></div>

                    <div class="dialog-actions">
                        <button type="button"
                                id="cf-cancel"
                                class="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit"
                                id="cf-submit"
                                class="btn btn-primary">
                            ${isEdit ? 'Save Changes' : 'Add Course'}
                        </button>
                    </div>
                </form>
            </dialog>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('course-form-overlay');
    const dialog  = document.getElementById('course-form-dialog');
    const form    = document.getElementById('course-form');

    if (typeof dialog.showModal === 'function') dialog.showModal();

    // Focus the first editable field
    document.getElementById('cf-name').focus();

    // Submit
    form.addEventListener('submit', e => {
        e.preventDefault();
        _handleCourseFormSubmit(isEdit, course ? course.courseCode : null);
    });

    // Cancel / close
    function closeModal() {
        if (typeof dialog.close === 'function') dialog.close();
        overlay.remove();
    }
    document.getElementById('cf-cancel').addEventListener('click', closeModal);
    document.getElementById('course-form-close').addEventListener('click', closeModal);

    // Escape + focus trap (reuse the global _trapFocus from studentUI.js)
    dialog.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
        if (typeof _trapFocus === 'function') _trapFocus(e, dialog);
    });

    // Backdrop click
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });
}

/**
 * Process the course form submission.
 * Validates via the module, displays errors, or saves and refreshes.
 * Requirements: 2.2-2.7, 2.8, 2.13-2.16, 9.13
 *
 * @param {boolean}     isEdit     - True if editing an existing course
 * @param {string|null} courseCode - Existing course code (edit only)
 */
function _handleCourseFormSubmit(isEdit, courseCode) {
    _clearCourseFormErrors();

    const name        = document.getElementById('cf-name').value;
    const rawCode     = document.getElementById('cf-code').value;
    const description = document.getElementById('cf-description').value;

    // In edit mode the code field is disabled; use the original code
    const code = isEdit ? courseCode : rawCode;

    showLoading();

    let result;
    if (isEdit) {
        result = updateCourse(courseCode, { name, description });
    } else {
        result = addCourse(name, code, description);
    }

    hideLoading();

    if (!result.success) {
        _displayCourseFormErrors(result.errors);
        return;
    }

    // Close modal
    const overlay = document.getElementById('course-form-overlay');
    const dialog  = document.getElementById('course-form-dialog');
    if (dialog && typeof dialog.close === 'function') dialog.close();
    if (overlay) overlay.remove();

    refreshCourseList();
    showSuccess(isEdit
        ? `Course "${result.course.name}" updated successfully.`
        : `Course "${result.course.name}" added successfully.`
    );
}

// ─── Course detail view ───────────────────────────────────────────────────────

/**
 * Open the full course detail view (replaces the Task 12.1 fallback).
 * Requirements: 2.10
 *
 * @param {string} courseCode
 */
function openCourseDetail(courseCode) {
    const course = getCourse(courseCode);
    if (!course) {
        showError('Course not found.');
        return;
    }

    navigateToDetail('courses', course.name);

    const enrolledCount = typeof getEnrolledStudents === 'function'
        ? getEnrolledStudents(courseCode).length
        : 0;

    const output = document.getElementById('course-list-output');
    output.innerHTML = `
        <div class="course-detail-card card"
             role="region"
             aria-labelledby="course-detail-heading">

            <div class="course-detail-card__header">
                <div class="course-code-badge course-code-badge--lg" aria-hidden="true">
                    ${escapeHTML(course.courseCode)}
                </div>
                <h3 id="course-detail-heading" class="course-detail-card__name">
                    ${escapeHTML(course.name)}
                </h3>
            </div>

            <dl class="course-detail-card__fields">
                <dt>Course Code</dt>
                <dd>${escapeHTML(course.courseCode)}</dd>

                <dt>Enrolled</dt>
                <dd><span id="course-enrolled-count">${enrolledCount} student${enrolledCount !== 1 ? 's' : ''}</span></dd>

                <dt>Description</dt>
                <dd>${course.description
                        ? escapeHTML(course.description)
                        : '<span class="text-muted">No description</span>'}</dd>
            </dl>

            <!-- Enrollment management panel (Task 13.2) -->
            <div id="course-enrollment-panel"></div>

            <div class="course-detail-card__actions">
                <button class="btn btn-secondary"
                        type="button"
                        id="btn-back-to-courses"
                        aria-label="Back to course list">
                    ← Back to Courses
                </button>
                <button class="btn btn-primary"
                        type="button"
                        id="btn-detail-edit-course"
                        aria-label="Edit ${escapeHTML(course.name)}">
                    Edit
                </button>
                <button class="btn btn-danger"
                        type="button"
                        id="btn-detail-delete-course"
                        aria-label="Delete ${escapeHTML(course.name)}">
                    Delete
                </button>
            </div>
        </div>`;

    document.getElementById('btn-back-to-courses').addEventListener('click', () => {
        navigateTo('courses');
        refreshCourseList();
    });
    document.getElementById('btn-detail-edit-course').addEventListener('click', () => {
        openCourseForm(courseCode);
    });
    document.getElementById('btn-detail-delete-course').addEventListener('click', () => {
        handleDeleteCourse(courseCode);
    });

    // Mount the enrollment manager panel (Task 13.2)
    if (typeof renderEnrollmentManager === 'function') {
        renderEnrollmentManager(courseCode, 'course-enrollment-panel');
    }
}

// ─── Delete workflow ──────────────────────────────────────────────────────────

/**
 * Confirm and delete a course.
 * Requirements: 2.17, 2.18, 2.19, 2.20, 2.21
 *
 * @param {string} courseCode
 */
async function handleDeleteCourse(courseCode) {
    const course = getCourse(courseCode);
    if (!course) {
        showError('Course not found.');
        return;
    }

    // Count associated attendance records for the confirmation (Requirement 2.19)
    const loadResult = loadData();
    const attendanceCount = loadResult.success
        ? loadResult.data.attendanceRecords.filter(r => r.courseCode === courseCode).length
        : 0;

    const countNote = attendanceCount > 0
        ? ` This will also delete ${attendanceCount} attendance record${attendanceCount !== 1 ? 's' : ''}.`
        : '';

    const confirmed = await showConfirmDialog({
        title:        'Delete Course',
        message:      `Delete "${course.name}" (${course.courseCode})?${countNote}`,
        confirmLabel: 'Delete',
        cancelLabel:  'Cancel',
        confirmStyle: 'danger'
    });

    // Cancelled (Requirement 2.21)
    if (!confirmed) return;

    showLoading();
    const result = deleteCourse(courseCode);
    hideLoading();

    if (!result.success) {
        showError('Failed to delete course: ' +
                  result.errors.map(e => e.message).join(', '));
        return;
    }

    showSuccess(`Course "${course.name}" deleted.`);

    navigateTo('courses');
    refreshCourseList();
}

// ─── Course form error helpers ────────────────────────────────────────────────

/**
 * Clear all field-level and form-level errors on the course form.
 */
function _clearCourseFormErrors() {
    ['name', 'code', 'description'].forEach(field => {
        const el = document.getElementById(`cf-${field}-error`);
        if (el) { el.textContent = ''; el.classList.add('hidden'); }
        const input = document.querySelector(`[aria-describedby~="cf-${field}-error"]`);
        if (input) input.removeAttribute('aria-invalid');
    });
    const summary = document.getElementById('cf-form-error');
    if (summary) { summary.textContent = ''; summary.classList.add('hidden'); }
}

/**
 * Display validation errors from the course module on the form.
 * Requirements: 2.2-2.7, 2.13-2.15, 9.11
 *
 * @param {Array<{field: string, message: string}>} errors
 */
function _displayCourseFormErrors(errors) {
    // Map module field names to form element suffixes
    const fieldMap = { name: 'name', courseCode: 'code', description: 'description' };

    let firstErrorInput = null;

    errors.forEach(err => {
        const suffix  = fieldMap[err.field];
        const errorEl = suffix ? document.getElementById(`cf-${suffix}-error`) : null;
        const inputEl = suffix
            ? document.querySelector(`[aria-describedby~="cf-${suffix}-error"]`)
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

    // Unmapped errors → form-level summary
    const unmapped = errors.filter(e => !fieldMap[e.field]);
    if (unmapped.length > 0) {
        const summary = document.getElementById('cf-form-error');
        if (summary) {
            summary.textContent = unmapped.map(e => e.message).join(' ');
            summary.classList.remove('hidden');
        }
    }

    if (firstErrorInput) firstErrorInput.focus();
}
