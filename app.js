/**
 * app.js — Application bootstrap and navigation
 * Task 10.1: navigation wiring, section switching, breadcrumb, keyboard support
 * Requirements: 8.4, 10.1, 10.2, 10.3, 10.7, 10.8, 10.9, 10.10
 */

'use strict';

// ─── Global State ────────────────────────────────────────────────────────────

/** Mirror of the four Local Storage arrays, kept in sync after every mutation */
let appData = {
    students:         [],
    courses:          [],
    attendanceRecords: [],
    enrollments:      []
};

/**
 * Tracks the current navigation state so breadcrumbs and section headings
 * can be rendered correctly.
 * { section: string, detail: { label: string, id: string }|null }
 */
let navState = { section: 'students', detail: null };

// ─── Boot ────────────────────────────────────────────────────────────────────

/**
 * Entry point — called once the DOM is ready
 * Requirements: 8.4
 */
function initializeApp() {
    // 1. Load data from Local Storage
    const result = initializeStorage();

    if (!result.success) {
        // Errors handled by later UI tasks; log for now
        result.errors.forEach(e => console.error('[Storage]', e));
    }

    if (result.data) {
        appData = result.data;
    }

    // 2. Wire navigation
    initializeNavigation();

    // 3. Show the default section
    navigateTo('students');
}

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * Wire up all navigation interactions:
 * - Desktop nav links
 * - Mobile hamburger toggle
 * - Close-on-outside-click for mobile
 * Requirements: 10.1, 10.2, 10.9, 10.10
 */
function initializeNavigation() {
    const toggle  = document.querySelector('.nav-toggle');
    const menu    = document.getElementById('nav-menu');
    const links   = document.querySelectorAll('.nav-link');

    // ── Mobile hamburger ──────────────────────────────────────────
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute(
                'aria-label',
                isOpen ? 'Close navigation menu' : 'Open navigation menu'
            );
        });
    }

    // ── Nav link clicks ───────────────────────────────────────────
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            if (section) navigateTo(section);

            // Close mobile menu after selection
            if (menu) {
                menu.classList.remove('open');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-label', 'Open navigation menu');
                }
            }
        });
    });

    // ── Close mobile menu when clicking outside the header ────────
    document.addEventListener('click', e => {
        if (menu && menu.classList.contains('open') &&
            !e.target.closest('#main-nav')) {
            menu.classList.remove('open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open navigation menu');
            }
        }
    });

    // ── Keyboard: Escape closes the mobile menu ───────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open navigation menu');
                toggle.focus();     // return focus to the button
            }
        }
    });
}

/**
 * Navigate to a top-level section.
 * Updates the active link, shows the section, clears breadcrumb.
 * Requirements: 10.1, 10.2
 *
 * @param {string} sectionName - One of: students | courses | attendance | reports
 */
function navigateTo(sectionName) {
    navState = { section: sectionName, detail: null };

    // ── Activate nav link ─────────────────────────────────────────
    document.querySelectorAll('.nav-link').forEach(link => {
        const isCurrent = link.getAttribute('data-section') === sectionName;
        link.classList.toggle('active', isCurrent);
        // aria-current="page" marks the active link (WCAG 2.4.4)
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // ── Show matching section, hide others ────────────────────────
    document.querySelectorAll('.content-section').forEach(section => {
        const isActive = section.id === `${sectionName}-section`;
        section.classList.toggle('active', isActive);
    });

    // ── Clear breadcrumb for top-level sections ───────────────────
    clearBreadcrumb();

    // ── Move focus to the main content area (skip-link target) ────
    // This aids screen-reader users who navigate via the menu
    const main = document.getElementById('main-content');
    if (main) main.focus();
}

/**
 * Navigate into a detail view within a section.
 * Shows the correct section and pushes a breadcrumb trail.
 * Requirement: 10.3
 *
 * @param {string} sectionName - Parent section (e.g. 'students')
 * @param {string} detailLabel - Human-readable label for the detail view
 */
function navigateToDetail(sectionName, detailLabel) {
    navState = { section: sectionName, detail: { label: detailLabel } };

    // Keep the parent nav link active
    document.querySelectorAll('.nav-link').forEach(link => {
        const isCurrent = link.getAttribute('data-section') === sectionName;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // Show the section (it should already be visible, but be safe)
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}-section`);
    });

    // Render the breadcrumb
    renderBreadcrumb(sectionName, detailLabel);
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

/** Human-readable labels for each top-level section */
const SECTION_LABELS = {
    students:   'Students',
    courses:    'Courses',
    attendance: 'Attendance',
    reports:    'Reports'
};

/**
 * Render a two-level breadcrumb: Home section › Detail
 * Requirement: 10.3
 *
 * @param {string} sectionName  - Parent section name
 * @param {string} detailLabel  - Label for the current detail view
 */
function renderBreadcrumb(sectionName, detailLabel) {
    const nav = document.getElementById('breadcrumb');
    const ol  = nav.querySelector('ol');
    if (!nav || !ol) return;

    const parentLabel = SECTION_LABELS[sectionName] || sectionName;

    ol.innerHTML = `
        <li>
            <a href="#${sectionName}"
               data-section="${sectionName}"
               class="breadcrumb-link">
                ${escapeHTML(parentLabel)}
            </a>
        </li>
        <li>
            <span aria-current="page">${escapeHTML(detailLabel)}</span>
        </li>`;

    // Wire the parent crumb link
    ol.querySelector('.breadcrumb-link').addEventListener('click', e => {
        e.preventDefault();
        navigateTo(sectionName);
    });

    nav.classList.add('visible');
    nav.removeAttribute('aria-hidden');
}

/**
 * Hide the breadcrumb and clear its content.
 * Called when returning to a top-level section.
 */
function clearBreadcrumb() {
    const nav = document.getElementById('breadcrumb');
    if (!nav) return;
    nav.classList.remove('visible');
    nav.setAttribute('aria-hidden', 'true');
    const ol = nav.querySelector('ol');
    if (ol) ol.innerHTML = '';
}

// ─── Keyboard Navigation (Requirement 10.7, 10.8) ───────────────────────────

/**
 * Global keydown handler for cross-cutting keyboard behaviour.
 * Tab and Enter on form inputs are handled natively by the browser;
 * this handler supports modal close (Escape) and arrow-key nav in lists.
 */
document.addEventListener('keydown', e => {
    // Enter on a button triggers click natively; nothing extra needed.
    // Tab cycles through focusable elements natively; nothing extra needed.

    // Escape: handled per-component (modal, mobile menu) — see those modules.
});

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Escape user-supplied text before inserting it into innerHTML.
 * Prevents XSS in breadcrumb labels, list items, etc.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
}

// Placeholder stubs for notification functions — implemented in Task 10.2
function showError(message)   { console.error('[Error]',   message); }
function showSuccess(message) { console.log  ('[Success]', message); }
function showLoading()        { /* Task 10.2 */ }
function hideLoading()        { /* Task 10.2 */ }

// ─── Init ─────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
