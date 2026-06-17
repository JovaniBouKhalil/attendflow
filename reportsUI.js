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
 * Provides a tab switcher between the Course and Student summary reports.
 * Requirements: 6.4, 6.6, 6.10, 6.11
 */
function renderReportsSection() {
    const container = document.getElementById('reports-content');
    if (!container) return;

    container.innerHTML = `
        <div class="report-tabs" role="tablist" aria-label="Report type">
            <button class="report-tab active"
                    id="tab-course-report"
                    role="tab"
                    type="button"
                    aria-selected="true"
                    aria-controls="reports-output">
                By Course
            </button>
            <button class="report-tab"
                    id="tab-student-report"
                    role="tab"
                    type="button"
                    aria-selected="false"
                    aria-controls="reports-output">
                By Student
            </button>
            <button class="report-tab"
                    id="tab-atrisk-report"
                    role="tab"
                    type="button"
                    aria-selected="false"
                    aria-controls="reports-output">
                At-Risk
            </button>
        </div>

        <div id="reports-output" role="tabpanel">
            <!-- Populated by the active report renderer -->
        </div>`;

    // Wire tab switching
    const courseTab  = document.getElementById('tab-course-report');
    const studentTab = document.getElementById('tab-student-report');
    const atRiskTab  = document.getElementById('tab-atrisk-report');

    courseTab.addEventListener('click', () => {
        _setActiveReportTab('course');
        renderCourseSummaryReport();
    });
    studentTab.addEventListener('click', () => {
        _setActiveReportTab('student');
        renderStudentSummaryReport();
    });
    atRiskTab.addEventListener('click', () => {
        _setActiveReportTab('atrisk');
        renderAtRiskReport();
    });

    // Default view
    _setActiveReportTab('course');
    renderCourseSummaryReport();
}

/**
 * Update the active-tab visual + ARIA state.
 * @param {'course'|'student'|'atrisk'} which
 */
function _setActiveReportTab(which) {
    const tabs = {
        course:  document.getElementById('tab-course-report'),
        student: document.getElementById('tab-student-report'),
        atrisk:  document.getElementById('tab-atrisk-report')
    };

    Object.keys(tabs).forEach(key => {
        const tab = tabs[key];
        if (!tab) return;
        const isActive = key === which;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });
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
            _setActiveReportTab('course');
            renderCourseSummaryReport();
        });
    }
}

// ─── Task 15.2: Student Summary Report ────────────────────────────────────────

/**
 * Render the student summary table for all students.
 * Requirements: 6.6, 6.11
 */
function renderStudentSummaryReport() {
    const output = document.getElementById('reports-output');
    if (!output) return;

    if (typeof clearBreadcrumb === 'function') clearBreadcrumb();

    showLoading();
    const summaries = getStudentSummaries();
    hideLoading();

    // Empty state — no students at all
    if (summaries.length === 0) {
        output.innerHTML = `
            <div class="report-view card">
                <h3 class="report-view__title">Student Summary Report</h3>
                <div class="empty-state" role="status" aria-live="polite">
                    <div class="empty-state-icon" aria-hidden="true">📊</div>
                    <p class="fw-bold">No students to report on</p>
                    <p class="text-muted">
                        Add students and record attendance to see reports here.
                    </p>
                </div>
            </div>`;
        return;
    }

    const rows = summaries.map(s => _buildStudentSummaryRow(s)).join('');

    output.innerHTML = `
        <div class="report-view card" role="region" aria-label="Student summary report">
            <h3 class="report-view__title">Student Summary Report</h3>
            <p class="report-view__subtitle text-muted">
                Attendance overview across all students.
            </p>

            <div class="table-wrapper">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th scope="col">Student</th>
                            <th scope="col">ID</th>
                            <th scope="col">Courses</th>
                            <th scope="col">Attendance Data</th>
                            <th scope="col"><span class="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>`;

    _wireStudentSummaryButtons();
}

/**
 * Build one row of the student summary table.
 * Requirements: 6.6, 6.13
 *
 * @param {Object} summary - { studentId, studentName, courseCount, hasData }
 * @returns {string} HTML
 */
function _buildStudentSummaryRow(summary) {
    const id = escapeHTML(summary.studentId);

    // Indicate whether attendance data exists (Requirement 6.13)
    const dataCell = summary.hasData
        ? '<span class="status-badge status-badge--present">Yes</span>'
        : '<span class="status-badge status-badge--none">None</span>';

    return `
        <tr data-student-id="${id}">
            <td>${escapeHTML(summary.studentName)}</td>
            <td>${id}</td>
            <td>${summary.courseCount}</td>
            <td>${dataCell}</td>
            <td class="report-action-cell">
                <button class="btn btn-secondary btn-sm btn-view-student-report"
                        type="button"
                        data-student-id="${id}"
                        aria-label="View detailed report for ${escapeHTML(summary.studentName)}">
                    View
                </button>
            </td>
        </tr>`;
}

/** Wire the per-row "View" buttons to open the detailed student report. */
function _wireStudentSummaryButtons() {
    document.querySelectorAll('.btn-view-student-report').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-student-id');
            openStudentReport(id);
        });
    });
}

/**
 * Render the detailed report for a single student: per-course absence
 * statistics across every course where they have records.
 * Requirements: 6.1, 6.3, 6.7, 6.8, 6.9, 6.13
 *
 * @param {string} studentId
 */
function openStudentReport(studentId) {
    const output = document.getElementById('reports-output');
    if (!output) return;

    showLoading();
    const report = generateStudentReport(studentId);
    hideLoading();

    if (!report) {
        showError('Student report not found.');
        return;
    }

    // Breadcrumb: Reports › [Student name]
    if (typeof navigateToDetail === 'function') {
        navigateToDetail('reports', `${report.studentName} — Report`);
    }

    // Empty state — student has no attendance data anywhere (Requirement 6.13)
    if (!report.hasData) {
        output.innerHTML = `
            <div class="report-view card" role="region"
                 aria-label="Report for ${escapeHTML(report.studentName)}">
                <div class="report-view__header">
                    <h3 class="report-view__title">${escapeHTML(report.studentName)}</h3>
                    <p class="report-view__subtitle text-muted">
                        ID: ${escapeHTML(report.studentId)}
                    </p>
                </div>
                <div class="empty-state" role="status" aria-live="polite">
                    <div class="empty-state-icon" aria-hidden="true">🗓️</div>
                    <p class="fw-bold">No attendance data</p>
                    <p class="text-muted">
                        This student has no attendance records in any course.
                    </p>
                </div>
                ${_studentReportBackButton()}
            </div>`;
        _wireStudentReportBack();
        return;
    }

    const courseRows = report.courseStats.map(cs => {
        const rate = cs.rate === null
            ? '<span class="text-muted">N/A</span>'
            : _rateBadge(cs.rate);
        return `
            <tr>
                <td>${escapeHTML(cs.courseName)}</td>
                <td>${escapeHTML(cs.courseCode)}</td>
                <td>${cs.presences}</td>
                <td>${cs.absences}</td>
                <td>${rate}</td>
            </tr>`;
    }).join('');

    output.innerHTML = `
        <div class="report-view card" role="region"
             aria-label="Report for ${escapeHTML(report.studentName)}">

            <div class="report-view__header">
                <h3 class="report-view__title">${escapeHTML(report.studentName)}</h3>
                <p class="report-view__subtitle text-muted">
                    ID: ${escapeHTML(report.studentId)}
                </p>
            </div>

            <div class="report-stats">
                <div class="report-stat">
                    <span class="report-stat__value">${report.courseStats.length}</span>
                    <span class="report-stat__label">Courses with data</span>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th scope="col">Course</th>
                            <th scope="col">Code</th>
                            <th scope="col">Present</th>
                            <th scope="col">Absent</th>
                            <th scope="col">Absence Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${courseRows}
                    </tbody>
                </table>
            </div>

            ${_studentReportBackButton()}
        </div>`;

    _wireStudentReportBack();
}

/** Back-button markup for the student report. */
function _studentReportBackButton() {
    return `
        <div class="report-view__actions">
            <button class="btn btn-secondary" type="button"
                    id="btn-student-report-back"
                    aria-label="Back to student summary report">
                ← Back to Summary
            </button>
        </div>`;
}

/** Wire the student report back button. */
function _wireStudentReportBack() {
    const back = document.getElementById('btn-student-report-back');
    if (back) {
        back.addEventListener('click', () => {
            navigateTo('reports');
            _setActiveReportTab('student');
            renderStudentSummaryReport();
        });
    }
}

// ─── Task 15.3: At-Risk Student Report ────────────────────────────────────────

/**
 * Render the at-risk student report.
 * Lists every student-course combination with an absence rate >= 30 %,
 * sorted by absence rate descending (provided by the module).
 * Requirements: 7.4, 7.5, 7.6
 */
function renderAtRiskReport() {
    const output = document.getElementById('reports-output');
    if (!output) return;

    if (typeof clearBreadcrumb === 'function') clearBreadcrumb();

    showLoading();
    const entries = getAtRiskList();   // already sorted by absenceRate desc
    hideLoading();

    // Empty state — nobody is at risk
    if (entries.length === 0) {
        output.innerHTML = `
            <div class="report-view card">
                <h3 class="report-view__title">At-Risk Students</h3>
                <div class="empty-state" role="status" aria-live="polite">
                    <div class="empty-state-icon" aria-hidden="true">✅</div>
                    <p class="fw-bold">No at-risk students</p>
                    <p class="text-muted">
                        No student has reached a 30% absence rate in any course.
                    </p>
                </div>
            </div>`;
        return;
    }

    const rows = entries.map(e => _buildAtRiskRow(e)).join('');

    output.innerHTML = `
        <div class="report-view card" role="region" aria-label="At-risk student report">
            <h3 class="report-view__title">
                <span class="at-risk-badge" aria-hidden="true">
                    <svg aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="20" height="20" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                </span>
                At-Risk Students
            </h3>
            <p class="report-view__subtitle text-muted">
                Students with an absence rate of 30% or higher in a course,
                ordered by highest absence rate first.
            </p>

            <div class="table-wrapper">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th scope="col">Student</th>
                            <th scope="col">Course</th>
                            <th scope="col">Absences</th>
                            <th scope="col">Sessions</th>
                            <th scope="col">Absence Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>`;
}

/**
 * Build one row of the at-risk report.
 * Requirements: 7.5, 7.6
 *
 * @param {Object} entry - { studentName, courseName, absences, totalSessions, absenceRate }
 * @returns {string} HTML
 */
function _buildAtRiskRow(entry) {
    return `
        <tr class="at-risk-row">
            <td>
                <span class="at-risk-badge" title="At-risk student" aria-label="At-risk">
                    <svg aria-hidden="true" focusable="false"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         width="14" height="14" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <span class="sr-only">At-risk</span>
                </span>
                ${escapeHTML(entry.studentName)}
            </td>
            <td>${escapeHTML(entry.courseName)}</td>
            <td>${entry.absences}</td>
            <td>${entry.totalSessions}</td>
            <td>${_rateBadge(entry.absenceRate)}</td>
        </tr>`;
}
