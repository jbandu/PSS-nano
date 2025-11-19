# User Acceptance Testing (UAT) Scenarios

## Overview

This document provides comprehensive UAT scenarios for all user roles in the PSS-nano platform. Each scenario includes step-by-step instructions, expected results, and acceptance criteria.

---

## 1. Reservation Agent Workflows

### Scenario 1.1: Create a New Booking

**User Role**: Reservation Agent
**Objective**: Successfully create a booking for a passenger

**Pre-conditions**:
- Agent logged into reservation system
- Flight inventory available

**Steps**:
1. Navigate to New Booking screen
2. Enter passenger details:
   - First Name: John
   - Last Name: Smith
   - Date of Birth: 1985-05-15
   - Email: john.smith@email.com
   - Phone: +1-555-0123
3. Search for flights:
   - Origin: JFK
   - Destination: LAX
   - Date: 30 days from today
   - Passengers: 1 Adult
4. Select economy fare on flight AA100
5. Select seat 15A
6. Add 1 checked bag ancillary
7. Enter payment details (test card: 4111111111111111)
8. Confirm booking

**Expected Results**:
- ✅ PNR generated (6-character alphanumeric)
- ✅ Booking confirmation displayed
- ✅ Confirmation email sent to passenger
- ✅ Booking appears in agent's recent bookings list
- ✅ Inventory updated (seat 15A no longer available)

**Acceptance Criteria**:
- [ ] Booking created successfully
- [ ] All passenger details saved correctly
- [ ] Payment processed successfully
- [ ] PNR format is correct
- [ ] Email confirmation received

**Test Data**:
```
Test Card: 4111111111111111
Expiry: 12/28
CVV: 123
```

---

### Scenario 1.2: Modify Existing Booking

**User Role**: Reservation Agent
**Objective**: Change flight date for an existing booking

**Pre-conditions**:
- Existing booking in system
- Alternative flights available

**Steps**:
1. Search for booking using PNR or passenger name
2. Click "Modify Booking"
3. Change departure date to +1 day
4. Search for new flights
5. Select comparable flight
6. Review fare difference
7. Process payment if additional fees apply
8. Confirm change

**Expected Results**:
- ✅ Original booking canceled
- ✅ New booking created with same PNR
- ✅ Fare difference calculated correctly
- ✅ Change notification emailed to passenger
- ✅ Original seat released back to inventory

**Acceptance Criteria**:
- [ ] Booking modified successfully
- [ ] PNR remains the same
- [ ] Fare calculation is accurate
- [ ] Notification sent
- [ ] Audit trail created

---

### Scenario 1.3: Cancel Booking and Process Refund

**User Role**: Reservation Agent
**Objective**: Cancel a booking and initiate refund

**Pre-conditions**:
- Existing confirmed booking
- Refund policy allows cancellation

**Steps**:
1. Retrieve booking using PNR
2. Click "Cancel Booking"
3. Select cancellation reason
4. Review refund amount
5. Confirm cancellation
6. Process refund to original payment method

**Expected Results**:
- ✅ Booking status changed to "Canceled"
- ✅ Refund amount calculated per policy
- ✅ Refund transaction initiated
- ✅ Cancellation email sent
- ✅ Inventory released

**Acceptance Criteria**:
- [ ] Cancellation processed successfully
- [ ] Refund amount is correct
- [ ] Transaction recorded
- [ ] Email notification sent
- [ ] Seat returned to inventory

---

## 2. Airport Agent Workflows

### Scenario 2.1: Check-In Passenger with Baggage

**User Role**: Airport Check-In Agent
**Objective**: Complete check-in process for passenger with checked baggage

**Pre-conditions**:
- Agent logged in at airport terminal
- Flight departure within check-in window

**Steps**:
1. Search passenger by PNR or surname
2. Verify passenger identity (ID/passport)
3. Collect passport information for APIS
4. Process checked baggage:
   - Scan bag tag for bag 1 (weight: 20kg)
   - Scan bag tag for bag 2 (weight: 18kg)
5. Collect any excess baggage fees if applicable
6. Assign seat (or confirm existing)
7. Print boarding pass and baggage tags
8. Complete check-in

**Expected Results**:
- ✅ Passenger checked in successfully
- ✅ APIS data submitted to authorities
- ✅ Baggage tags printed (10-digit format)
- ✅ Boarding pass printed with barcode
- ✅ Check-in confirmation in system
- ✅ Passenger appears in flight manifest

**Acceptance Criteria**:
- [ ] Check-in completed
- [ ] APIS submission successful
- [ ] Bag tags scannable
- [ ] Boarding pass readable
- [ ] Excess fees collected if applicable

**Test Data**:
```
Passport Number: AB1234567
Passport Country: USA
Passport Expiry: 2030-12-31
Nationality: USA
```

---

### Scenario 2.2: Handle Group Check-In

**User Role**: Airport Check-In Agent
**Objective**: Check in a group of 15 passengers

**Pre-conditions**:
- Group booking exists
- All passengers present

**Steps**:
1. Retrieve group booking
2. Verify all passenger names
3. Collect APIS for all passengers
4. Auto-assign seats together (where possible)
5. Process group baggage
6. Print all boarding passes
7. Complete check-in

**Expected Results**:
- ✅ All passengers checked in
- ✅ Seats assigned together
- ✅ All boarding passes printed
- ✅ Group visible in manifest

**Acceptance Criteria**:
- [ ] Group check-in efficient (<10 minutes)
- [ ] Seats grouped appropriately
- [ ] All documents printed
- [ ] No errors in passenger data

---

## 3. Operations Manager Workflows

### Scenario 3.1: Monitor Flight Operations Dashboard

**User Role**: Operations Manager
**Objective**: Monitor real-time flight operations

**Pre-conditions**:
- Multiple flights in operation
- Dashboard access granted

**Steps**:
1. Login to operations dashboard
2. View today's flights
3. Check flight status for each:
   - Check-in progress
   - Boarding status
   - On-time performance
4. Review alerts and notifications
5. Drill down into specific flight details

**Expected Results**:
- ✅ Dashboard loads within 30 seconds
- ✅ Real-time data displayed
- ✅ Alerts highlighted
- ✅ Can drill down to flight details
- ✅ Historical data accessible

**Acceptance Criteria**:
- [ ] Dashboard responsive
- [ ] Data accurate and current
- [ ] Filters work correctly
- [ ] Export functionality available

---

### Scenario 3.2: Handle Irregular Operations (IRROPS)

**User Role**: Operations Manager
**Objective**: Manage flight delay and passenger re-accommodation

**Pre-conditions**:
- Flight delayed or canceled
- Affected passengers need re-booking

**Steps**:
1. Receive delay notification
2. View affected passengers list
3. Identify alternative flights
4. Bulk re-book passengers
5. Send notifications
6. Generate compensation vouchers if applicable

**Expected Results**:
- ✅ All passengers re-accommodated
- ✅ Notifications sent
- ✅ Audit trail of changes
- ✅ Compensation tracked

**Acceptance Criteria**:
- [ ] Re-booking efficient
- [ ] All passengers notified
- [ ] Compensation policy followed
- [ ] No data loss

---

## 4. Revenue Manager Workflows

### Scenario 4.1: Analyze Booking Trends

**User Role**: Revenue Manager
**Objective**: Analyze booking patterns to adjust pricing

**Pre-conditions**:
- Historical booking data available
- Access to analytics dashboard

**Steps**:
1. Login to revenue management system
2. Select route (JFK-LAX)
3. Select date range (last 90 days)
4. View metrics:
   - Load factor trend
   - Average fare
   - Booking curve
   - Revenue per flight
5. Compare to forecast
6. Export report

**Expected Results**:
- ✅ Data visualizations load
- ✅ Metrics calculated correctly
- ✅ Export generates Excel file
- ✅ Trends clearly visible

**Acceptance Criteria**:
- [ ] Dashboard loads < 30 seconds
- [ ] All metrics accurate
- [ ] Export includes all data
- [ ] Visualizations clear

---

### Scenario 4.2: Adjust Fare Rules

**User Role**: Revenue Manager
**Objective**: Create special promotional fare

**Pre-conditions**:
- Authority to create fares
- Route and dates selected

**Steps**:
1. Navigate to Fare Management
2. Create new fare:
   - Fare class: T
   - Base amount: $199
   - Route: JFK-LAX
   - Travel dates: Next month
   - Booking window: 7 days
   - Restrictions: Non-refundable, change fee $75
3. Set inventory allocation (50 seats)
4. Activate fare
5. Verify fare appears in search

**Expected Results**:
- ✅ Fare created successfully
- ✅ Appears in availability search
- ✅ Rules enforced correctly
- ✅ Inventory tracked

**Acceptance Criteria**:
- [ ] Fare rules applied correctly
- [ ] Available in search results
- [ ] Inventory control working
- [ ] Restrictions enforced at booking

---

## 5. Passenger Workflows

### Scenario 5.1: Book Flight on Website

**User Role**: Passenger
**Objective**: Self-service flight booking

**Pre-conditions**:
- Public website accessible
- Payment method available

**Steps**:
1. Visit booking website
2. Enter search criteria:
   - From: New York (JFK)
   - To: Los Angeles (LAX)
   - Date: Select date
   - Passengers: 1 Adult
3. Search flights
4. Select flight and fare
5. Enter passenger details
6. Select seat
7. Add baggage
8. Enter payment details
9. Confirm booking
10. Receive confirmation email

**Expected Results**:
- ✅ Search returns results < 3 seconds
- ✅ Booking process smooth (< 5 minutes)
- ✅ Payment processed securely
- ✅ Confirmation email received
- ✅ PNR visible in email

**Acceptance Criteria**:
- [ ] User-friendly interface
- [ ] Mobile responsive
- [ ] Payment secure (PCI compliant)
- [ ] Confirmation immediate
- [ ] Email delivered within 2 minutes

---

### Scenario 5.2: Web Check-In

**User Role**: Passenger
**Objective**: Online check-in 24 hours before flight

**Pre-conditions**:
- Existing confirmed booking
- Check-in window open

**Steps**:
1. Visit airline website
2. Navigate to Check-In
3. Enter PNR and last name
4. View booking details
5. Change seat if desired
6. Add travel insurance (optional)
7. Enter passport details
8. Confirm check-in
9. Download boarding pass

**Expected Results**:
- ✅ Check-in completed < 5 minutes
- ✅ Boarding pass generated
- ✅ Mobile boarding pass available
- ✅ Email with boarding pass sent

**Acceptance Criteria**:
- [ ] Check-in process intuitive
- [ ] Boarding pass scannable
- [ ] Mobile wallet integration works
- [ ] Email received

---

### Scenario 5.3: Manage Booking

**User Role**: Passenger
**Objective**: View and modify booking online

**Pre-conditions**:
- Existing booking

**Steps**:
1. Login to Manage Booking
2. Enter PNR and last name
3. View booking details
4. Change date (if allowed by fare)
5. Add baggage
6. Select meal preference
7. Save changes
8. Receive updated confirmation

**Expected Results**:
- ✅ Booking retrieved successfully
- ✅ Changes processed
- ✅ Additional payment collected if needed
- ✅ Updated confirmation sent

**Acceptance Criteria**:
- [ ] Booking details accurate
- [ ] Modifications allowed per fare rules
- [ ] Payment processed if applicable
- [ ] Confirmation updated

---

## 6. Executive Dashboard Testing

### Scenario 6.1: View Executive KPIs

**User Role**: Executive
**Objective**: Monitor high-level business metrics

**Pre-conditions**:
- Executive dashboard access

**Steps**:
1. Login to executive dashboard
2. View key metrics:
   - Daily revenue
   - Load factor
   - On-time performance
   - Customer satisfaction score
   - Active bookings
3. View trend graphs
4. Drill down into specific metric
5. Export summary report

**Expected Results**:
- ✅ Dashboard loads < 10 seconds
- ✅ All metrics displayed
- ✅ Trends visualized clearly
- ✅ Export generates PDF/Excel

**Acceptance Criteria**:
- [ ] Data accurate
- [ ] Visualizations professional
- [ ] Export functionality works
- [ ] Mobile accessible

---

## UAT Sign-Off Template

### Scenario Test Results

| Scenario ID | Scenario Name | Tester | Date | Status | Issues Found | Notes |
|------------|---------------|--------|------|--------|--------------|-------|
| 1.1 | Create New Booking | | | ⬜ | | |
| 1.2 | Modify Booking | | | ⬜ | | |
| 1.3 | Cancel & Refund | | | ⬜ | | |
| 2.1 | Check-In with Baggage | | | ⬜ | | |
| 2.2 | Group Check-In | | | ⬜ | | |
| 3.1 | Operations Dashboard | | | ⬜ | | |
| 3.2 | Handle IRROPS | | | ⬜ | | |
| 4.1 | Booking Trends | | | ⬜ | | |
| 4.2 | Fare Management | | | ⬜ | | |
| 5.1 | Passenger Booking | | | ⬜ | | |
| 5.2 | Web Check-In | | | ⬜ | | |
| 5.3 | Manage Booking | | | ⬜ | | |
| 6.1 | Executive KPIs | | | ⬜ | | |

**Status Legend**: ✅ Pass | ❌ Fail | ⚠️ Pass with Issues | ⬜ Not Tested

---

## UAT Approval

**UAT Manager**: ________________________
**Date**: ________________________
**Signature**: ________________________

**Product Owner**: ________________________
**Date**: ________________________
**Signature**: ________________________

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Maintained by**: PSS-nano QA Team
