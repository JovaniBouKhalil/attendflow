/**
 * reportsUI.js — Reports Section
 * Task 15.1: Course Summary Report.
 * Requirements: 6.2, 6.4, 6.5, 6.8, 6.9, 6.10, 6.12
 *
 * Data comes from the existing report module functions:
 *   getCourseSummaries()         → one row per course
 *   generateCourseReport(code)   → detailed per-student breakdown
 *
 * Scope: course summary + course detail report only.
 * Student reports (15.2) and at-risk reports (15.3) are excluded.
 */

'use strict';

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Mount the reports section into #reports-content.
 * Requirements: 6.4, 6.10
 */
function renderReportsSection() {
    const container = document.getElementById('reports-content');
    if (!container) return;

    container.innerHTML = `
        <div id="reports-output">
            <!-- Populated by renderCourseSummaryReport() -->
        </div>`;

    renderCourseSummaryReport();
}

// ─── Course summary report ────────────────────────────────────────────────────

/**
 * Render the course summary table for all courses.
 * Requirements: 6.2, 6.4, 6.5, 6.8, 6.9, 6.12
 */
function renderCourseSummaryReport() {
    const output = document.getElementById('reports-output');
    if (!output) return;

    // Clear any detail breadcrumb when at the top-level report
    if (typeof clearBreadcrumb === 'function') clearBreadcrumb();

    showLoading();
    const summaries = getCourseSummaries();
    hideLoading();

    // Empty state — no courses at all
    if (summaries.length === 0) {
        output.innerHTML = `
            <div class="report-view card">
                <h3 class="report-view__title">Course Summary Report</h3>
                <div class="empty-state" role="status" aria-live="polite">
                    <div class="empty-state-icon" aria-hidden="true">📊</div>
                    <p class="fw-bold">No courses to report on</p>
                    <p class="text-muted">
                        Create a course and record attendance to see reports here.
                    </p>
                </div>
            </div>`;
        return;
    }

    const rows = summaries.map(s => _buildCourseSummaryRow(s)).join('');

    output.innerHTML = `
        <div class="report-view card" role="region" aria-label="Course summary report">
            <h3 class="report-view__title">Course Summary Report</h3>
            <p class="report-view__subtitle text-muted">
                Attendance overview across all courses.
            </p>

            <div class="table-wrapper">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th scope="col">Course</th>
                            <th scope="col">Code</th>
                            <th scope="col">Sessions</th>
                            <th scope="col">Students</th>
                            <th scope="col">Avg. Absence Rate</th>
                            <th scope="col"><span class="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>`;

    _wireCourseSummaryButtons();
}

/**
 * Build one row of the course summary table.
 * Requirements: 6.2, 6.5, 6.8, 6.9, 6.12
 *
 * @param {Object} summary - { courseCode, courseName, totalSessions, studentCount, averageAbsenceRate }
 * @returns {string} HTML
 */
function _buildCourseSummaryRow(summary) {
    const code = escapeHTML(summary.courseCode);

    // Average absence rate — "N/A" when null (Requirement 6.12)
    const rateCell = summary.averageAbsenceRate === null
        ? '<span class="text-muted">N/A</span>'
        : _rateBadge(summary.averageAbsenceRate);

    return `
        <tr data-course-code="${code}">
            <td>${escapeHTML(summary.courseName)}</td>
            <td>${code}</td>
            <td>${summary.totalSessions}</td>
            <td>${summary.studentCount}</td>
            <td>${rateCell}</td>
            <td class="report-action-cell">
                <button class="btn btn-secondary btn-sm btn-view-course-report"
                        type="button"
                        data-course-code="${code}"
                        aria-label="View detailed report for ${escapeHTML(summary.courseName)}">
                    View
                </button>
            </td>
        </tr>`;
}

/**
 * Build a colour-coded absence-rate badge.
 * Requirement: 6.8, 6.9
 *  green  : 0 – 9.9 %
 *  yellow : 10 – 29.9 %
 *  red    : ≥ 30 %
 *
 * @param {number} rate - absence rate, 1 decimal
 * @returns {string} HTML
 */
function _rateBadge(rate) {
    let cls = 'rate-low';
    if (rate >= 30.0)      cls = 'rate-high';
    else if (rate >= 10.0) cls = 'rate-mid';
    // toFixed(1) ensures one decimal place display (Requirement 6.8)
    return `<span class="rate-badge ${cls}">${rate.toFixed(1)}%</span>`;
}

/** Wire the per-row "View" buttons to open the detailed course report. */
function _wireCourseSummaryButtons() {
    document.querySelectorAll('.btn-view-course-report').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-course-code');
            openCourseReport(code);
        });
    });
}

// ─── Detailed course report ───────────────────────────────────────────────────

/**
 * Render the detailed report for a single course: per-student absence
 * breakdown plus the course average.
 * Requirements: 6.1, 6.3, 6.5, 6.8, 6.9, 6.12
 *
 * @param {string} courseCode
 */
function openCourseReport(courseCode) {
    const output = document.getElementById('reports-output');
    if (!output) return;

    showLoading();
    const report = generateCourseReport(courseCode);
    hideLoading();

    if (!report) {
        showError('Course report not found.');
        return;
    }

    // Breadcrumb: Reports › [Course name]
    if (typeof navigateToDetail === 'function') {
        navigateToDetail('reports', `${report.courseName} — Report`);
    }

    // Average absence rate (Requirement 6.5, 6.12)
    const avgCell = report.averageAbsenceRate === null
        ? '<span class="text-muted">N/A</span>'
        : _rateBadge(report.averageAbsenceRate);

    // Per-student rows
    const studentRows = report.studentStats.length === 0
        ? `<tr><td colspan="4" class="text-center text-muted">
               No attendance records for this course yet.
           </td></tr>`
        : report.studentStats.map(st => {
            const rate = st.rate === null
                ? '<span class="text-muted">N/A</span>'
                : _rateBadge(st.rate);
            return `
                <tr>
                    <td>${escapeHTML(st.studentName)}</td>
                    <td>${st.presences}</td>
                    <td>${st.absences}</td>
                    <td>${rate}</td>
                </tr>`;
        }).join('');

    output.innerHTML = `
        <div class="report-view card" role="region"
             aria-label="Detailed report for ${escapeHTML(report.courseName)}">

            <div class="report-view__header">
                <h3 class="report-view__title">${escapeHTML(report.courseName)}</h3>
                <p class="report-view__subtitle text-muted">
                    ${escapeHTML(report.courseCode)}
                </p>
            </div>

            <div class="report-stats">
                <div class="report-stat">
                    <span class="report-stat__value">${report.totalSessions}</span>
                    <span class="report-stat__label">Sessions</span>
                </div>
                <div class="report-stat">
                    <span class="report-stat__value">${report.studentStats.length}</span>
                    <span class="report-stat__label">Students with data</span>
                </div>
                <div class="report-stat">
                    <span class="report-stat__value">${avgCell}</span>
                    <span class="report-stat__label">Avg. absence rate</span>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th scope="col">Student</th>
                            <th scope="col">Present</th>
                            <th scope="col">Absent</th>
                            <th scope="col">Absence Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentRows}
                    </tbody>
                </table>
            </div>

            <div class="report-view__actions">
                <button class="btn btn-secondary" type="button"
                        id="btn-report-back"
                        aria-label="Back to course summary report">
                    ← Back to Summary
                </button>
            </div>
        </div>`;

    const back = document.getElementById('btn-report-back');
    if (back) {
        back.addEventListener('click', () => {
            navigateTo('reports');
            renderCourseSummaryReport();
        });
    }
}
