# Implementation Plan: Student Attendance Manager

## Overview

This implementation plan breaks down the Student Attendance Manager web application into discrete, reviewable tasks. The application is a client-side JavaScript web app using HTML, CSS, and the Local Storage API. Each task builds incrementally on previous work, with regular checkpoints to ensure stability and correctness.

## Tasks

- [ ] 1. Set up project structure and foundational utilities
  - Create `index.html` with semantic HTML5 structure and navigation skeleton
  - Create `styles.css` with CSS reset, base styles, and responsive layout foundation (mobile-first, 768px breakpoint)
  - Create `utils.js` with UUID generation and date formatting utilities
  - Create `storage.js` with Local Storage wrapper functions (initialize, save, load, error handling)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 10.1, 10.9, 10.10, 10.11_

- [ ]* 1.1 Write unit tests for storage layer
  - Test JSON serialization and deserialization
  - Test initialization with empty Local Storage
  - Test handling of corrupted JSON data (invalid JSON, missing required fields)
  - Test quota exceeded error handling
  - _Requirements: 8.4, 8.5, 8.7, 8.8, 8.10, 8.12_

- [ ] 2. Implement data models and validation
  - [ ] 2.1 Create `models.js` with Student, Course, AttendanceRecord, and Enrollment classes
    - Define properties, constructors, and timestamp management
    - _Requirements: 1.1, 2.1, 3.7, 9.1, 9.2, 9.3, 9.5, 9.6, 9.7, 9.8, 9.14, 9.15_
  
  - [ ] 2.2 Implement validation functions in `models.js`
    - Student validation: name pattern `/^[A-Za-z\s'-]+$/`, length 1-100, student ID length 1-50, email format, whitespace trimming
    - Course validation: name length 1-200, code length 1-20, description length 0-1000, whitespace trimming
    - AttendanceRecord validation: date format YYYY-MM-DD, future date prevention, status enum validation
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.11, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.14, 9.15_
  
  - [ ]* 2.3 Write unit tests for data model validation
    - Test valid inputs for all fields
    - Test invalid inputs (empty strings, over-length, format violations, special characters)
    - Test whitespace trimming
    - Test edge cases (boundary lengths, special name characters)
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7, 9.8, 9.9, 9.11, 9.14, 9.15_

- [ ] 3. Checkpoint - Verify data models and storage layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement Student Management Module
  - [ ] 4.1 Create `studentModule.js` with CRUD operations
    - Implement `addStudent()`, `getStudent()`, `getAllStudents()`, `updateStudent()`, `deleteStudent()`
    - Enforce student ID uniqueness constraint
    - Prevent student ID modification after creation
    - Integrate with storage layer for persistence
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 9.4, 9.12_
  
  - [ ] 4.2 Implement search functionality in `studentModule.js`
    - Implement `searchStudents()` with case-insensitive filtering on name and student ID
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ] 4.3 Implement at-risk filtering in `studentModule.js`
    - Implement `getAtRiskStudents()` to return students with at-risk status in any course
    - _Requirements: 5.5, 5.6, 7.3, 7.4_
  
  - [ ]* 4.4 Write unit tests for Student Management Module
    - Test CRUD operations with valid and invalid data
    - Test student ID uniqueness enforcement
    - Test student ID immutability after creation
    - Test search functionality (case-insensitive, partial match)
    - Test at-risk filtering
    - Test cascade delete (verify attendance records removed)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 5.1, 5.2, 5.4, 5.5, 5.6, 9.4, 9.11, 9.12_

- [ ] 5. Implement Course Management Module
  - [ ] 5.1 Create `courseModule.js` with CRUD operations
    - Implement `addCourse()`, `getCourse()`, `getAllCourses()`, `updateCourse()`, `deleteCourse()`
    - Enforce course code uniqueness constraint
    - Prevent course code modification after creation
    - Integrate with storage layer for persistence
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 9.7, 9.13_
  
  - [ ] 5.2 Implement enrollment management in `courseModule.js`
    - Implement `enrollStudent()`, `unenrollStudent()`, `getEnrolledStudents()`, `getStudentCourses()`
    - Enforce unique enrollment constraint (studentId, courseCode)
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 5.3 Write unit tests for Course Management Module
    - Test CRUD operations with valid and invalid data
    - Test course code uniqueness enforcement
    - Test course code immutability after creation
    - Test enrollment operations (add, remove, query)
    - Test cascade delete (verify attendance records and enrollments removed)
    - Test confirmation dialog data (attendance count)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 3.2, 3.3, 9.7, 9.11, 9.13_

- [ ] 6. Checkpoint - Verify Student and Course modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Attendance Management Module
  - [ ] 7.1 Create `attendanceModule.js` with attendance recording operations
    - Implement `recordAttendance()` for batch recording with date and status
    - Implement `getAttendance()` to retrieve attendance for a course and date
    - Implement `updateAttendanceRecord()` for editing existing records
    - Enforce unique constraint (studentId, courseCode, date)
    - Validate foreign key references (student ID and course code must exist)
    - Associate timestamp with each record (createdAt, updatedAt)
    - _Requirements: 3.1, 3.4, 3.6, 3.7, 3.8, 3.9, 9.10_
  
  - [ ] 7.2 Implement attendance history queries in `attendanceModule.js`
    - Implement `getStudentAttendance()` to retrieve all records for a student, grouped by course
    - Implement `getCourseAttendance()` to retrieve all records for a course, grouped by date
    - Sort records by date in descending order
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ] 7.3 Implement absence rate calculation in `attendanceModule.js`
    - Implement `calculateAbsenceRate(studentId, courseCode)` as (absences / totalSessions) × 100, rounded to 1 decimal place
    - Handle edge case of zero sessions (return null or 0)
    - _Requirements: 6.1, 6.3, 6.8_
  
  - [ ] 7.4 Implement at-risk status calculation in `attendanceModule.js`
    - Implement `calculateAtRiskStatus(studentId, courseCode)` returning true if absence rate ≥ 30.0%
    - Implement `recalculateStatistics(studentId, courseCode)` to trigger after attendance changes
    - Update at-risk status within 1 second of attendance record changes
    - _Requirements: 3.10, 4.11, 7.1, 7.2, 7.7, 7.8, 7.9_
  
  - [ ]* 7.5 Write unit tests for Attendance Management Module
    - Test attendance recording with valid and invalid data
    - Test future date prevention
    - Test duplicate record prevention (unique constraint)
    - Test foreign key validation (invalid student/course IDs)
    - Test attendance history queries (student view, course view)
    - Test absence rate calculation (various scenarios, zero sessions edge case)
    - Test at-risk status calculation (threshold edge cases: 29.9%, 30.0%, 30.1%)
    - Test recalculate statistics trigger after record changes
    - _Requirements: 3.1, 3.4, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 6.1, 6.3, 6.8, 7.1, 7.2, 7.7, 7.8, 7.9, 9.9, 9.10_

- [ ] 8. Implement Report Module
  - [ ] 8.1 Create `reportModule.js` with statistics generation
    - Implement `generateCourseReport(courseCode)` with total sessions, average absence rate, and list of students
    - Implement `generateStudentReport(studentId)` with absence rates across all courses
    - Implement `getCourseSummaries()` for all courses
    - Implement `getStudentSummaries()` for all students
    - Handle edge cases: zero sessions (display "N/A"), no attendance records
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.12, 6.13_
  
  - [ ] 8.2 Implement at-risk list generation in `reportModule.js`
    - Implement `getAtRiskList()` returning all students with at-risk status in any course
    - Sort by absence rate in descending order
    - Include student name, course name, and absence rate for each entry
    - _Requirements: 7.4, 7.5, 7.6_
  
  - [ ]* 8.3 Write unit tests for Report Module
    - Test course report generation with various data sets
    - Test student report generation with various data sets
    - Test at-risk list generation and sorting
    - Test edge cases (zero sessions, no attendance records, no at-risk students)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.12, 6.13, 7.4, 7.5, 7.6_

- [ ] 9. Checkpoint - Verify Attendance and Report modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Build UI components and navigation
  - [ ] 10.1 Create navigation menu in `index.html` and `app.js`
    - Implement horizontal navigation for desktop (≥768px)
    - Implement collapsible vertical navigation for mobile (<768px)
    - Implement active section highlighting
    - Implement breadcrumb navigation for detail views
    - _Requirements: 10.1, 10.2, 10.3, 10.9, 10.10_
  
  - [ ] 10.2 Implement common UI components in `app.js`
    - Loading indicators (display within 100ms)
    - Success messages (display for 3 seconds)
    - Error messages (persistent until dismissed)
    - Confirmation dialogs with custom messages
    - Help text and tooltips
    - _Requirements: 10.4, 10.5, 10.6, 10.12_
  
  - [ ] 10.3 Add keyboard navigation support in `app.js`
    - Enable Tab key navigation between form fields
    - Enable Enter key for form submission
    - _Requirements: 10.7, 10.8_

- [ ] 11. Build Student Management UI
  - [ ] 11.1 Create student list view in `index.html` and `studentUI.js`
    - Display all students with name and student ID
    - Display red warning icon for at-risk students
    - Add/Edit/Delete action buttons
    - Integrate with Student Management Module
    - _Requirements: 1.4, 1.5, 7.3_
  
  - [ ] 11.2 Create student add/edit forms in `index.html` and `studentUI.js`
    - Form fields: name (1-100 chars), student ID (1-50 chars), email
    - Real-time validation with inline error messages
    - Prevent student ID modification after creation (hide or disable field in edit mode)
    - Display confirmation dialog before deletion
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 9.12_
  
  - [ ] 11.3 Implement search and filter controls in `studentUI.js`
    - Search input with real-time filtering (<500ms debounce)
    - At-risk filter toggle
    - Clear filter function
    - Display "No results found" message when applicable
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

- [ ] 12. Build Course Management UI
  - [ ] 12.1 Create course list view in `index.html` and `courseUI.js`
    - Display all courses with course name and course code
    - Add/Edit/Delete action buttons
    - Integrate with Course Management Module
    - _Requirements: 2.9, 2.10_
  
  - [ ] 12.2 Create course add/edit forms in `index.html` and `courseUI.js`
    - Form fields: course name (1-200 chars), course code (1-20 chars), description (0-1000 chars)
    - Real-time validation with inline error messages
    - Prevent course code modification after creation (hide or disable field in edit mode)
    - Display confirmation dialog before deletion with attendance record count
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 9.13_

- [ ] 13. Build Attendance Recording UI
  - [ ] 13.1 Create attendance recording interface in `index.html` and `attendanceUI.js`
    - Course and date selector
    - Display list of enrolled students for selected course
    - Present/Absent toggle controls for each student
    - Save functionality with validation
    - Load existing attendance for editing (populate controls with saved status)
    - Display "No enrolled students" message when applicable
    - Validate all students marked before saving
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7, 3.8, 3.11, 3.12_
  
  - [ ] 13.2 Create enrollment management interface in `attendanceUI.js` or `courseUI.js`
    - Interface to enroll students in courses
    - Interface to unenroll students from courses
    - Display enrolled students per course
    - _Requirements: 3.2, 3.3_

- [ ] 14. Build Attendance History UI
  - [ ] 14.1 Create attendance history views in `index.html` and `historyUI.js`
    - Student attendance history view (grouped by course)
    - Course attendance history view (grouped by date)
    - Display attendance records with student name, course name, date, and status
    - Sort by date in descending order
    - Display "No attendance history" message when applicable
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ] 14.2 Implement attendance record editing in `historyUI.js`
    - Provide controls to edit attendance status in history view
    - Save updated attendance record with validation
    - Trigger recalculation of absence rate and at-risk status after edit
    - _Requirements: 4.9, 4.10, 4.11, 4.12_

- [ ] 15. Build Reports and Statistics UI
  - [ ] 15.1 Create course summary report in `index.html` and `reportsUI.js`
    - Display course name, total sessions, and average absence rate
    - Display "N/A" for courses with zero sessions
    - Color-coded absence rate indicators (green 0-10%, yellow 10-30%, red ≥30%)
    - _Requirements: 6.4, 6.5, 6.8, 6.9, 6.10, 6.12_
  
  - [ ] 15.2 Create student summary report in `reportsUI.js`
    - Display student name and absence rates for each course
    - Display "No attendance data" message when applicable
    - Color-coded absence rate indicators
    - _Requirements: 6.6, 6.7, 6.8, 6.9, 6.11, 6.13_
  
  - [ ] 15.3 Create at-risk student list in `reportsUI.js`
    - Display all students with at-risk status in any course
    - Show student name, course name, and current absence rate
    - Sort by absence rate in descending order
    - _Requirements: 7.4, 7.5, 7.6_

- [ ] 16. Checkpoint - Verify all UI components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Integration and wiring
  - [ ] 17.1 Wire all modules and UI components together in `app.js`
    - Initialize storage layer on application load
    - Load data from Local Storage and populate UI
    - Connect UI events to module functions
    - Implement application-wide error handling and user feedback
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.9, 8.11, 8.12_
  
  - [ ] 17.2 Implement data persistence timing in `app.js`
    - Ensure all data changes persist to Local Storage within 1 second
    - Ensure at-risk status updates display within 1 second
    - _Requirements: 2.8, 2.16, 7.8, 8.9_
  
  - [ ]* 17.3 Write integration tests
    - Test end-to-end flows: add student → enroll in course → record attendance → view report
    - Test cascade delete flows: delete student → verify attendance records removed
    - Test statistics recalculation flows: edit attendance → verify absence rate updated → verify at-risk status updated
    - Test Local Storage persistence across operations
    - Test error handling across modules
    - _Requirements: 1.10, 2.18, 3.10, 4.11, 7.7, 8.9_

- [ ] 18. Polish and responsive design
  - [ ] 18.1 Finalize responsive layout in `styles.css`
    - Verify mobile layout (<768px)
    - Verify desktop layout (≥768px)
    - Ensure consistent styling across all sections
    - _Requirements: 10.9, 10.10, 10.11_
  
  - [ ] 18.2 Add visual enhancements in `styles.css`
    - Color-coded absence rate indicators (green, yellow, red)
    - Warning icons for at-risk students
    - Loading spinners and animations
    - Success/error message styling
    - _Requirements: 6.9, 7.3_
  
  - [ ] 18.3 Accessibility and usability improvements
    - Ensure all interactive elements are keyboard accessible
    - Add ARIA labels and roles where appropriate
    - Verify color contrast for readability
    - Add focus indicators for keyboard navigation
    - _Requirements: 10.7, 10.8_

- [ ] 19. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Unit tests validate specific logic and edge cases
- Integration tests validate end-to-end workflows and module interactions
- The design document specifies JavaScript (ES6+), so all code should use modern JavaScript syntax
- Local Storage is the sole persistence mechanism—no backend required
- All validation must occur at multiple layers: UI (immediate feedback), module (business rules), and model (data integrity)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "4.1"] },
    { "id": 3, "tasks": ["2.3", "4.2", "4.3", "5.1"] },
    { "id": 4, "tasks": ["4.4", "5.2"] },
    { "id": 5, "tasks": ["5.3", "7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3"] },
    { "id": 7, "tasks": ["7.4", "8.1"] },
    { "id": 8, "tasks": ["7.5", "8.2"] },
    { "id": 9, "tasks": ["8.3", "10.1"] },
    { "id": 10, "tasks": ["10.2", "10.3", "11.1"] },
    { "id": 11, "tasks": ["11.2", "11.3", "12.1"] },
    { "id": 12, "tasks": ["12.2", "13.1"] },
    { "id": 13, "tasks": ["13.2", "14.1"] },
    { "id": 14, "tasks": ["14.2", "15.1"] },
    { "id": 15, "tasks": ["15.2", "15.3"] },
    { "id": 16, "tasks": ["17.1"] },
    { "id": 17, "tasks": ["17.2"] },
    { "id": 18, "tasks": ["17.3", "18.1"] },
    { "id": 19, "tasks": ["18.2", "18.3"] }
  ]
}
```
