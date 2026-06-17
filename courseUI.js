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
