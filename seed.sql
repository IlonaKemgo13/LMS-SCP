-- ============================================================
-- LMS-SCP: Student Test Data Seed Script
-- ============================================================
-- Sample student : Laetitia Weudji  (student@gmail.com)
-- Student UUID   : 4e15644d-6362-441b-a2f5-344d4643694d
-- Teacher UUID   : acb59cd6-41af-4bad-9745-a98826d8040b
-- Course UUIDs   :
--   Web Development (CSC 401) : ad3a53f4-6634-46db-b3fc-d48fa4d3d03b
--   Database Systems (CSC 305): 5ca8c494-3e49-4b78-827b-f0aada21b396
-- ============================================================


-- ============================================================
-- 1. ENROLLMENTS
--    Student is currently only enrolled in Database Systems.
--    Enroll her in Web Development too.
-- ============================================================
INSERT INTO enrollments (student_id, course_id)
VALUES (
  '4e15644d-6362-441b-a2f5-344d4643694d',
  'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b'   -- Web Development
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. ANNOUNCEMENTS
--    NOTE: the announcements table has NO is_global column.
--    All announcements are course-specific (course_id required).
--    The student pages need to be updated to remove is_global filtering.
-- ============================================================
INSERT INTO announcements (title, content, deadline, course_id, teacher_id)
VALUES
  (
    'Midterm Exam – CSC 401',
    'The midterm will cover HTML, CSS, and JavaScript basics. Open-book allowed. Held in Room B12.',
    '2026-05-20',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'Final Project Submission',
    'Submit your full-stack web project via the student portal before midnight.',
    '2026-05-28',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'Lab Session – SQL Joins',
    'Hands-on lab covering INNER, LEFT, and RIGHT joins. Bring your laptop.',
    '2026-05-09',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'Quiz 2 – Database Normalization',
    'Quiz 2 next Monday covering 1NF, 2NF, and 3NF. 10 minutes, closed book.',
    '2026-05-13',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  );


-- ============================================================
-- 3. GRADES
--    NOTE: the grades table uses assessment_type (not "type")
--    and assessment_name. The student pages need to be updated.
--    One grade already exists: Assignment1, 18/20, DB Systems.
-- ============================================================
INSERT INTO grades (student_id, course_id, teacher_id, assessment_name, assessment_type, score, max_score)
VALUES
  -- Database Systems
  (
    '4e15644d-6362-441b-a2f5-344d4643694d',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b',
    'Midterm Exam', 'exam', 72, 100
  ),
  (
    '4e15644d-6362-441b-a2f5-344d4643694d',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b',
    'Lab Report 1', 'lab', 9, 10
  ),
  -- Web Development
  (
    '4e15644d-6362-441b-a2f5-344d4643694d',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b',
    'HTML/CSS Assignment', 'assignment', 15, 20
  ),
  (
    '4e15644d-6362-441b-a2f5-344d4643694d',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b',
    'JavaScript Quiz', 'quiz', 8, 10
  ),
  (
    '4e15644d-6362-441b-a2f5-344d4643694d',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b',
    'React Project', 'project', 88, 100
  );


-- ============================================================
-- 4. MATERIALS  (table is currently empty)
-- ============================================================
INSERT INTO materials (title, file_url, course_id, teacher_id)
VALUES
  (
    'Lecture 1 – HTML Basics',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/materials/html-basics.pdf',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'CSS Flexbox & Grid Guide',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/materials/css-flexbox.pdf',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'JavaScript ES6 Cheat Sheet',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/materials/js-es6.pdf',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'Database Normalization Notes',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/materials/db-normalization.pdf',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'SQL Joins Cheat Sheet',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/materials/sql-joins.pdf',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'ER Diagram Tutorial',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/materials/er-diagram.pdf',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  );


-- ============================================================
-- 5. RECORDINGS  (1 already exists: RDBMS for DB Systems)
-- ============================================================
INSERT INTO recordings (title, description, file_url, file_type, course_id, teacher_id)
VALUES
  (
    'HTML Fundamentals',
    'Introduction to HTML structure, semantic tags, and forms.',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/recordings/html-fundamentals.webm',
    'video',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'JavaScript DOM Manipulation',
    'Selecting elements, event listeners, and dynamic content.',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/recordings/js-dom.webm',
    'video',
    'ad3a53f4-6634-46db-b3fc-d48fa4d3d03b',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'SQL Queries Deep Dive',
    'SELECT, JOINs, GROUP BY, and subqueries with live examples.',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/recordings/sql-queries.webm',
    'video',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  ),
  (
    'Transactions & ACID Properties',
    'Understanding database transactions, rollback, and isolation levels.',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/recordings/transactions.webm',
    'video',
    '5ca8c494-3e49-4b78-827b-f0aada21b396',
    'acb59cd6-41af-4bad-9745-a98826d8040b'
  );


-- ============================================================
-- 6. FINAL RESULTS  (table is currently empty)
-- ============================================================
INSERT INTO final_results (title, domain, semester, file_url)
VALUES
  (
    'Semester 1 Official Results – 2025/2026',
    'Computer Science',
    'Semester 1 – 2025/2026',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/results/semester1-2025.pdf'
  ),
  (
    'Supplementary Exam Results – December 2025',
    'Computer Science',
    'Supplementary – 2025',
    'https://hrpxcqifipkqljlkfcdf.supabase.co/storage/v1/object/public/results/supp-dec2025.pdf'
  );

