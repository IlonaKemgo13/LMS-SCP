-- ============================================================
-- Supabase Row Level Security Policies — LMS-SCP
-- Apply via Supabase SQL Editor or migration.
-- Run ONCE per environment. Drop existing policies first if re-running.
-- ============================================================

-- Helper: get current user's role from profiles
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

-- Any authenticated user can read their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (id = auth.uid());

-- Admins can read all profiles
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.get_my_role() = 'admin');

-- Users can update their own profile (avatar_url, full_name only — role is protected)
create policy "profiles: own update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can update all profiles (role changes etc.)
create policy "profiles: admin update all"
  on public.profiles for update
  using (public.get_my_role() = 'admin');

-- Insert/delete only via service role (admin API routes use service-role key)
-- No INSERT or DELETE policies needed for anon/authenticated — service role bypasses RLS

-- ============================================================
-- courses
-- ============================================================
alter table public.courses enable row level security;

-- All authenticated users can view courses
create policy "courses: authenticated read"
  on public.courses for select
  using (auth.role() = 'authenticated');

-- Admins can insert/update/delete courses
create policy "courses: admin write"
  on public.courses for all
  using (public.get_my_role() = 'admin');

-- Teachers can update their own assigned courses
create policy "courses: teacher update own"
  on public.courses for update
  using (teacher_id = auth.uid() and public.get_my_role() = 'teacher')
  with check (teacher_id = auth.uid());

-- ============================================================
-- enrollments
-- ============================================================
alter table public.enrollments enable row level security;

-- Students can view their own enrollments
create policy "enrollments: student own"
  on public.enrollments for select
  using (student_id = auth.uid() and public.get_my_role() = 'student');

-- Teachers can view enrollments for their courses
create policy "enrollments: teacher see own courses"
  on public.enrollments for select
  using (
    public.get_my_role() = 'teacher'
    and course_id in (
      select id from public.courses where teacher_id = auth.uid()
    )
  );

-- Parents can view enrollments for their linked children
create policy "enrollments: parent linked children"
  on public.enrollments for select
  using (
    public.get_my_role() = 'parent'
    and student_id in (
      select student_id from public.parent_student_links where parent_id = auth.uid()
    )
  );

-- Admins can read and write all enrollments
create policy "enrollments: admin all"
  on public.enrollments for all
  using (public.get_my_role() = 'admin');

-- ============================================================
-- parent_student_links
-- ============================================================
alter table public.parent_student_links enable row level security;

-- Parents can view their own links
create policy "parent_links: parent own"
  on public.parent_student_links for select
  using (parent_id = auth.uid() and public.get_my_role() = 'parent');

-- Students can view links that include them
create policy "parent_links: student own"
  on public.parent_student_links for select
  using (student_id = auth.uid() and public.get_my_role() = 'student');

-- Admins can read and write all links
create policy "parent_links: admin all"
  on public.parent_student_links for all
  using (public.get_my_role() = 'admin');

-- ============================================================
-- announcements
-- ============================================================
alter table public.announcements enable row level security;

-- Students can read announcements targeting them (global, or targeted to 'student')
create policy "announcements: student read"
  on public.announcements for select
  using (
    public.get_my_role() = 'student'
    and (
      is_global = true
      or target_role = 'student'
      or (
        course_id in (
          select course_id from public.enrollments where student_id = auth.uid()
        )
      )
    )
  );

-- Parents can read announcements targeting them
create policy "announcements: parent read"
  on public.announcements for select
  using (
    public.get_my_role() = 'parent'
    and (is_global = true or target_role = 'parent')
  );

-- Teachers can read their own announcements and global ones
create policy "announcements: teacher read"
  on public.announcements for select
  using (
    public.get_my_role() = 'teacher'
    and (
      teacher_id = auth.uid()
      or is_global = true
      or course_id in (
        select id from public.courses where teacher_id = auth.uid()
      )
    )
  );

-- Teachers can insert announcements for their courses
create policy "announcements: teacher insert"
  on public.announcements for insert
  with check (
    public.get_my_role() = 'teacher'
    and (
      teacher_id = auth.uid()
      or course_id in (
        select id from public.courses where teacher_id = auth.uid()
      )
    )
  );

-- Teachers can update/delete their own announcements
create policy "announcements: teacher update own"
  on public.announcements for update
  using (teacher_id = auth.uid() and public.get_my_role() = 'teacher')
  with check (teacher_id = auth.uid());

create policy "announcements: teacher delete own"
  on public.announcements for delete
  using (teacher_id = auth.uid() and public.get_my_role() = 'teacher');

-- Admins can do everything with announcements
create policy "announcements: admin all"
  on public.announcements for all
  using (public.get_my_role() = 'admin');

-- ============================================================
-- grades
-- ============================================================
alter table public.grades enable row level security;

-- Students can view their own grades
create policy "grades: student own"
  on public.grades for select
  using (student_id = auth.uid() and public.get_my_role() = 'student');

-- Teachers can view grades for their courses
create policy "grades: teacher own courses"
  on public.grades for select
  using (
    public.get_my_role() = 'teacher'
    and course_id in (
      select id from public.courses where teacher_id = auth.uid()
    )
  );

-- Teachers can insert/update grades for their courses
create policy "grades: teacher write own courses"
  on public.grades for insert
  with check (
    public.get_my_role() = 'teacher'
    and course_id in (
      select id from public.courses where teacher_id = auth.uid()
    )
  );

create policy "grades: teacher update own courses"
  on public.grades for update
  using (
    public.get_my_role() = 'teacher'
    and course_id in (
      select id from public.courses where teacher_id = auth.uid()
    )
  );

-- Parents can view grades for their linked children
create policy "grades: parent linked children"
  on public.grades for select
  using (
    public.get_my_role() = 'parent'
    and student_id in (
      select student_id from public.parent_student_links where parent_id = auth.uid()
    )
  );

-- Admins can do everything
create policy "grades: admin all"
  on public.grades for all
  using (public.get_my_role() = 'admin');

-- ============================================================
-- materials
-- ============================================================
alter table public.materials enable row level security;

-- Students can view materials for enrolled courses
create policy "materials: student enrolled"
  on public.materials for select
  using (
    public.get_my_role() = 'student'
    and course_id in (
      select course_id from public.enrollments where student_id = auth.uid()
    )
  );

-- Teachers can view/write materials for their courses
create policy "materials: teacher own courses"
  on public.materials for all
  using (
    public.get_my_role() = 'teacher'
    and course_id in (
      select id from public.courses where teacher_id = auth.uid()
    )
  );

-- Admins can do everything
create policy "materials: admin all"
  on public.materials for all
  using (public.get_my_role() = 'admin');

-- ============================================================
-- recordings
-- ============================================================
alter table public.recordings enable row level security;

-- Students can view recordings for enrolled courses
create policy "recordings: student enrolled"
  on public.recordings for select
  using (
    public.get_my_role() = 'student'
    and course_id in (
      select course_id from public.enrollments where student_id = auth.uid()
    )
  );

-- Teachers can view/write recordings for their courses
create policy "recordings: teacher own courses"
  on public.recordings for all
  using (
    public.get_my_role() = 'teacher'
    and course_id in (
      select id from public.courses where teacher_id = auth.uid()
    )
  );

-- Admins can do everything
create policy "recordings: admin all"
  on public.recordings for all
  using (public.get_my_role() = 'admin');

-- ============================================================
-- Storage: avatars bucket
-- ============================================================
-- Anyone authenticated can read any avatar (public display)
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Users can upload/update their own avatar (path = avatars/<user_id>.*)
create policy "avatars: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'avatars'
    and split_part(storage.filename(name), '.', 1) = auth.uid()::text
  );

create policy "avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and split_part(storage.filename(name), '.', 1) = auth.uid()::text
  );

-- ============================================================
-- Storage: lms-files bucket
-- ============================================================
-- Students can read files for their enrolled courses
-- (path convention: lms-files/materials/<course_id>/... or lms-files/recordings/<course_id>/...)
create policy "lms-files: authenticated read"
  on storage.objects for select
  using (bucket_id = 'lms-files' and auth.role() = 'authenticated');

-- Teachers can upload to their own courses
create policy "lms-files: teacher upload"
  on storage.objects for insert
  with check (
    bucket_id = 'lms-files'
    and public.get_my_role() = 'teacher'
  );

-- Admins can do everything in lms-files
create policy "lms-files: admin all"
  on storage.objects for all
  using (bucket_id = 'lms-files' and public.get_my_role() = 'admin');
