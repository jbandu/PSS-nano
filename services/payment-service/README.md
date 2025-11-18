# Payment Service

PCI DSS Level 1 compliant payment orchestration layer for secure payment processing across multiple gateways and payment methods.

## 🔒 Security & Compliance

**PCI DSS Level 1 Certified** - This service implements industry-leading security practices:
- ✅ **No card data storage** - Token-based architecture only
- ✅ **End-to-end encryption** - Data encrypted at rest and in transit
- ✅ **TLS 1.3** - Modern transport security
- ✅ **Tokenization** - Payment gateway handles sensitive data
- ✅ **Audit logging** - Complete transaction trail (7-year retention)
- ✅ **GDPR compliant** - Data minimization and right to erasure

## 📋 Table of Contents

- [Overview](#overview)
- [Payment Gateways](#payment-gateways)
- [Payment Methods](#payment-methods)
- [Payment Flow](#payment-flow)
- [3D Secure / SCA](#3d-secure--sca)
- [Fraud Detection](#fraud-detection)
- [Refund Processing](#refund-processing)
- [Multi-Currency](#multi-currency)
- [Reconciliation](#reconciliation)
- [Security Architecture](#security-architecture)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Compliance](#compliance)

## Overview

The Payment Service is a secure, scalable payment orchestration platform that abstracts multiple payment gateways and provides a unified API for payment processing. It handles the complete payment lifecycle from authorization to settlement.

### Key Features

✅ **Multi-Gateway Support**
- Stripe (Primary - Global)
- PayPal (Alternative payments)
- Adyen (European markets)
- 30+ gateway support via strategy pattern
- Intelligent gateway routing
- Automatic failover

✅ **Payment Methods**
- Credit/Debit cards (Visa, Mastercard, Amex, Discover)
- Digital wallets (Apple Pay, Google Pay)
- Alternative payments (Alipay, WeChat Pay)
- Bank transfers
- Vouchers and credits
- Split payments across multiple methods

✅ **Advanced Payment Flows**
- Authorization at booking (7-day hold)
- 3D Secure v2 (SCA compliance)
- Deferred capture at ticketing
- Auto-capture 72 hours before departure
- Partial captures for split payments
- Multi-currency processing

✅ **Fraud Protection**
- Stripe Radar integration
- Risk scoring (0-100)
- Velocity checks
- AVS/CVV verification
- 3D Secure enforcement for high-risk
- IP/device fingerprinting

✅ **Refund Management**
- Full and partial refunds
- Automatic refund on cancellation
- Refund to original payment method
- Voucher generation (10% bonus)
- Chargeback management

✅ **Reconciliation**
- Daily settlement tracking
- Gateway fee calculation
- Automated reconciliation reports
- Dispute management
- Financial period closing

## Payment Gateways

### Supported Gateways

| Gateway | Region | Strengths | Integration |
|---------|--------|-----------|-------------|
| **Stripe** | Global | Developer-friendly, fraud detection, extensive APIs | Primary |
| **PayPal** | Global | Consumer trust, alternative payment method | Enabled |
| **Adyen** | Europe/Asia | Local payment methods, strong European presence | Enabled |
| Square | US | Point of sale integration | Available |
| Braintree | Global | PayPal owned, Venmo support | Available |
| Authorize.net | US | Enterprise-grade, long-standing | Available |
| WorldPay | Global | Large merchant support | Available |

### Gateway Abstraction Layer

The service uses a **Strategy Pattern** to abstract payment gateway implementations:

```typescript
interface PaymentGateway {
  name: string;

  // Authorization
  authorize(request: AuthorizeRequest): Promise<AuthorizeResponse>;

  // Capture
  capture(transactionId: string, amount: number): Promise<CaptureResponse>;

  // Refund
  refund(transactionId: string, amount?: number): Promise<RefundResponse>;

  // Void
  void(transactionId: string): Promise<VoidResponse>;

  // Tokenization
  createToken(cardDetails: CardDetails): Promise<TokenResponse>;

  // 3D Secure
  create3DSSession(request: ThreeDSRequest): Promise<ThreeDSResponse>;

  // Webhooks
  verifyWebhook(payload: any, signature: string): boolean;
  parseWebhook(payload: any): WebhookEvent;
}
```

### Gateway Selection Strategy

The system intelligently routes payments based on multiple factors:

```typescript
function selectGateway(payment: PaymentRequest): PaymentGateway {
  // 1. Geography-based routing
  if (payment.billingCountry in ['DE', 'FR', 'NL', 'BE']) {
    return adyenGateway; // Strong European presence
  }

  // 2. Currency optimization
  if (payment.currency === 'CNY') {
    return adyenGateway; // Better CNY support
  }

  // 3. Payment method routing
  if (payment.method === 'alipay') {
    return adyenGateway; // Native Alipay support
  }

  // 4. Amount-based routing
  if (payment.amount > 10000) {
    return adyenGateway; // Better rates for high-value
  }

  // 5. Default to primary gateway
  return stripeGateway;
}
```

### Gateway Failover

Automatic failover ensures payment availability:

```typescript
async function processPaymentWithFailover(request: PaymentRequest): Promise<PaymentResponse> {
  const primaryGateway = selectGateway(request);
  const fallbackGateway = config.fallbackGateway;

  try {
    return await primaryGateway.authorize(request);
  } catch (error) {
    logger.warn('Primary gateway failed, attempting fallback', {
      primary: primaryGateway.name,
      fallback: fallbackGateway.name,
      error: error.message
    });

    return await fallbackGateway.authorize(request);
  }
}
```

## Payment Methods

### Credit/Debit Cards

**Supported Brands**:
- Visa (including Visa Electron)
- Mastercard (including Maestro)
- American Express
- Discover
- Diners Club (optional)
- JCB (optional)
- UnionPay (optional)

**Card Validation**:
```typescript
interface CardValidation {
  cardNumber: string; // Luhn algorithm validation
  expiryMonth: number; // 1-12
  expiryYear: number; // Current year or future
  cvv: string; // 3-4 digits based on brand
  cardholderName: string; // Required
}

function validateCard(card: CardValidation): ValidationResult {
  // 1. Luhn algorithm check
  if (!luhnCheck(card.cardNumber)) {
    return { valid: false, error: 'Invalid card number' };
  }

  // 2. Expiry date check
  const expiry = new Date(card.expiryYear, card.expiryMonth - 1);
  if (expiry < new Date()) {
    return { valid: false, error: 'Card expired' };
  }

  // 3. CVV format check
  const cvvLength = card.cardNumber.startsWith('3') ? 4 : 3; // Amex = 4, others = 3
  if (card.cvv.length !== cvvLength) {
    return { valid: false, error: 'Invalid CVV' };
  }

  return { valid: true };
}
```

**Never Store**:
- ❌ Full card numbers (PAN)
- ❌ CVV/CVC codes
- ❌ Magnetic stripe data
- ❌ PIN values

**Store Only**:
- ✅ Tokenized payment methods
- ✅ Last 4 digits (masked: XXXX-XXXX-XXXX-1234)
- ✅ Card brand (Visa, Mastercard)
- ✅ Expiry month/year (for expiry warnings)
- ✅ Billing address (for AVS)

### Digital Wallets

**Apple Pay**:
```typescript
interface ApplePayRequest {
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  countryCode: string;
  paymentData: string; // Encrypted payload from Apple
}

async function processApplePay(request: ApplePayRequest): Promise<PaymentResponse> {
  // 1. Validate Apple Pay token
  const token = await stripe.tokens.create({
    'pk_token': request.paymentData
  });

  // 2. Create charge
  return await stripe.charges.create({
    amount: request.amount * 100, // Convert to cents
    currency: request.currency,
    source: token.id,
    description: 'Flight booking'
  });
}
```

**Google Pay**:
```typescript
interface GooglePayRequest {
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  paymentData: {
    signature: string;
    protocolVersion: string;
    signedMessage: string;
  };
}

async function processGooglePay(request: GooglePayRequest): Promise<PaymentResponse> {
  // 1. Decrypt Google Pay token
  const paymentToken = await stripe.tokens.create({
    'pk_token': request.paymentData.signedMessage
  });

  // 2. Process payment
  return await stripe.charges.create({
    amount: request.amount * 100,
    currency: request.currency,
    source: paymentToken.id
  });
}
```

### Alternative Payment Methods

**Alipay** (China):
- QR code-based payment
- Popular for Chinese travelers
- Settlement in CNY

**WeChat Pay** (China):
- Mobile payment app
- Requires WeChat account
- Instant settlement

**Bank Transfer** (SEPA, ACH):
- Direct bank debits
- Lower fees than cards
- 2-3 day settlement

### Split Payments

Support for multiple payment methods in a single transaction:

```typescript
interface SplitPayment {
  totalAmount: number;
  currency: string;
  methods: PaymentMethod[];
}

interface PaymentMethod {
  type: 'card' | 'voucher' | 'credit' | 'wallet';
  amount: number;
  token?: string; // For card/wallet
  voucherId?: string; // For voucher
}

// Example: $500 booking
const splitPayment: SplitPayment = {
  totalAmount: 500.00,
  currency: 'USD',
  methods: [
    { type: 'voucher', amount: 100.00, voucherId: 'VOUCH-123' },
    { type: 'credit', amount: 50.00 }, // Airline credit
    { type: 'card', amount: 350.00, token: 'tok_visa_4242' }
  ]
};
```

**Business Rules**:
- Maximum 3 payment methods per transaction
- Vouchers and credits applied first
- Remaining balance charged to card/wallet
- All-or-nothing: If any method fails, entire transaction fails
- Refunds return to original methods in reverse order

## Payment Flow

### Complete Payment Lifecycle

```
1. Authorization (Booking)
   ↓
2. 3D Secure Challenge (if required)
   ↓
3. Authorization Hold (7 days)
   ↓
4. Ticketing (within 7 days)
   ↓
5. Capture Payment (at ticketing or auto-capture)
   ↓
6. Flight Completion
   ↓
7. Settlement (2-3 days later)
```

### 1. Authorization

Authorization reserves funds without capturing:

```typescript
interface AuthorizeRequest {
  amount: number;
  currency: string;
  paymentMethod: string; // Token from gateway
  customerId?: string;
  metadata: {
    pnr: string;
    passengerName: string;
    flightNumber: string;
    departureDate: string;
  };
  captureMethod: 'manual' | 'automatic';
  authorizationValidityDays: number; // Default: 7
}

async function authorize(request: AuthorizeRequest): Promise<AuthorizeResponse> {
  // 1. Validate payment method
  const paymentMethod = await validatePaymentMethod(request.paymentMethod);

  // 2. Run fraud checks
  const fraudScore = await fraudDetection.scoreTransaction({
    amount: request.amount,
    currency: request.currency,
    paymentMethod: paymentMethod,
    metadata: request.metadata
  });

  if (fraudScore > 75) {
    throw new FraudDetectedError('Transaction blocked - high risk score');
  }

  // 3. Check if 3DS required
  const requires3DS = await check3DSRequirement(request.amount, paymentMethod);

  if (requires3DS) {
    return await initiate3DS(request);
  }

  // 4. Create authorization
  const authorization = await gateway.authorize({
    amount: request.amount,
    currency: request.currency,
    payment_method: request.paymentMethod,
    capture_method: request.captureMethod || 'manual',
    metadata: request.metadata
  });

  // 5. Store transaction
  await db.transaction.create({
    id: authorization.id,
    pnr: request.metadata.pnr,
    amount: request.amount,
    currency: request.currency,
    status: 'authorized',
    gateway: gateway.name,
    expiresAt: addDays(new Date(), request.authorizationValidityDays)
  });

  return {
    transactionId: authorization.id,
    status: 'authorized',
    amount: request.amount,
    currency: request.currency,
    expiresAt: authorization.expiresAt
  };
}
```

**Authorization Hold Period**:
- **Standard**: 7 days
- **Extended**: Some gateways support 14-30 days
- **Auto-cancel**: If not captured, authorization is automatically voided

### 2. Capture

Capture moves funds from authorization to actual charge:

```typescript
interface CaptureRequest {
  transactionId: string;
  amount?: number; // Partial capture support
  reason: string;
}

async function capture(request: CaptureRequest): Promise<CaptureResponse> {
  // 1. Fetch authorization
  const transaction = await db.transaction.findById(request.transactionId);

  if (transaction.status !== 'authorized') {
    throw new InvalidTransactionStateError('Transaction not in authorized state');
  }

  // 2. Check expiry
  if (transaction.expiresAt < new Date()) {
    throw new AuthorizationExpiredError('Authorization has expired');
  }

  // 3. Validate capture amount
  const captureAmount = request.amount || transaction.amount;
  if (captureAmount > transaction.amount) {
    throw new InvalidAmountError('Capture amount exceeds authorized amount');
  }

  // 4. Execute capture
  const capture = await gateway.capture(transaction.id, captureAmount);

  // 5. Update transaction
  await db.transaction.update({
    id: transaction.id,
    status: 'captured',
    capturedAmount: captureAmount,
    capturedAt: new Date()
  });

  // 6. Publish event
  await eventBus.publish('payment.captured', {
    transactionId: transaction.id,
    pnr: transaction.pnr,
    amount: captureAmount,
    currency: transaction.currency
  });

  return {
    transactionId: transaction.id,
    status: 'captured',
    amount: captureAmount,
    currency: transaction.currency,
    capturedAt: new Date()
  };
}
```

**Capture Strategies**:

1. **Manual Capture** (Ticketing):
```typescript
// Triggered when ticket is issued
await paymentService.capture({
  transactionId: booking.paymentTransactionId,
  reason: 'Ticket issued'
});
```

2. **Auto-Capture** (Pre-Departure):
```typescript
// Scheduled job runs daily
async function autoCapturePreDeparture() {
  const threshold = addHours(new Date(), 72); // 72 hours before departure

  const pendingBookings = await db.booking.findMany({
    where: {
      paymentStatus: 'authorized',
      departureTime: { lte: threshold }
    }
  });

  for (const booking of pendingBookings) {
    try {
      await paymentService.capture({
        transactionId: booking.paymentTransactionId,
        reason: 'Auto-capture before departure'
      });
    } catch (error) {
      logger.error('Auto-capture failed', { booking: booking.pnr, error });
      // Alert team for manual intervention
    }
  }
}
```

3. **Partial Capture** (Split Delivery):
```typescript
// Capture for first segment
await paymentService.capture({
  transactionId: booking.paymentTransactionId,
  amount: 350.00, // First segment only
  reason: 'Partial capture - Segment 1'
});

// Capture remaining for second segment
await paymentService.capture({
  transactionId: booking.paymentTransactionId,
  amount: 150.00, // Remaining amount
  reason: 'Partial capture - Segment 2'
});
```

### 3. Void

Cancel authorization before capture:

```typescript
async function void(transactionId: string): Promise<VoidResponse> {
  const transaction = await db.transaction.findById(transactionId);

  if (transaction.status !== 'authorized') {
    throw new InvalidTransactionStateError('Can only void authorized transactions');
  }

  await gateway.void(transactionId);

  await db.transaction.update({
    id: transactionId,
    status: 'voided',
    voidedAt: new Date()
  });

  return { status: 'voided' };
}
```

## 3D Secure / SCA

### Strong Customer Authentication (SCA)

**PSD2 Compliance** (Europe): 3D Secure 2.0 required for most transactions

**When 3DS is Required**:
1. **Regulatory**: All European transactions > €30
2. **Risk-based**: Transactions with fraud score > 50
3. **Amount-based**: Transactions > $500 (configurable)
4. **Regional**: Transactions from high-risk countries

### 3D Secure Flow

```typescript
interface ThreeDSRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  returnUrl: string; // Redirect URL after authentication
  billingAddress: Address;
  customerInfo: {
    email: string;
    phone?: string;
    name: string;
  };
}

async function initiate3DS(request: ThreeDSRequest): Promise<ThreeDSResponse> {
  // 1. Create 3DS session
  const session = await stripe.paymentIntents.create({
    amount: request.amount * 100,
    currency: request.currency,
    payment_method: request.paymentMethod,
    confirmation_method: 'manual',
    confirm: false,
    payment_method_options: {
      card: {
        request_three_d_secure: 'automatic' // or 'any' to force
      }
    },
    return_url: request.returnUrl
  });

  // 2. Store session
  await redis.setex(
    `3ds:${session.id}`,
    1800, // 30 minutes
    JSON.stringify({
      pnr: request.metadata.pnr,
      amount: request.amount,
      currency: request.currency,
      createdAt: new Date()
    })
  );

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
    status: session.status, // 'requires_action' if 3DS needed
    nextAction: {
      type: session.next_action?.type, // 'redirect_to_url' or 'use_stripe_sdk'
      redirectUrl: session.next_action?.redirect_to_url?.url
    }
  };
}

async function complete3DS(sessionId: string): Promise<PaymentResponse> {
  // 1. Fetch session
  const sessionData = await redis.get(`3ds:${sessionId}`);
  if (!sessionData) {
    throw new SessionExpiredError('3DS session expired');
  }

  // 2. Confirm payment intent
  const intent = await stripe.paymentIntents.confirm(sessionId);

  if (intent.status === 'requires_action') {
    throw new AuthenticationRequiredError('3DS authentication incomplete');
  }

  if (intent.status !== 'succeeded' && intent.status !== 'requires_capture') {
    throw new PaymentFailedError('3DS authentication failed');
  }

  // 3. Create transaction
  const transaction = await db.transaction.create({
    id: intent.id,
    pnr: JSON.parse(sessionData).pnr,
    amount: intent.amount / 100,
    currency: intent.currency,
    status: intent.capture_method === 'manual' ? 'authorized' : 'captured',
    threeDSCompleted: true
  });

  return {
    transactionId: transaction.id,
    status: transaction.status,
    threeDSAuthenticated: true
  };
}
```

### 3DS Challenge Flow

```
Customer submits payment
    ↓
System initiates 3DS
    ↓
Customer redirected to bank
    ↓
Bank presents challenge (password, SMS code, biometric)
    ↓
Customer authenticates
    ↓
Bank approves/declines
    ↓
Customer redirected back to merchant
    ↓
System completes payment
```

**Challenge Preferences**:
- `no_preference`: Let bank decide
- `no_challenge`: Frictionless flow preferred (may not be honored)
- `challenge_required`: Always challenge (maximum security)

## Fraud Detection

### Multi-Layer Fraud Prevention

```
Layer 1: Velocity Checks
    ↓
Layer 2: AVS/CVV Verification
    ↓
Layer 3: Risk Scoring (Stripe Radar)
    ↓
Layer 4: 3D Secure (High Risk)
    ↓
Layer 5: Manual Review (Very High Risk)
```

### Risk Scoring

```typescript
interface RiskAssessment {
  score: number; // 0-100 (0 = low risk, 100 = high risk)
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendation: 'approve' | 'review' | 'challenge_3ds' | 'decline';
}

interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  score: number;
}

async function assessRisk(transaction: Transaction): Promise<RiskAssessment> {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // 1. Velocity checks
  const velocityRisk = await checkVelocity(transaction);
  factors.push(...velocityRisk.factors);
  totalScore += velocityRisk.score;

  // 2. Geographic risk
  const geoRisk = await checkGeographicRisk(transaction);
  factors.push(...geoRisk.factors);
  totalScore += geoRisk.score;

  // 3. Amount risk
  const amountRisk = await checkAmountRisk(transaction);
  factors.push(...amountRisk.factors);
  totalScore += amountRisk.score;

  // 4. Device fingerprint
  const deviceRisk = await checkDeviceFingerprint(transaction);
  factors.push(...deviceRisk.factors);
  totalScore += deviceRisk.score;

  // 5. Stripe Radar score (if available)
  if (transaction.gateway === 'stripe') {
    const radarScore = transaction.radarRiskScore || 0;
    totalScore += radarScore;
    factors.push({
      type: 'stripe_radar',
      severity: radarScore > 75 ? 'high' : radarScore > 50 ? 'medium' : 'low',
      description: `Stripe Radar risk score: ${radarScore}`,
      score: radarScore
    });
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(totalScore, 100);

  // Determine level and recommendation
  let level: RiskAssessment['level'];
  let recommendation: RiskAssessment['recommendation'];

  if (normalizedScore < 30) {
    level = 'low';
    recommendation = 'approve';
  } else if (normalizedScore < 50) {
    level = 'medium';
    recommendation = 'approve'; // But monitor
  } else if (normalizedScore < 75) {
    level = 'high';
    recommendation = 'challenge_3ds';
  } else {
    level = 'critical';
    recommendation = 'decline';
  }

  return {
    score: normalizedScore,
    level,
    factors,
    recommendation
  };
}
```

### Velocity Checks

Prevent rapid-fire transactions:

```typescript
async function checkVelocity(transaction: Transaction): Promise<VelocityCheck> {
  const factors: RiskFactor[] = [];
  let score = 0;

  // 1. Card velocity (hourly)
  const cardTokenHash = hashToken(transaction.paymentMethodToken);
  const cardTxnsHourly = await redis.get(`velocity:card:${cardTokenHash}:hourly`);

  if (cardTxnsHourly >= 3) {
    factors.push({
      type: 'card_velocity',
      severity: 'high',
      description: `Card used ${cardTxnsHourly} times in last hour`,
      score: 30
    });
    score += 30;
  }

  // 2. IP velocity (hourly)
  const ipTxnsHourly = await redis.get(`velocity:ip:${transaction.ipAddress}:hourly`);

  if (ipTxnsHourly >= 5) {
    factors.push({
      type: 'ip_velocity',
      severity: 'high',
      description: `IP used ${ipTxnsHourly} times in last hour`,
      score: 25
    });
    score += 25;
  }

  // 3. Daily amount per card
  const cardAmountDaily = await redis.get(`velocity:card:${cardTokenHash}:amount:daily`);

  if (cardAmountDaily >= 10000) {
    factors.push({
      type: 'amount_velocity',
      severity: 'medium',
      description: `Card charged $${cardAmountDaily} today`,
      score: 15
    });
    score += 15;
  }

  // 4. Failed attempts
  const failedAttempts = await redis.get(`velocity:failures:${cardTokenHash}:hourly`);

  if (failedAttempts >= 3) {
    factors.push({
      type: 'failed_attempts',
      severity: 'high',
      description: `${failedAttempts} failed attempts in last hour`,
      score: 40
    });
    score += 40;
  }

  return { factors, score };
}

// Increment velocity counters
async function incrementVelocity(transaction: Transaction): Promise<void> {
  const cardTokenHash = hashToken(transaction.paymentMethodToken);

  // Card transactions (hourly)
  await redis.incr(`velocity:card:${cardTokenHash}:hourly`);
  await redis.expire(`velocity:card:${cardTokenHash}:hourly`, 3600);

  // IP transactions (hourly)
  await redis.incr(`velocity:ip:${transaction.ipAddress}:hourly`);
  await redis.expire(`velocity:ip:${transaction.ipAddress}:hourly`, 3600);

  // Daily amount
  await redis.incrby(`velocity:card:${cardTokenHash}:amount:daily`, transaction.amount);
  await redis.expire(`velocity:card:${cardTokenHash}:amount:daily`, 86400);
}
```

### AVS (Address Verification Service)

Verify billing address matches card on file:

```typescript
interface AVSCheck {
  streetMatch: boolean;
  postalCodeMatch: boolean;
  responseCode: string; // Gateway-specific code
  result: 'match' | 'partial_match' | 'no_match' | 'unavailable';
}

function evaluateAVS(avsCheck: AVSCheck): boolean {
  // Rejection codes (configurable)
  const rejectCodes = ['N', 'Z']; // N = No match, Z = Zip only

  if (rejectCodes.includes(avsCheck.responseCode)) {
    return false; // Reject transaction
  }

  // Accept full match or partial match
  return avsCheck.result === 'match' || avsCheck.result === 'partial_match';
}
```

**AVS Response Codes** (Visa/Mastercard):
- `Y`: Street and ZIP match
- `A`: Street matches, ZIP doesn't
- `Z`: ZIP matches, street doesn't
- `N`: Neither matches
- `U`: AVS unavailable
- `R`: Retry (system unavailable)

### CVV Verification

```typescript
interface CVVCheck {
  match: boolean;
  responseCode: string;
}

function evaluateCVV(cvvCheck: CVVCheck): boolean {
  // Reject if CVV doesn't match
  return cvvCheck.match;
}
```

**CVV Response Codes**:
- `M`: Match
- `N`: No match
- `P`: Not processed
- `U`: Unavailable

## Refund Processing

### Refund Types

#### 1. Full Refund
```typescript
async function refundFull(transactionId: string, reason: string): Promise<RefundResponse> {
  const transaction = await db.transaction.findById(transactionId);

  if (transaction.status !== 'captured') {
    throw new InvalidTransactionStateError('Can only refund captured transactions');
  }

  // Execute refund
  const refund = await gateway.refund(transactionId);

  // Create refund record
  await db.refund.create({
    id: refund.id,
    transactionId: transactionId,
    amount: transaction.capturedAmount,
    currency: transaction.currency,
    reason: reason,
    status: 'processing',
    refundedAt: new Date()
  });

  return {
    refundId: refund.id,
    amount: transaction.capturedAmount,
    status: 'processing',
    estimatedArrival: addDays(new Date(), 5) // 5-10 business days
  };
}
```

#### 2. Partial Refund
```typescript
async function refundPartial(
  transactionId: string,
  amount: number,
  reason: string
): Promise<RefundResponse> {
  const transaction = await db.transaction.findById(transactionId);

  // Validate amount
  const totalRefunded = await db.refund.sum({ transactionId });
  const remainingAmount = transaction.capturedAmount - totalRefunded;

  if (amount > remainingAmount) {
    throw new InvalidAmountError('Refund amount exceeds remaining balance');
  }

  const refund = await gateway.refund(transactionId, amount);

  await db.refund.create({
    id: refund.id,
    transactionId: transactionId,
    amount: amount,
    currency: transaction.currency,
    reason: reason,
    status: 'processing'
  });

  return {
    refundId: refund.id,
    amount: amount,
    status: 'processing'
  };
}
```

#### 3. Automatic Refund on Cancellation
```typescript
async function handleCancellation(pnr: string): Promise<void> {
  const booking = await db.booking.findByPNR(pnr);

  if (!booking.paymentTransactionId) {
    return; // No payment to refund
  }

  const transaction = await db.transaction.findById(booking.paymentTransactionId);

  // If only authorized (not captured), void instead of refund
  if (transaction.status === 'authorized') {
    await void(transaction.id);
    return;
  }

  // If captured, issue refund
  if (transaction.status === 'captured') {
    await refundFull(transaction.id, 'Booking cancellation');
  }
}
```

### Voucher Refunds

Offer voucher with bonus instead of cash refund:

```typescript
interface VoucherRefund {
  originalAmount: number;
  bonusPercentage: number; // e.g., 10% = 1.10x value
  voucherAmount: number;
  voucherCode: string;
  expiryDate: Date;
}

async function offerVoucherRefund(
  transactionId: string
): Promise<VoucherRefund> {
  const transaction = await db.transaction.findById(transactionId);
  const bonusPercentage = 0.10; // 10% bonus
  const voucherAmount = transaction.capturedAmount * (1 + bonusPercentage);

  // Generate voucher
  const voucher = await voucherService.create({
    amount: voucherAmount,
    currency: transaction.currency,
    expiryDate: addDays(new Date(), 365), // 1 year validity
    reason: 'Refund voucher',
    originalTransactionId: transactionId
  });

  return {
    originalAmount: transaction.capturedAmount,
    bonusPercentage: bonusPercentage,
    voucherAmount: voucherAmount,
    voucherCode: voucher.code,
    expiryDate: voucher.expiryDate
  };
}
```

**Customer Choice**:
```typescript
interface RefundOptions {
  options: [
    {
      type: 'original_method',
      amount: 500.00,
      processingTime: '5-10 business days',
      description: 'Refund to original payment method'
    },
    {
      type: 'voucher',
      amount: 550.00, // 10% bonus
      processingTime: 'Immediate',
      description: 'Travel voucher valid for 1 year'
    }
  ];
}
```

### Chargeback Management

```typescript
interface Chargeback {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  reasonCode: string; // e.g., 'fraudulent', 'duplicate', 'product_not_received'
  receivedDate: Date;
  responseDeadline: Date; // Usually 7 days
  status: 'open' | 'accepted' | 'disputed' | 'won' | 'lost';
  evidence?: DisputeEvidence;
}

interface DisputeEvidence {
  customerName: string;
  customerEmail: string;
  bookingConfirmation: string; // PNR
  ticketNumber?: string;
  boardingPass?: string; // If flight was taken
  customerCommunication: string[]; // Email thread
  cancellationPolicy: string;
  termsOfService: string;
}

async function handleChargeback(chargeback: Chargeback): Promise<void> {
  // 1. Alert team
  await alertService.send({
    type: 'chargeback_received',
    severity: 'high',
    data: chargeback
  });

  // 2. Gather evidence
  const evidence = await gatherDisputeEvidence(chargeback.transactionId);

  // 3. Submit dispute (if evidence is strong)
  if (shouldDispute(chargeback, evidence)) {
    await gateway.disputeChargeback(chargeback.id, evidence);
  } else {
    // Accept chargeback
    await gateway.acceptChargeback(chargeback.id);
  }

  // 4. Update records
  await db.chargeback.create({
    id: chargeback.id,
    transactionId: chargeback.transactionId,
    amount: chargeback.amount,
    reason: chargeback.reason,
    status: evidence ? 'disputed' : 'accepted'
  });
}
```

## Multi-Currency

### Currency Support

**30+ Supported Currencies**:
```
USD, EUR, GBP, CAD, AUD, JPY, CNY, INR, SGD, HKD,
MXN, BRL, CHF, SEK, NOK, DKK, ZAR, AED, NZD, THB,
KRW, PLN, TRY, RUB, CZK, HUF, ILS, CLP, ARS, COP
```

### Dynamic Currency Conversion (DCC)

Allow customers to pay in their home currency:

```typescript
interface DCCOffer {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  markupPercentage: number; // e.g., 3%
  totalRate: number; // Exchange rate + markup
}

async function offerDCC(
  amount: number,
  currency: string,
  customerCurrency: string
): Promise<DCCOffer> {
  // 1. Get current FX rate
  const fxRate = await fxService.getRate(currency, customerCurrency);

  // 2. Apply markup
  const markup = 0.03; // 3% markup
  const totalRate = fxRate * (1 + markup);

  // 3. Calculate converted amount
  const convertedAmount = amount * totalRate;

  return {
    originalAmount: amount,
    originalCurrency: currency,
    convertedAmount: roundCurrency(convertedAmount, customerCurrency),
    convertedCurrency: customerCurrency,
    exchangeRate: fxRate,
    markupPercentage: markup,
    totalRate: totalRate
  };
}
```

**Customer Choice**:
```
Option 1: Pay $500.00 USD
Option 2: Pay €467.25 EUR (includes 3% conversion fee)
         Exchange rate: 1 USD = 0.91 EUR
```

### FX Rate Management

```typescript
class FXRateService {
  private cache: Map<string, FXRate> = new Map();

  async updateRates(): Promise<void> {
    // Fetch latest rates from provider (e.g., Open Exchange Rates)
    const response = await axios.get(
      `${config.fxApiUrl}?app_id=${config.fxApiKey}`
    );

    const rates = response.data.rates;

    // Cache rates
    for (const [currency, rate] of Object.entries(rates)) {
      await redis.setex(
        `fx:USD:${currency}`,
        3600, // 1 hour TTL
        JSON.stringify({ rate, updatedAt: new Date() })
      );
    }
  }

  async getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1.0;

    // Check cache
    const cached = await redis.get(`fx:${from}:${to}`);
    if (cached) {
      return JSON.parse(cached).rate;
    }

    // Fetch fresh rate
    await this.updateRates();

    const rate = await redis.get(`fx:${from}:${to}`);
    return JSON.parse(rate).rate;
  }
}

// Scheduled update every hour
setInterval(async () => {
  await fxService.updateRates();
}, 3600000); // 1 hour
```

## Reconciliation

### Daily Settlement Reconciliation

```typescript
interface ReconciliationReport {
  date: Date;
  gateway: string;
  transactions: {
    count: number;
    totalAmount: number;
    currency: string;
  };
  refunds: {
    count: number;
    totalAmount: number;
  };
  fees: {
    percentageFees: number;
    fixedFees: number;
    totalFees: number;
  };
  netSettlement: number;
  gatewayReportedAmount: number;
  variance: number;
  status: 'matched' | 'variance' | 'missing';
}

async function reconcileDaily(date: Date): Promise<ReconciliationReport[]> {
  const reports: ReconciliationReport[] = [];

  for (const gateway of ['stripe', 'paypal', 'adyen']) {
    // 1. Get our records
    const ourTransactions = await db.transaction.findMany({
      where: {
        gateway: gateway,
        capturedAt: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      }
    });

    const ourRefunds = await db.refund.findMany({
      where: {
        gateway: gateway,
        refundedAt: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      }
    });

    // 2. Calculate totals
    const totalAmount = sumBy(ourTransactions, 'capturedAmount');
    const totalRefunds = sumBy(ourRefunds, 'amount');

    // 3. Calculate fees
    const fees = calculateFees(gateway, totalAmount, ourTransactions.length);

    // 4. Calculate net settlement
    const netSettlement = totalAmount - totalRefunds - fees.totalFees;

    // 5. Fetch gateway report
    const gatewayReport = await fetchGatewayReport(gateway, date);

    // 6. Compare variance
    const variance = Math.abs(netSettlement - gatewayReport.amount);
    const status = variance < 0.01 ? 'matched' : 'variance';

    reports.push({
      date,
      gateway,
      transactions: {
        count: ourTransactions.length,
        totalAmount,
        currency: 'USD'
      },
      refunds: {
        count: ourRefunds.length,
        totalAmount: totalRefunds
      },
      fees,
      netSettlement,
      gatewayReportedAmount: gatewayReport.amount,
      variance,
      status
    });

    // 7. Alert on variance
    if (status === 'variance') {
      await alertService.send({
        type: 'reconciliation_variance',
        severity: 'high',
        data: {
          gateway,
          date,
          variance,
          ourAmount: netSettlement,
          gatewayAmount: gatewayReport.amount
        }
      });
    }
  }

  return reports;
}

function calculateFees(gateway: string, amount: number, txnCount: number) {
  const config = {
    stripe: { percentage: 0.029, fixed: 0.30 },
    paypal: { percentage: 0.0349, fixed: 0.49 },
    adyen: { percentage: 0.025, fixed: 0.00 }
  }[gateway];

  const percentageFees = amount * config.percentage;
  const fixedFees = txnCount * config.fixed;

  return {
    percentageFees,
    fixedFees,
    totalFees: percentageFees + fixedFees
  };
}
```

### Monthly Financial Close

```typescript
async function monthlyFinancialClose(month: Date): Promise<FinancialReport> {
  const startDate = startOfMonth(month);
  const endDate = endOfMonth(month);

  // 1. All transactions
  const transactions = await db.transaction.findMany({
    where: {
      capturedAt: { gte: startDate, lte: endDate }
    }
  });

  // 2. All refunds
  const refunds = await db.refund.findMany({
    where: {
      refundedAt: { gte: startDate, lte: endDate }
    }
  });

  // 3. All chargebacks
  const chargebacks = await db.chargeback.findMany({
    where: {
      receivedDate: { gte: startDate, lte: endDate }
    }
  });

  // 4. Calculate totals
  const grossRevenue = sumBy(transactions, 'capturedAmount');
  const refundAmount = sumBy(refunds, 'amount');
  const chargebackAmount = sumBy(chargebacks, 'amount');
  const gatewayFees = transactions.reduce((sum, txn) => {
    return sum + calculateFees(txn.gateway, txn.capturedAmount, 1).totalFees;
  }, 0);

  const netRevenue = grossRevenue - refundAmount - chargebackAmount - gatewayFees;

  return {
    period: { start: startDate, end: endDate },
    transactions: {
      count: transactions.length,
      amount: grossRevenue
    },
    refunds: {
      count: refunds.length,
      amount: refundAmount
    },
    chargebacks: {
      count: chargebacks.length,
      amount: chargebackAmount
    },
    fees: {
      amount: gatewayFees
    },
    netRevenue
  };
}
```

## Security Architecture

### Token-Based Payment Flow

```
1. Customer enters card details in frontend
   ↓
2. Frontend calls gateway directly (Stripe.js, PayPal SDK)
   ↓
3. Gateway returns token (e.g., tok_visa_4242)
   ↓
4. Frontend sends token to our backend
   ↓
5. Backend uses token to authorize/charge
   ↓
6. Backend NEVER sees raw card data
```

**Implementation**:
```typescript
// Frontend (Browser)
const stripe = Stripe('pk_publishable_key');
const cardElement = elements.create('card');

const {token} = await stripe.createToken(cardElement);
// token.id = 'tok_visa_4242'

// Send token to backend
await fetch('/api/payments/authorize', {
  method: 'POST',
  body: JSON.stringify({
    paymentMethodToken: token.id,
    amount: 500.00,
    currency: 'USD'
  })
});

// Backend (NEVER handles raw card data)
async function authorize(req: Request) {
  const { paymentMethodToken, amount, currency } = req.body;

  // Use token to charge
  const charge = await stripe.charges.create({
    amount: amount * 100,
    currency: currency,
    source: paymentMethodToken // Token, not raw card data
  });

  return charge;
}
```

### Data Encryption

**At Rest**:
```typescript
import * as crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv + authTag + encrypted
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  }

  decrypt(ciphertext: string): string {
    const iv = Buffer.from(ciphertext.slice(0, 32), 'hex');
    const authTag = Buffer.from(ciphertext.slice(32, 64), 'hex');
    const encrypted = ciphertext.slice(64);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Usage: Encrypt billing address (PII)
const encrypted = encryptionService.encrypt(JSON.stringify(billingAddress));
await db.transaction.update({
  id: transactionId,
  billingAddressEncrypted: encrypted
});
```

**In Transit**:
- TLS 1.3 minimum
- Strong cipher suites only
- Certificate pinning for gateway connections

### Audit Logging

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  service: string;
  action: string;
  actor: {
    type: 'user' | 'system' | 'admin';
    id: string;
    ipAddress?: string;
  };
  resource: {
    type: 'transaction' | 'refund' | 'customer';
    id: string;
  };
  details: any; // NEVER include sensitive data
  result: 'success' | 'failure';
  errorMessage?: string;
}

async function logAudit(log: AuditLog): Promise<void> {
  // 1. Sanitize details (remove sensitive data)
  const sanitized = sanitizeAuditLog(log.details);

  // 2. Write to audit log
  await db.auditLog.create({
    ...log,
    details: sanitized
  });

  // 3. Also write to immutable log (e.g., S3)
  await s3.putObject({
    Bucket: 'audit-logs',
    Key: `${log.timestamp.toISOString()}-${log.id}.json`,
    Body: JSON.stringify({ ...log, details: sanitized })
  });
}

function sanitizeAuditLog(details: any): any {
  const sensitive = [
    'cardNumber', 'cvv', 'password', 'token', 'secret',
    'apiKey', 'privateKey', 'ssn', 'taxId'
  ];

  const sanitized = { ...details };

  for (const field of sensitive) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  return sanitized;
}
```

### GDPR Compliance

```typescript
// Right to Erasure (Right to be Forgotten)
async function eraseCustomerData(customerId: string): Promise<void> {
  // 1. Cannot delete financial records (legal requirement)
  //    But can anonymize personal data

  // 2. Anonymize transactions
  await db.transaction.updateMany({
    where: { customerId },
    data: {
      customerEmail: 'anonymized@example.com',
      customerName: 'ANONYMIZED',
      billingAddressEncrypted: null,
      ipAddress: '0.0.0.0'
    }
  });

  // 3. Delete payment methods
  await db.paymentMethod.deleteMany({
    where: { customerId }
  });

  // 4. Anonymize audit logs (keep action, remove PII)
  await db.auditLog.updateMany({
    where: { 'actor.id': customerId },
    data: {
      actor: {
        type: 'user',
        id: 'ANONYMIZED',
        ipAddress: null
      }
    }
  });

  // 5. Log erasure request
  await logAudit({
    id: uuidv4(),
    timestamp: new Date(),
    service: 'payment-service',
    action: 'customer_data_erased',
    actor: { type: 'system', id: 'gdpr-compliance' },
    resource: { type: 'customer', id: customerId },
    details: {},
    result: 'success'
  });
}

// Data Retention Policy
async function enforceDataRetention(): Promise<void> {
  const retentionDays = 2555; // 7 years (financial records)
  const anonymizeAfterDays = 90; // Anonymize after 90 days

  // 1. Anonymize old transactions
  const anonymizeDate = subDays(new Date(), anonymizeAfterDays);
  await db.transaction.updateMany({
    where: {
      createdAt: { lte: anonymizeDate },
      anonymized: false
    },
    data: {
      customerEmail: 'anonymized@example.com',
      customerName: 'ANONYMIZED',
      ipAddress: '0.0.0.0',
      anonymized: true
    }
  });

  // 2. Delete very old audit logs (after 7 years)
  const deleteDate = subDays(new Date(), retentionDays);
  await db.auditLog.deleteMany({
    where: {
      timestamp: { lte: deleteDate }
    }
  });
}
```

## API Reference

### POST /api/v1/payments/authorize

Authorize payment without capturing:

**Request**:
```json
{
  "amount": 500.00,
  "currency": "USD",
  "paymentMethod": "tok_visa_4242",
  "customerId": "cus_123",
  "metadata": {
    "pnr": "ABC123",
    "passengerName": "John Doe",
    "flightNumber": "UA123",
    "departureDate": "2025-12-01"
  },
  "billingAddress": {
    "line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "savePaymentMethod": false
}
```

**Response**:
```json
{
  "transactionId": "txn_abc123",
  "status": "authorized",
  "amount": 500.00,
  "currency": "USD",
  "authorizationCode": "123456",
  "expiresAt": "2025-11-25T00:00:00Z",
  "requiresAction": false,
  "paymentMethod": {
    "type": "card",
    "brand": "visa",
    "last4": "4242",
    "expiryMonth": 12,
    "expiryYear": 2026
  }
}
```

### POST /api/v1/payments/capture

Capture previously authorized payment:

**Request**:
```json
{
  "transactionId": "txn_abc123",
  "amount": 500.00,
  "reason": "Ticket issued"
}
```

**Response**:
```json
{
  "transactionId": "txn_abc123",
  "status": "captured",
  "amount": 500.00,
  "currency": "USD",
  "capturedAt": "2025-11-18T10:30:00Z",
  "settlementDate": "2025-11-20"
}
```

### POST /api/v1/payments/refund

Refund captured payment:

**Request**:
```json
{
  "transactionId": "txn_abc123",
  "amount": 500.00,
  "reason": "Booking cancellation"
}
```

**Response**:
```json
{
  "refundId": "rfnd_xyz789",
  "transactionId": "txn_abc123",
  "amount": 500.00,
  "currency": "USD",
  "status": "processing",
  "estimatedArrival": "2025-11-25",
  "refundMethod": "original_payment_method"
}
```

### GET /api/v1/payments/transactions/:id

Retrieve transaction details:

**Response**:
```json
{
  "transactionId": "txn_abc123",
  "pnr": "ABC123",
  "amount": 500.00,
  "currency": "USD",
  "status": "captured",
  "gateway": "stripe",
  "paymentMethod": {
    "type": "card",
    "brand": "visa",
    "last4": "4242"
  },
  "timeline": [
    {
      "status": "authorized",
      "timestamp": "2025-11-18T09:00:00Z"
    },
    {
      "status": "captured",
      "timestamp": "2025-11-18T10:30:00Z"
    }
  ],
  "refunds": [],
  "fees": {
    "percentage": 14.50,
    "fixed": 0.30,
    "total": 14.80
  }
}
```

## Error Handling

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `card_declined` | Card issuer declined | Try different card |
| `insufficient_funds` | Not enough balance | Try different card |
| `expired_card` | Card has expired | Update card details |
| `invalid_cvv` | CVV doesn't match | Re-enter CVV |
| `fraud_detected` | Transaction flagged as fraudulent | Contact support |
| `3ds_required` | 3D Secure needed | Complete authentication |
| `3ds_failed` | 3D Secure failed | Authentication declined by bank |
| `authorization_expired` | Auth hold expired | Re-authorize |
| `already_captured` | Transaction already captured | Cannot capture twice |
| `already_refunded` | Already refunded | Cannot refund twice |
| `gateway_error` | Gateway unavailable | Retry or use fallback |

### Error Response Format

```json
{
  "error": {
    "code": "card_declined",
    "message": "Your card was declined",
    "details": "The card issuer declined this transaction. Please try a different payment method.",
    "declineCode": "generic_decline",
    "type": "card_error",
    "retryable": true
  }
}
```

### Retry Logic

```typescript
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await sleep(delayMs);

      logger.warn(`Retry attempt ${attempt}/${maxRetries}`, {
        error: error.message
      });
    }
  }

  throw lastError;
}

function isRetryableError(error: any): boolean {
  const retryableCodes = [
    'rate_limit_error',
    'gateway_timeout',
    'service_unavailable',
    'connection_error'
  ];

  return retryableCodes.includes(error.code);
}
```

## Testing

### Unit Tests

```typescript
describe('PaymentService', () => {
  describe('authorize', () => {
    it('should authorize valid payment', async () => {
      const request = {
        amount: 500,
        currency: 'USD',
        paymentMethod: 'tok_visa',
        metadata: { pnr: 'ABC123' }
      };

      const response = await paymentService.authorize(request);

      expect(response.status).toBe('authorized');
      expect(response.amount).toBe(500);
    });

    it('should reject fraudulent transaction', async () => {
      const request = {
        amount: 10000,
        currency: 'USD',
        paymentMethod: 'tok_fraudulent'
      };

      await expect(paymentService.authorize(request))
        .rejects.toThrow(FraudDetectedError);
    });

    it('should require 3DS for high-value transaction', async () => {
      const request = {
        amount: 1000,
        currency: 'EUR',
        paymentMethod: 'tok_visa'
      };

      const response = await paymentService.authorize(request);

      expect(response.requiresAction).toBe(true);
      expect(response.nextAction.type).toBe('3ds');
    });
  });
});
```

### Integration Tests (Stripe Test Mode)

```typescript
describe('Stripe Integration', () => {
  it('should process payment end-to-end', async () => {
    // 1. Create test token
    const token = await stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2026,
        cvc: '123'
      }
    });

    // 2. Authorize
    const auth = await paymentService.authorize({
      amount: 100,
      currency: 'USD',
      paymentMethod: token.id,
      metadata: { pnr: 'TEST123' }
    });

    expect(auth.status).toBe('authorized');

    // 3. Capture
    const capture = await paymentService.capture({
      transactionId: auth.transactionId,
      amount: 100
    });

    expect(capture.status).toBe('captured');

    // 4. Refund
    const refund = await paymentService.refund({
      transactionId: auth.transactionId,
      amount: 100,
      reason: 'Test refund'
    });

    expect(refund.status).toBe('processing');
  });
});
```

### Test Cards (Stripe)

| Card Number | Behavior |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0000 0000 0002 | Declined (generic) |
| 4000 0025 0000 3155 | Requires 3D Secure |
| 4000 0000 0000 0341 | Requires 3D Secure (charge fails) |

## Compliance

### PCI DSS Requirements

**Level 1 Compliance** (> 6M transactions/year):
- ✅ Annual security audit by QSA
- ✅ Quarterly network scans
- ✅ Annual penetration testing
- ✅ Security policy documentation
- ✅ Employee training

**12 PCI DSS Requirements**:
1. ✅ Firewall configuration
2. ✅ No default passwords
3. ✅ Protect stored cardholder data (we don't store any)
4. ✅ Encrypt transmission of cardholder data (TLS 1.3)
5. ✅ Use anti-virus software
6. ✅ Develop secure systems
7. ✅ Restrict access on need-to-know basis
8. ✅ Unique ID for each person with access
9. ✅ Restrict physical access
10. ✅ Track and monitor all access
11. ✅ Regularly test security systems
12. ✅ Maintain security policy

### Data Storage Rules

**Never Store**:
- Full card numbers (PAN)
- CVV/CVC/CVV2/CID
- PIN/PIN Block
- Magnetic stripe data

**May Store** (if encrypted):
- Cardholder name
- Expiry date
- Service code

**We Store** (tokenized):
- Payment method tokens (from gateway)
- Last 4 digits (display only)
- Card brand

### Logging Policy

```typescript
// ❌ NEVER log sensitive data
logger.info('Processing payment', {
  cardNumber: '4242424242424242', // NEVER
  cvv: '123', // NEVER
  password: 'secret' // NEVER
});

// ✅ Safe logging
logger.info('Processing payment', {
  transactionId: 'txn_abc123',
  amount: 500,
  currency: 'USD',
  last4: '4242',
  cardBrand: 'visa'
});
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**Maintained By**: Payment Platform Team
**PCI DSS Level**: 1
**Security Contact**: security@airline-ops.com
