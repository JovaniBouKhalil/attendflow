# Requirements Document

## Introduction

The Student Attendance Manager is a web application designed for teachers and academic staff to track and manage student attendance across multiple courses. The system enables comprehensive student and course management, attendance recording, historical tracking, and automated risk detection for students with high absence rates. All data is persisted locally in the browser, requiring no backend infrastructure.

## Glossary

- **System**: The Student Attendance Manager web application
- **User**: A teacher or academic staff member using the application
- **Student**: An individual learner enrolled in one or more courses
- **Course**: An academic class or subject in which attendance is tracked
- **Attendance_Record**: A single entry documenting a student's presence or absence for a specific course session
- **Absence_Rate**: The percentage of sessions a student has missed in a specific course, calculated as (absences / total sessions) × 100
- **At_Risk_Status**: A flag indicating a student has reached or exceeded 30% absence rate in a course
- **Local_Storage**: Browser-based persistent storage mechanism for application data
- **Session**: A single occurrence of a course meeting for which attendance is recorded

## Requirements

### Requirement 1: Student Management

**User Story:** As a user, I want to manage student records, so that I can maintain an up-to-date roster of students in the system.

#### Acceptance Criteria

1. THE System SHALL provide a form to add a new Student with name (1-100 characters), student ID (1-50 characters), and contact information (email address)
2. WHEN a User submits a new Student form with valid data, THE System SHALL save the Student to Local_Storage
3. WHEN a User submits a new Student form with invalid data, THE System SHALL display validation error messages
4. THE System SHALL display a list of all Students with their name and student ID
5. WHEN a User selects a Student, THE System SHALL display the Student's name, student ID, and contact information
6. THE System SHALL provide a form to edit an existing Student's name and contact information
7. WHEN a User updates a Student's information with valid data, THE System SHALL save the changes to Local_Storage
8. WHEN a User updates a Student's information with invalid data, THE System SHALL display validation error messages
9. THE System SHALL provide a delete function for removing Students
10. WHEN a User deletes a Student, THE System SHALL remove the Student and all associated Attendance_Records from Local_Storage
11. WHEN a User attempts to delete a Student, THE System SHALL display a confirmation dialog before deletion

### Requirement 2: Course Management

**User Story:** As a user, I want to manage courses, so that I can organize attendance tracking by academic subject.

#### Acceptance Criteria

1. THE System SHALL provide a form to add a new Course with course name (1-100 characters), course code (1-20 characters), and description (0-500 characters)
2. WHEN a User submits a new Course form with a course name exceeding 100 characters, THE System SHALL display a validation error message
3. WHEN a User submits a new Course form with a course code exceeding 20 characters, THE System SHALL display a validation error message
4. WHEN a User submits a new Course form with a description exceeding 500 characters, THE System SHALL display a validation error message
5. WHEN a User submits a new Course form with an empty course name, THE System SHALL display a validation error message
6. WHEN a User submits a new Course form with an empty course code, THE System SHALL display a validation error message
7. WHEN a User submits a new Course form with a duplicate course code, THE System SHALL display a validation error message
8. WHEN a User submits a new Course form with valid data, THE System SHALL save the Course to Local_Storage within 1 second
9. THE System SHALL display a list of all Courses with their course name and course code
10. WHEN a User selects a Course, THE System SHALL display the Course's course name, course code, and description
11. THE System SHALL provide a form to edit an existing Course's course name and description
12. THE System SHALL prevent editing the course code of an existing Course
13. WHEN a User updates a Course's information with a course name exceeding 100 characters, THE System SHALL display a validation error message
14. WHEN a User updates a Course's information with a description exceeding 500 characters, THE System SHALL display a validation error message
15. WHEN a User updates a Course's information with an empty course name, THE System SHALL display a validation error message
16. WHEN a User updates a Course's information with valid data, THE System SHALL save the changes to Local_Storage within 1 second
17. THE System SHALL provide a delete function for removing Courses
18. WHEN a User deletes a Course, THE System SHALL remove the Course and all associated Attendance_Records from Local_Storage
19. WHEN a User attempts to delete a Course, THE System SHALL display a confirmation dialog stating the number of associated Attendance_Records that will be deleted
20. WHEN a User confirms deletion in the confirmation dialog, THE System SHALL proceed with the deletion
21. WHEN a User cancels deletion in the confirmation dialog, THE System SHALL cancel the deletion operation

### Requirement 3: Attendance Recording

**User Story:** As a user, I want to record student attendance for course sessions, so that I can track who attended each class meeting.

#### Acceptance Criteria

1. THE System SHALL provide an interface to select a Course and date for attendance recording
2. THE System SHALL provide an interface to enroll Students in a Course
3. WHEN a User enrolls a Student in a Course, THE System SHALL save the enrollment relationship to Local_Storage
4. WHEN a User selects a Course and date, THE System SHALL display a list of all Students enrolled in that Course
5. IF no Students are enrolled in the selected Course, THEN THE System SHALL display a message indicating no enrolled students
6. THE System SHALL provide controls to mark each Student as present or absent
7. WHEN a User completes marking attendance and triggers save, THE System SHALL save each Attendance_Record to Local_Storage with student ID, course ID, date, and attendance status
8. WHEN a User selects a Course and date combination that already has Attendance_Records, THE System SHALL populate the attendance controls with existing attendance status values
9. THE System SHALL associate each Attendance_Record with a timestamp of when it was created or last modified
10. WHEN an Attendance_Record is saved, THE System SHALL recalculate the Absence_Rate for that Student in that Course
11. IF a User selects a date that is after the current date, THEN THE System SHALL display an error message indicating future dates are not allowed
12. IF a User attempts to save attendance without marking all enrolled Students, THEN THE System SHALL display a validation error message indicating which Students require attendance status

### Requirement 4: Attendance History Viewing

**User Story:** As a user, I want to view attendance history, so that I can review past attendance patterns and records.

#### Acceptance Criteria

1. THE System SHALL provide an interface to view all Attendance_Records for a specific Student
2. WHEN a User requests a Student's attendance history, THE System SHALL display all Attendance_Records grouped by Course
3. IF a Student has no Attendance_Records, THEN THE System SHALL display a message indicating no attendance history
4. THE System SHALL provide an interface to view all Attendance_Records for a specific Course
5. WHEN a User requests a Course's attendance history, THE System SHALL display all Attendance_Records grouped by date
6. IF a Course has no Attendance_Records, THEN THE System SHALL display a message indicating no attendance history
7. THE System SHALL display each Attendance_Record with student name, course name, date, and attendance status
8. THE System SHALL sort Attendance_Records by date in descending order by default
9. WHEN a User selects an Attendance_Record, THE System SHALL provide controls to edit the attendance status
10. WHEN a User changes the attendance status and triggers save, THE System SHALL save the updated Attendance_Record to Local_Storage
11. WHEN a User saves an updated Attendance_Record, THE System SHALL recalculate the Absence_Rate for that Student in that Course
12. IF a User attempts to save an edited Attendance_Record with an invalid attendance status, THEN THE System SHALL display a validation error message

### Requirement 5: Search and Filter

**User Story:** As a user, I want to search and filter students, so that I can quickly find specific students or groups of students.

#### Acceptance Criteria

1. THE System SHALL provide a search input field for finding Students
2. WHEN a User enters text in the search field, THE System SHALL filter the Student list to show only Students whose name or student ID contains the search text (case-insensitive)
3. WHEN a User types in the search field, THE System SHALL update search results within 500 milliseconds
4. WHEN the search field is empty, THE System SHALL display all Students
5. THE System SHALL provide filter options to show Students marked with At_Risk_Status in any Course
6. WHEN a User applies filters, THE System SHALL display only Students matching the selected filter criteria
7. WHEN a User combines search text with filter options, THE System SHALL display only Students matching both the search text AND the filter criteria
8. WHEN no Students match the search or filter criteria, THE System SHALL display a message indicating no results found
9. THE System SHALL provide a clear function to reset all search and filter criteria
10. WHEN a User triggers the clear function, THE System SHALL clear the search field and remove all applied filters

### Requirement 6: Attendance Statistics and Reports

**User Story:** As a user, I want to view attendance statistics and reports, so that I can analyze attendance patterns and identify issues.

#### Acceptance Criteria

1. THE System SHALL calculate and display the Absence_Rate for each Student in each Course where the Student has at least one Attendance_Record
2. THE System SHALL display the total number of Sessions recorded for each Course
3. THE System SHALL display the number of absences and presences for each Student in each Course where the Student has at least one Attendance_Record
4. THE System SHALL provide a summary report showing attendance statistics by Course
5. WHEN a User requests a Course report, THE System SHALL display the Course name, total Sessions, and average Absence_Rate across all Students with Attendance_Records in that Course
6. THE System SHALL provide a summary report showing individual Student attendance across all Courses
7. WHEN a User requests a Student report, THE System SHALL display the Student name and the Student's Absence_Rate for each Course where the Student has at least one Attendance_Record
8. THE System SHALL display statistics as percentages rounded to one decimal place
9. THE System SHALL display color-coded visual indicators for Absence_Rate (green for 0-10%, yellow for 10-30%, red for 30% or higher)
10. THE System SHALL provide an interface element to access the Course summary report
11. THE System SHALL provide an interface element to access the Student summary report
12. IF a Course has zero Sessions recorded, THEN THE System SHALL display "N/A" for average Absence_Rate in the Course report
13. IF a Student has no Attendance_Records in any Course, THEN THE System SHALL display a message indicating no attendance data in the Student report

### Requirement 7: At-Risk Student Detection

**User Story:** As a user, I want the system to automatically identify at-risk students, so that I can intervene early to help students who may drop courses.

#### Acceptance Criteria

1. WHEN a Student's Absence_Rate in a Course reaches 30.0% or higher, THE System SHALL set the At_Risk_Status flag for that Student in that Course
2. WHEN a Student's Absence_Rate in a Course falls below 30.0%, THE System SHALL clear the At_Risk_Status flag for that Student in that Course
3. THE System SHALL display a red warning icon next to Students with At_Risk_Status in at least one Course in the Student list
4. THE System SHALL provide a dedicated view to display all Students currently marked with At_Risk_Status in any Course
5. WHEN a User views the at-risk Students list, THE System SHALL display the Student name, Course name, and current Absence_Rate for each Student-Course combination with At_Risk_Status
6. THE System SHALL sort at-risk Students by Absence_Rate in descending order
7. WHEN an Attendance_Record is added, updated, or deleted, THE System SHALL recalculate At_Risk_Status for the affected Student in the affected Course
8. WHEN the At_Risk_Status of a Student in a Course changes, THE System SHALL update the display within 1 second
9. IF a Student has zero Attendance_Records in a Course, THEN THE System SHALL NOT set At_Risk_Status for that Student in that Course

### Requirement 8: Local Data Persistence

**User Story:** As a user, I want all my data saved locally in the browser, so that I can access my attendance records without needing an internet connection or server.

#### Acceptance Criteria

1. THE System SHALL store all Student records in Local_Storage
2. THE System SHALL store all Course records in Local_Storage
3. THE System SHALL store all Attendance_Records in Local_Storage
4. WHEN the application loads, THE System SHALL retrieve all data from Local_Storage
5. WHEN Local_Storage is empty on first load, THE System SHALL initialize with empty data structures
6. THE System SHALL serialize data to JSON format before storing in Local_Storage
7. THE System SHALL deserialize JSON data when retrieving from Local_Storage
8. IF Local_Storage data fails JSON parsing OR lacks required fields (students, courses, attendanceRecords), THEN THE System SHALL display an error message and initialize with empty data structures
9. THE System SHALL persist data changes within 1 second after each create, update, or delete operation
10. THE System SHALL handle Local_Storage quota exceeded errors by displaying a warning message to the User
11. IF a write operation to Local_Storage fails, THEN THE System SHALL display an error message to the User
12. IF a read operation from Local_Storage fails, THEN THE System SHALL display an error message and initialize with empty data structures

### Requirement 9: Data Validation and Integrity

**User Story:** As a user, I want the system to validate my input and maintain data integrity, so that I can trust the accuracy of the attendance records.

#### Acceptance Criteria

1. THE System SHALL validate that Student names contain only letters, spaces, hyphens, and apostrophes
2. THE System SHALL validate that Student names are between 1 and 100 characters in length
3. THE System SHALL validate that student IDs are between 1 and 50 characters in length
4. THE System SHALL validate that student IDs are unique across all Students
5. THE System SHALL validate that Course names are between 1 and 200 characters in length
6. THE System SHALL validate that Course codes are between 1 and 20 characters in length
7. THE System SHALL validate that Course codes are unique across all Courses
8. THE System SHALL validate that Course descriptions are between 0 and 1000 characters in length
9. THE System SHALL validate that attendance dates are in YYYY-MM-DD format
10. THE System SHALL validate that Attendance_Records reference existing Student and Course IDs
11. WHEN a User attempts to save invalid data, THE System SHALL prevent the save operation and display an error message indicating the field and reason for validation failure
12. IF a User attempts to modify a Student ID after creation, THEN THE System SHALL prevent the modification and display an error message
13. IF a User attempts to modify a Course code after creation, THEN THE System SHALL prevent the modification and display an error message
14. THE System SHALL validate that Student name, Student ID, Course name, and Course code are not empty before saving
15. THE System SHALL trim whitespace from text inputs before validation and storage

### Requirement 10: User Interface and Navigation

**User Story:** As a user, I want an intuitive and responsive interface, so that I can efficiently manage attendance without confusion.

#### Acceptance Criteria

1. THE System SHALL provide a navigation menu to access Students, Courses, Attendance Recording, and Reports sections
2. THE System SHALL highlight the current section in the navigation menu
3. WHEN a User navigates to a detail view, THE System SHALL display breadcrumb navigation showing the path from the home section to the current view
4. WHEN a data operation is in progress, THE System SHALL display a loading indicator within 100 milliseconds
5. WHEN a data operation completes successfully, THE System SHALL display a success confirmation message for 3 seconds
6. WHEN a data operation fails, THE System SHALL display an error message including the operation name and reason for failure
7. THE System SHALL allow Users to navigate between form input fields using the Tab key
8. THE System SHALL allow Users to submit forms using the Enter key when focus is on a form input
9. WHEN the viewport width is 768 pixels or greater, THE System SHALL display the navigation menu horizontally
10. WHEN the viewport width is less than 768 pixels, THE System SHALL display the navigation menu as a collapsible vertical menu
11. THE System SHALL maintain consistent styling and layout across all sections
12. THE System SHALL provide help text or tooltips for the At_Risk_Status visual indicator and the Absence_Rate calculation
