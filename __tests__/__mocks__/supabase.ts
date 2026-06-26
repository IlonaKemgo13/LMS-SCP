/**
 * Configurable Supabase mock for tests.
 * Reset between tests with resetSupabaseMock().
 */

type MockResponse = { data: unknown; error: unknown; count?: number }

// Default successful responses
let mockAuthGetUser: MockResponse = { data: { user: null }, error: null }
let mockProfileSelect: MockResponse = { data: null, error: null }
let mockGradesInsert: MockResponse = { data: null, error: null }
let mockGradesSelect: MockResponse = { data: [], error: null }
let mockCoursesSelect: MockResponse = { data: null, error: null }
let mockEnrollmentsSelect: MockResponse = { data: [], error: null }
let mockAnnouncementsSelect: MockResponse = { data: [], error: null }
let mockRecordingsSelect: MockResponse = { data: [], error: null, count: 0 }
let mockAuthSignIn: MockResponse = { data: {}, error: null }
let mockAuthUpdateUser: MockResponse = { data: {}, error: null }
let mockAuthSignOut: MockResponse = { data: {}, error: null }
let mockAdminCreateUser: MockResponse = { data: { user: { id: 'new-user-id' } }, error: null }
let mockAdminUpdateUser: MockResponse = { data: {}, error: null }
let mockProfileInsert: MockResponse = { data: null, error: null }
let mockProfileUpdate: MockResponse = { data: null, error: null }

export function setMockAuthGetUser(response: MockResponse) { mockAuthGetUser = response }
export function setMockProfileSelect(response: MockResponse) { mockProfileSelect = response }
export function setMockGradesInsert(response: MockResponse) { mockGradesInsert = response }
export function setMockGradesSelect(response: MockResponse) { mockGradesSelect = response }
export function setMockCoursesSelect(response: MockResponse) { mockCoursesSelect = response }
export function setMockEnrollmentsSelect(response: MockResponse) { mockEnrollmentsSelect = response }
export function setMockAnnouncementsSelect(response: MockResponse) { mockAnnouncementsSelect = response }
export function setMockRecordingsSelect(response: MockResponse) { mockRecordingsSelect = response }
export function setMockAuthSignIn(response: MockResponse) { mockAuthSignIn = response }
export function setMockAuthUpdateUser(response: MockResponse) { mockAuthUpdateUser = response }
export function setMockAdminCreateUser(response: MockResponse) { mockAdminCreateUser = response }
export function setMockAdminUpdateUser(response: MockResponse) { mockAdminUpdateUser = response }
export function setMockProfileInsert(response: MockResponse) { mockProfileInsert = response }
export function setMockProfileUpdate(response: MockResponse) { mockProfileUpdate = response }

export function resetSupabaseMock() {
  mockAuthGetUser = { data: { user: null }, error: null }
  mockProfileSelect = { data: null, error: null }
  mockGradesInsert = { data: null, error: null }
  mockGradesSelect = { data: [], error: null }
  mockCoursesSelect = { data: null, error: null }
  mockEnrollmentsSelect = { data: [], error: null }
  mockAnnouncementsSelect = { data: [], error: null }
  mockRecordingsSelect = { data: [], error: null, count: 0 }
  mockAuthSignIn = { data: {}, error: null }
  mockAuthUpdateUser = { data: {}, error: null }
  mockAuthSignOut = { data: {}, error: null }
  mockAdminCreateUser = { data: { user: { id: 'new-user-id' } }, error: null }
  mockAdminUpdateUser = { data: {}, error: null }
  mockProfileInsert = { data: null, error: null }
  mockProfileUpdate = { data: null, error: null }
}

// Tracks which table was last queried so we can return different data per table
function makeQueryBuilder(table: string) {
  const builder: Record<string, unknown> = {}

  const selectFn = () => {
    const selectBuilder: Record<string, unknown> = {}
    const chain = {
      eq: () => chain,
      neq: () => chain,
      in: () => chain,
      order: () => chain,
      limit: () => chain,
      single: async () => {
        if (table === 'profiles') return mockProfileSelect
        if (table === 'courses') return mockCoursesSelect
        return { data: null, error: null }
      },
      then: (resolve: (v: MockResponse) => void) => {
        if (table === 'grades') resolve(mockGradesSelect)
        else if (table === 'enrollments') resolve(mockEnrollmentsSelect)
        else if (table === 'announcements') resolve(mockAnnouncementsSelect)
        else if (table === 'recordings') resolve(mockRecordingsSelect)
        else resolve({ data: [], error: null })
      },
      // for count queries
      head: true,
      count: mockRecordingsSelect.count,
    }
    Object.assign(selectBuilder, chain)
    return selectBuilder
  }

  const insertFn = () => {
    const insertBuilder = {
      then: (resolve: (v: MockResponse) => void) => {
        if (table === 'grades') resolve(mockGradesInsert)
        else if (table === 'profiles') resolve(mockProfileInsert)
        else resolve({ data: null, error: null })
      }
    }
    return insertBuilder
  }

  const updateFn = () => {
    const updateBuilder = {
      eq: () => updateBuilder,
      then: (resolve: (v: MockResponse) => void) => {
        if (table === 'profiles') resolve(mockProfileUpdate)
        else resolve({ data: null, error: null })
      }
    }
    return updateBuilder
  }

  builder['select'] = selectFn
  builder['insert'] = insertFn
  builder['update'] = updateFn

  return builder
}

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: jest.fn().mockImplementation(() => Promise.resolve(mockAuthGetUser)),
      signInWithPassword: jest.fn().mockImplementation(() => Promise.resolve(mockAuthSignIn)),
      updateUser: jest.fn().mockImplementation(() => Promise.resolve(mockAuthUpdateUser)),
      signOut: jest.fn().mockImplementation(() => Promise.resolve(mockAuthSignOut)),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      }),
    },
    from: jest.fn().mockImplementation((table: string) => makeQueryBuilder(table)),
  }
}

export function createMockAdminClient() {
  return {
    auth: {
      admin: {
        createUser: jest.fn().mockImplementation(() => Promise.resolve(mockAdminCreateUser)),
        updateUserById: jest.fn().mockImplementation(() => Promise.resolve(mockAdminUpdateUser)),
      }
    },
    from: jest.fn().mockImplementation((table: string) => makeQueryBuilder(table)),
  }
}
