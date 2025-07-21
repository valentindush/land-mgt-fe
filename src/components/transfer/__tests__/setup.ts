import { vi } from 'vitest'

// Mock global objects
global.File = class MockFile {
  name: string
  size: number
  type: string
  content: string

  constructor(content: string[], name: string, options: { type: string }) {
    this.content = content.join('')
    this.name = name
    this.type = options.type
    this.size = this.content.length
  }
} as any

global.FormData = class MockFormData {
  private data: Map<string, any> = new Map()

  append(key: string, value: any) {
    this.data.set(key, value)
  }

  get(key: string) {
    return this.data.get(key)
  }

  has(key: string) {
    return this.data.has(key)
  }
} as any

// Mock fetch for Cloudinary uploads
global.fetch = vi.fn()

// Mock crypto for signature generation
global.crypto = {
  subtle: {
    digest: vi.fn().mockResolvedValue(new ArrayBuffer(20))
  }
} as any

// Mock TextEncoder
global.TextEncoder = class MockTextEncoder {
  encode(input: string) {
    return new Uint8Array(Buffer.from(input, 'utf8'))
  }
} as any

// Mock URL.createObjectURL
global.URL = {
  createObjectURL: vi.fn(() => 'mock-object-url'),
  revokeObjectURL: vi.fn()
} as any

// Mock HTMLInputElement file properties
Object.defineProperty(HTMLInputElement.prototype, 'files', {
  get() {
    return this._files || null
  },
  set(files) {
    this._files = files
  },
  configurable: true
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

export {}
