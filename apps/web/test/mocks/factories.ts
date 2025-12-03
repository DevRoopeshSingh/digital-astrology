/**
 * Test data factories for creating mock objects
 */

export interface MockUserData {
  id?: string
  email?: string
  name?: string
  phone?: string
  role?: 'USER' | 'ASTROLOGER' | 'ADMIN'
}

export function createMockUserData(overrides: MockUserData = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+911234567890',
    role: 'USER' as const,
    ...overrides,
  }
}

export interface MockKundliData {
  id?: string
  userId?: string
  name?: string
  birthDate?: Date
  birthTime?: string
  birthPlace?: string
}

export function createMockKundli(overrides: MockKundliData = {}) {
  return {
    id: 'kundli-123',
    userId: 'user-123',
    name: 'Test Kundli',
    birthDate: new Date('1990-01-01'),
    birthTime: '10:30',
    birthPlace: 'Mumbai, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    chartData: {},
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export interface MockProductData {
  id?: string
  name?: string
  price?: number
  category?: string
}

export function createMockProduct(overrides: MockProductData = {}) {
  return {
    id: 'product-123',
    slug: 'test-product',
    name: 'Test Product',
    description: 'Test product description',
    price: 999,
    category: 'gemstones',
    imageUrl: 'https://example.com/image.jpg',
    images: [],
    inStock: true,
    stockCount: 10,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export interface MockConsultationData {
  id?: string
  userId?: string
  astrologerId?: string
  scheduledAt?: Date
  duration?: number
}

export function createMockConsultation(overrides: MockConsultationData = {}) {
  return {
    id: 'consultation-123',
    userId: 'user-123',
    astrologerId: 'astrologer-123',
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    duration: 30,
    status: 'SCHEDULED' as const,
    amount: 500,
    paymentStatus: 'PENDING' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export interface MockAstrologerData {
  id?: string
  name?: string
  specialization?: string[]
  hourlyRate?: number
}

export function createMockAstrologer(overrides: MockAstrologerData = {}) {
  return {
    id: 'astrologer-123',
    userId: 'user-456',
    name: 'Test Astrologer',
    specialization: ['Vedic', 'Numerology'],
    languages: ['English', 'Hindi'],
    experience: 10,
    rating: 4.5,
    totalReviews: 100,
    hourlyRate: 500,
    imageUrl: 'https://example.com/astrologer.jpg',
    bio: 'Experienced astrologer',
    verified: true,
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export interface MockPanchangData {
  date?: string
  tithi?: string
  nakshatra?: string
}

export function createMockPanchang(overrides: MockPanchangData = {}) {
  return {
    date: new Date().toISOString().split('T')[0],
    tithi: 'Shukla Paksha Pratipada',
    nakshatra: 'Ashwini',
    yoga: 'Vishkambha',
    karana: 'Kinstughna',
    sunrise: '06:05',
    sunset: '18:45',
    moonrise: '07:30',
    moonset: '19:15',
    ...overrides,
  }
}

export interface MockHoroscopeData {
  sunSign?: string
  date?: string
}

export function createMockHoroscope(overrides: MockHoroscopeData = {}) {
  return {
    sunSign: 'aries',
    date: new Date().toISOString().split('T')[0],
    prediction: {
      general: 'Today is a good day for new beginnings.',
      career: 'Focus on your goals and stay determined.',
      love: 'Communication is key in relationships.',
      health: 'Take time to rest and recharge.',
    },
    luckyNumber: 7,
    luckyColor: 'Red',
    mood: 'Optimistic',
    ...overrides,
  }
}
