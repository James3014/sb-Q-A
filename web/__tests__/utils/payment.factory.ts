export const PaymentFactory = {
  validCheckoutRequest: (overrides = {}) => ({
    planId: 'pass_7',
    turnstileToken: 'test-token',
    ...overrides
  }),

  userProfile: (overrides = {}) => ({
    id: 'test-user-123',
    email: 'test@example.com',
    subscription_type: 'free',
    subscription_expires_at: null,
    ...overrides
  }),

  activeSubscription: () => ({
    subscription_type: 'pass_7',
    subscription_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }),

  expiredSubscription: () => ({
    subscription_type: 'pass_7', 
    subscription_expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }),

  webhookPayload: (overrides = {}) => ({
    status: 'success',
    payment_id: 'payment-123',
    amount: 180,
    currency: 'TWD',
    ...overrides
  }),

  paymentResponse: (overrides = {}) => ({
    ok: true,
    paymentId: 'payment-123',
    providerPaymentId: 'provider-123',
    checkoutUrl: 'https://checkout.test.com',
    amount: 180,
    currency: 'TWD',
    plan: { id: 'pass_7', label: '7天', days: 7 },
    ...overrides
  })
}
