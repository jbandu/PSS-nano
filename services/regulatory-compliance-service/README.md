# Regulatory Compliance Service

Comprehensive government regulatory compliance service handling TSA Secure Flight, APIS, travel document verification, dangerous goods, customs, sanctions screening, data privacy (GDPR/CCPA), financial regulations (PCI-DSS/AML/KYC), aviation safety, and accessibility compliance.

## Overview

The Regulatory Compliance Service ensures airlines meet all government requirements for international operations. This service handles passenger screening, travel authorization, customs/immigration, sanctions compliance, data privacy, financial regulations, safety reporting, and accessibility requirements.

**Critical for**: International operations, government compliance, passenger safety, data protection, financial security

## Supported Compliance Areas

1. **TSA Secure Flight** - US passenger screening
2. **APIS** - 13 country/regional systems
3. **Travel Documents** - TIMATIC integration
4. **Dangerous Goods** - IATA DG regulations
5. **Customs** - Electronic declarations
6. **Sanctions** - OFAC, EU, UN screening
7. **Privacy** - GDPR, CCPA compliance
8. **Financial** - PCI-DSS, AML, KYC
9. **Aviation Safety** - FAA Part 117, incident reporting
10. **Accessibility** - ACAA, EC 1107/2006

---

## 1. TSA Secure Flight (US)

### Overview

Secure Flight is a TSA program requiring airlines to collect and transmit passenger data for watch list matching before flight departure.

### Implementation

**Data Collection** (at booking/check-in):
- Full name (as on government ID)
- Date of birth
- Gender
- Redress number (if applicable)
- Known Traveler Number (TSA PreCheck)

**Transmission**:
- Sent 72 hours before departure
- Real-time updates for late bookings
- SFPD (Secure Flight Passenger Data) format

### Responses

**Clearance Status**:
- `CLEARED`: Passenger cleared for travel
- `INHIBITED`: Boarding Pass Printing Inhibit (BPPI) - contact TSA
- `NOT_CLEARED`: Do not allow travel

**Special Indicators**:
- **SSSS**: Secondary Security Screening Selectee
- **TSA PreCheck**: Expedited screening eligible

### Redress

Passengers with frequent false matches can apply for a Redress Number through DHS TRIP (Traveler Redress Inquiry Program).

---

## 2. APIS (Advance Passenger Information System)

### Supported Countries/Regions

1. **USA (CBP)** - US Customs and Border Protection
2. **Canada (CBSA)** - Canada Border Services Agency
3. **UK (Border Force)** - UK eBorders with Authority to Carry
4. **EU APIS** - European Union (19 data elements, 5-year retention)
5. **Schengen EES** - Entry/Exit System + ETIAS validation
6. **Mexico (INM)** - National Migration Institute
7. **Australia (ABF)** - Australian Border Force
8. **New Zealand Customs**
9. **Japan Immigration**
10. **China Immigration**
11. **India Immigration**
12. **UAE Immigration**
13. **CARICOM** - Caribbean Community regional system

### Data Requirements

**Passenger Manifest** (all countries):
- Full name
- Date of birth
- Gender
- Nationality
- Passport number and expiry
- Destination address (most countries)

**Additional for EU PNR Directive**:
19 data elements including:
- PNR locator
- All passenger names
- Payment information
- Contact details
- Travel agent
- Baggage information
- Seat numbers
- Split/divided PNR history

**Retention**: 5 years (EU), varies by country

### Submission Timing

- **US**: Wheels-up (departure) + real-time updates
- **Canada**: 72 hours before + wheels-up
- **UK**: Interactive (real-time responses required)
- **EU**: On departure + arrival
- **Schengen**: Check-in time

### UK Authority to Carry

UK eBorders provides real-time passenger clearance:
- `GRANTED`: Passenger cleared for travel to UK
- `DENIED`: Do not allow boarding
- Interactive system requires response before boarding pass issuance

---

## 3. Travel Document Verification

### TIMATIC Integration

IATA Timatic provides comprehensive travel document rules:

**Validation**:
- Passport validity requirements (6-month rule)
- Visa requirements by nationality
- Transit visa requirements
- COVID-19 health documents
- Vaccination requirements
- eTA/eVisa availability

**Example Query**:
```
Nationality: USA
Destination: India
Transit: Germany
Result:
- Passport: Valid 6 months beyond stay
- Visa: e-Visa available (online)
- Transit: No visa required (Schengen transit <24h)
- COVID: Vaccination proof required
```

### Document Types

- **Passport** - Most common international travel document
- **National ID** - EU/Schengen internal travel
- **Travel Document** - For stateless persons/refugees
- **Crew Member License** - For airline crew

### Passport Validity

**6-Month Rule**: Many countries require passports valid for 6 months beyond intended stay:
- Thailand, China, Indonesia, Vietnam (strict)
- EU/Schengen: Valid for duration of stay
- Canada: Valid for duration of stay + 1 day

### Visa Requirements

**Visa-Free** (examples):
- US passport holders: 186 countries visa-free
- Schengen visa: 26 European countries
- GCC visa: 6 Gulf countries

**eVisa Available**:
- India, Turkey, Australia, New Zealand, Kenya, etc.

**Visa on Arrival**:
- Thailand, Egypt, Cambodia, Jordan, etc.

### Health Certificates

**COVID-19**:
- Vaccination certificates (WHO Yellow Card, EU Digital COVID Certificate)
- PCR/Antigen tests with timeframes
- Health declaration forms
- Quarantine requirements

**Yellow Fever**:
- Required for travel to/from endemic countries
- Valid 10 days after vaccination, lifetime validity

**Other Vaccinations**:
- Polio (for certain countries)
- Meningitis (Saudi Arabia for Hajj/Umrah)

---

## 4. Dangerous Goods Compliance

### IATA Dangerous Goods Regulations

Implements IATA DGR (Dangerous Goods Regulations) compliance:

### Restricted Items Database

**9 DG Classes**:
1. **Explosives** - Fireworks, ammunition (prohibited passenger)
2. **Gases** - Compressed, liquefied (some allowed)
3. **Flammable Liquids** - Fuel, alcohol >70% (prohibited)
4. **Flammable Solids** - Matches, lighter fuel (restricted)
5. **Oxidizing Substances** - Bleach, peroxides (prohibited)
6. **Toxic Substances** - Pesticides, poisons (prohibited)
7. **Radioactive Materials** - Medical isotopes (prohibited passenger)
8. **Corrosives** - Acids, mercury (prohibited)
9. **Miscellaneous** - Lithium batteries, dry ice (restricted)

### Lithium Batteries

**Allowed**:
- In devices: Installed in personal electronics
- Spare batteries: Carry-on only, <100Wh (phones, laptops)
- 100-160Wh: Max 2 spare (professional cameras)

**Prohibited**:
- >160Wh without approval
- Damaged/recalled batteries
- In checked baggage (loose)

### NOTOC Generation

**Notice to Captain** includes:
- Number and type of dangerous goods
- UN numbers
- Location on aircraft
- Emergency procedures

---

## 5. Customs Declarations

### Electronic Customs Forms

**US Customs Declaration (Form 6059)**:
- Goods purchased abroad
- Value over duty-free allowance ($800 US)
- Agricultural products
- Currency >$10,000

**EU Customs**:
- Duty-free allowances (€300 air travel)
- Alcohol and tobacco limits
- Goods for personal use

### Agricultural Restrictions

**Prohibited Items**:
- Fresh fruits and vegetables (most countries)
- Meat and dairy products
- Plants and seeds
- Soil

**Special Cases**:
- Australia/New Zealand: Extremely strict (heavy fines)
- US: Declared items inspected at port of entry

### Currency Declaration

**US**: >$10,000 cash or monetary instruments (FinCEN 105 form)
**EU**: >€10,000
**Most countries**: $5,000-$10,000 threshold

---

## 6. Sanctions & Watchlist Screening

### OFAC (US Office of Foreign Assets Control)

**Sanctions Lists**:
- **SDN** (Specially Designated Nationals): ~9,000 individuals/entities
- **Non-SDN**: Additional restricted parties
- **Sectoral**: Russian financial institutions, energy sector

**Programs**: Iran, Cuba, North Korea, Syria, Russia, Venezuela, etc.

**Screening**: All passengers, crew, payments screened in real-time

**Penalties**: $10,000-$10,000,000 per violation

### EU Sanctions

**Consolidated List**: ~2,000 individuals and entities
**Asset Freeze**: Travel ban, financial restrictions
**Countries**: Russia, Belarus, Iran, North Korea, Syria, etc.

### UN Sanctions

**Security Council Sanctions**: Terrorism, proliferation
**Al-Qaeda/ISIS Lists**: ~500 individuals

### Screening Process

**Match Algorithm**:
1. Exact name match (100% confidence)
2. Fuzzy matching (85-99% confidence)
3. Phonetic matching
4. Alias checking
5. Date of birth verification

**False Positives**: Common names require manual review

**Actions on Match**:
- **Confirmed Match**: Block transaction, report to authorities
- **Possible Match**: Manual review required
- **Clear**: Proceed

### Deny Party Screening (DPS)

Screen all business partners:
- Travel agencies
- Corporate clients
- Suppliers
- Code-share partners

---

## 7. Data Privacy Compliance

### GDPR (General Data Protection Regulation)

**Scope**: EU residents, regardless of where airline is based

**Key Principles**:
1. **Lawful Basis**: Consent, contract, legal obligation
2. **Purpose Limitation**: Use data only for stated purpose
3. **Data Minimization**: Collect only necessary data
4. **Accuracy**: Keep data up-to-date
5. **Storage Limitation**: Delete after purpose fulfilled
6. **Security**: Encryption, access controls

### Data Subject Rights

**Right to Access**: Provide copy of data (30 days)
**Right to Rectification**: Correct inaccurate data
**Right to Erasure**: "Right to be forgotten"
**Right to Portability**: Provide data in machine-readable format
**Right to Restrict Processing**: Pause processing
**Right to Object**: Object to marketing, profiling

### Consent Management

**Requirements**:
- Clear, affirmative action (not pre-checked boxes)
- Separate consent for each purpose
- Easy to withdraw
- Records of consent

**Cookie Consent**: For analytics, marketing cookies

### Data Retention

**Booking Data**: 3 years (tax/accounting)
**Payment Data**: 10 years (PCI-DSS, fraud prevention)
**APIS Data**: 5 years (EU PNR Directive)
**Marketing Data**: Until consent withdrawn
**Audit Logs**: 7 years (compliance)

### Data Breach Notification

**72-Hour Rule**: Notify supervisory authority within 72 hours
**Individual Notification**: If high risk to individuals
**Documentation**: All breaches documented, even if not reported

**Penalties**: Up to €20 million or 4% of global turnover (whichever is higher)

### CCPA (California Consumer Privacy Act)

**Similar Rights**: Access, deletion, opt-out of sale
**"Do Not Sell My Personal Information"**: Required link
**Penalties**: $2,500-$7,500 per violation

---

## 8. Financial Regulations

### PCI-DSS (Payment Card Industry Data Security Standard)

**Merchant Levels**:
- **Level 1**: >6M transactions/year - Annual audit required
- **Level 2**: 1-6M - Annual SAQ
- **Level 3**: 20K-1M - Annual SAQ
- **Level 4**: <20K - Annual SAQ

**12 Requirements**:
1. Install and maintain firewall
2. Don't use default passwords
3. Protect stored cardholder data
4. Encrypt transmission of cardholder data
5. Use and regularly update antivirus
6. Develop and maintain secure systems
7. Restrict access to cardholder data by business need-to-know
8. Assign unique ID to each person with computer access
9. Restrict physical access to cardholder data
10. Track and monitor all access to network resources and cardholder data
11. Regularly test security systems and processes
12. Maintain policy that addresses information security

**Key Rules**:
- **Never store**: CVV, PIN, full magnetic stripe
- **Encryption**: All card data encrypted in transit and at rest
- **Tokenization**: Replace PANs with tokens
- **PCI-compliant processors**: Use certified payment gateways

### AML (Anti-Money Laundering)

**Suspicious Activity**:
- High-value transactions (>$10,000)
- Structuring (multiple transactions to avoid reporting)
- Unusual patterns
- High-risk countries
- Politically Exposed Persons (PEPs)

**SAR Filing** (Suspicious Activity Report):
- File within 30 days
- FinCEN (US), FIU (other countries)

**Red Flags**:
- Cash payments for expensive tickets
- One-way international tickets (immediate travel)
- Complex routing with no logical reason
- Frequent changes/cancellations

### KYC (Know Your Customer)

**Verification Levels**:
- **Basic**: Email/phone verification
- **Standard**: Government ID verification
- **Enhanced Due Diligence**: For high-risk customers

**PEP Screening**: Screen for government officials, family members

**Ongoing Monitoring**: Annual review of high-risk customers

---

## 9. Aviation Safety Compliance

### FAA Part 117 (Crew Rest Requirements)

**Flight Duty Period** limits:
- Varies by start time and number of segments
- Max 9-14 hours depending on report time
- More restrictive for early morning starts

**Rest Requirements**:
- Minimum 10 hours between duty periods
- 30 consecutive hours rest/week
- Fatigue Risk Management System (FRMS)

**Fitness for Duty**: Crew must self-report fatigue

### Safety Incident Reporting

**FAA Reporting** (US):
- **Accidents**: Fatality, serious injury, substantial damage
- **Incidents**: Runway incursion, near mid-air collision, etc.
- **Timeline**: Immediate notification + written report (10 days)

**EASA Reporting** (EU):
- Similar requirements to FAA
- Mandatory Occurrence Reporting

**SMS (Safety Management System)**:
- Hazard identification
- Risk assessment
- Safety performance monitoring
- Safety promotion

---

## 10. Accessibility Compliance

### ACAA (Air Carrier Access Act) - US

**Requirements**:
- No discrimination based on disability
- Wheelchair assistance
- Onboard wheelchairs for 100+ seat aircraft
- Service animals allowed
- Medical equipment allowed
- Advance notice: 48 hours for certain services

### EC 1107/2006 - EU

**Similar requirements to ACAA**:
- Assistance from arrival at airport to final destination
- Free wheelchair/assistance
- Service animal accommodation
- No additional charges for assistance

### Service Animals

**US DOT Rules** (2021 update):
- Dogs only (emotional support animals no longer required)
- Must be trained for specific task
- Size/weight limits for cabin
- Documentation may be required for international travel

### Wheelchair Handling

**Types**:
- **WCHR**: Can walk stairs, needs wheelchair for distances
- **WCHS**: Cannot walk stairs, can walk short distances
- **WCHC**: Completely immobile, needs wheelchair + lifting

**Battery-Powered Wheelchairs**:
- Spillable batteries: Must disconnect
- Non-spillable batteries: May keep connected
- Lithium batteries: Special handling required

---

## Audit & Reporting

### Comprehensive Audit Logs

**Required by**:
- GDPR (all data access)
- PCI-DSS (all card data access)
- SOX (financial transactions)
- FAA (safety records)

**Logged Events**:
- All data access/modifications
- Authentication/authorization
- Consent changes
- Data exports
- Configuration changes

**Retention**: 5-7 years (varies by regulation)

### Compliance Certificates

**Maintained Certifications**:
- PCI-DSS Level 1
- ISO 27001
- SOC 2 Type II
- GDPR compliance attestation
- IATA certifications
- FAA Part 121 certificate

**Annual Renewals**: Most certifications

### Regulatory Change Monitoring

**Automated Monitoring**:
- Federal Register (US)
- EU Official Journal
- IATA updates
- ICAO amendments

**Change Management**:
- Impact assessment
- Implementation planning
- Testing and validation
- Deployment

---

## Technology Stack

- **Node.js 18+** with TypeScript
- **PostgreSQL** with Prisma ORM
- **Bull** for background job processing
- **Redis** for caching
- **RabbitMQ** for message queuing
- **SOAP/XML** for government APIs
- **Encryption**: AES-256, RSA-2048
- **Logging**: Winston with structured logs
- **Monitoring**: Prometheus + Grafana

## Installation

```bash
npm install
npm run db:migrate
npm run dev

# Workers
npm run worker:sfpd      # TSA Secure Flight
npm run worker:apis      # APIS submissions
npm run worker:sanctions # Sanctions screening
npm run worker:gdpr      # GDPR compliance

# Sync
npm run sync:timatic     # Travel document rules
npm run sync:sanctions   # Update sanctions lists
```

## Performance Targets

- **Sanctions Screening**: <100ms per passenger
- **TIMATIC Validation**: <500ms
- **APIS Submission**: <2 seconds
- **TSA Response**: <5 seconds
- **Availability**: 99.99% uptime

## Security

- **Encryption at Rest**: AES-256
- **Encryption in Transit**: TLS 1.3
- **Key Management**: HSM or AWS KMS
- **Access Control**: Role-based, least privilege
- **Audit Logging**: All compliance events
- **Data Masking**: PII masked in logs

---

**Critical Importance**: This service is essential for international airline operations. Non-compliance can result in severe penalties, denied boarding, flight diversions, and loss of operating certificates. All regulations must be strictly followed with comprehensive audit trails.
