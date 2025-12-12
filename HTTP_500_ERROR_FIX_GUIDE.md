# HTTP 500 Error Fix Guide

## Issues Identified

Based on the browser console errors, there are two main HTTP 500 errors:

1. `POST /api/coupons/redeem 500 (Internal Server Error)`
2. `POST /api/usercore/proxy 500 (Internal Server Error)`

## Root Cause Analysis

### 1. Coupon Redemption Error
**Problem**: SQL function `redeem_trial_coupon` has variable declaration issues
- Variables `trial_source` and `expires_at` are used without proper declaration
- Missing `v_trial_source` and `v_expires_at` variable usage
- Incorrect `RETURN QUERY` syntax

**Evidence**: From conversation summary - "SQL function debugging for redeem_trial_coupon with variable declaration issues"

### 2. UserCore Proxy Error
**Problem**: Intermittent connectivity or request handling issues
- UserCore service is responding (tested: `https://user-core.zeabur.app/health` returns `{"status":"ok"}`)
- Likely related to specific request payloads or timeout issues

## Fixes Applied

### Fix 1: SQL Function Correction

**File**: `fix_coupon_function.sql`

**Key Changes**:
- Properly declared all variables (`v_trial_source`, `v_expires_at`, `v_plan_label`)
- Fixed variable assignments
- Corrected `RETURN QUERY` syntax
- Added proper error handling

**Before** (broken):
```sql
trial_source := coalesce(v_coupon.partner_name, v_code);
expires_at := v_now + make_interval(days => v_days);
```

**After** (fixed):
```sql
v_trial_source := coalesce(v_coupon.partner_name, v_code);
v_expires_at := v_now + make_interval(days => v_days);
```

### Fix 2: UserCore Proxy Monitoring

**Status**: Service is operational, but may have intermittent issues
- Added timeout handling (5 seconds)
- Proper error logging in place
- HTTPS enforcement working correctly

## Implementation Steps

### Step 1: Apply Database Fix

1. Open Supabase SQL Editor
2. Run the contents of `fix_coupon_function.sql`
3. Verify with test queries from `test_coupon_system.sql`

```sql
-- Verify function exists and is updated
SELECT proname FROM pg_proc WHERE proname = 'redeem_trial_coupon';
```

### Step 2: Test Coupon System

1. Run `test_coupon_system.sql` to create test data
2. Test with a real user ID:

```sql
-- Replace with actual user ID
SELECT * FROM redeem_trial_coupon(
  'your-user-id-here'::uuid,
  'TEST2025',
  '127.0.0.1',
  'test-agent'
);
```

### Step 3: Monitor UserCore

The UserCore proxy should work, but monitor for:
- Network connectivity issues
- Timeout errors (>5 seconds)
- Invalid request payloads

## Testing Verification

### Test Coupon Redemption
```bash
# Test the API endpoint (requires authentication)
curl -X POST https://www.snowskill.app/api/coupons/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"code": "TEST2025"}'
```

### Test UserCore Proxy
```bash
# Test UserCore connectivity
curl -X GET "https://www.snowskill.app/api/usercore/proxy?endpoint=/health"
```

## Expected Results

### After Fix 1 (Coupon Redemption)
- ✅ No more HTTP 500 errors on coupon redemption
- ✅ Proper error messages for invalid coupons
- ✅ Successful trial activation for valid coupons

### After Fix 2 (UserCore Monitoring)
- ✅ Reduced frequency of UserCore 500 errors
- ✅ Better error logging for debugging
- ✅ Proper timeout handling

## Rollback Plan

If issues persist:

1. **Coupon System**: Revert to previous function version
2. **UserCore**: Disable UserCore integration temporarily
3. **Emergency**: Add circuit breaker pattern for external services

## Related Files

- `fix_coupon_function.sql` - Main SQL fix
- `test_coupon_system.sql` - Test data and verification
- `debug_500_errors.js` - Diagnostic script
- `web/src/app/api/coupons/redeem/route.ts` - API endpoint
- `web/src/app/api/usercore/proxy/route.ts` - UserCore proxy

## Success Metrics

- [ ] Coupon redemption API returns 200 status
- [ ] UserCore proxy errors reduced by >90%
- [ ] No more infinite React re-render loops
- [ ] Clean browser console (no 500 errors)

---

**Priority**: High (affects user trial activation)
**Impact**: Critical (blocks new user onboarding)
**Effort**: Low (SQL fix + monitoring)
