require('@testing-library/jest-dom')

const { TextEncoder, TextDecoder } = require('node:util')
const { ReadableStream, TransformStream } = require('node:stream/web')

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream
}
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = TransformStream
}

const {
  fetch: edgeFetch,
  Headers,
  Request,
  Response,
  FormData,
  Blob,
  File,
} = require('next/dist/compiled/@edge-runtime/primitives/fetch')

if (typeof global.fetch === 'undefined') {
  global.fetch = edgeFetch
}
if (typeof global.Request === 'undefined') {
  global.Request = Request
}
if (typeof global.Response === 'undefined') {
  global.Response = Response
}
if (typeof global.Headers === 'undefined') {
  global.Headers = Headers
}
if (typeof global.FormData === 'undefined') {
  global.FormData = FormData
}
if (typeof global.Blob === 'undefined') {
  global.Blob = Blob
}
if (typeof global.File === 'undefined') {
  global.File = File
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
