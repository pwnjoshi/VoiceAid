# Sample Knowledge Documents for VoiceAid

Sample content for testing the knowledge base. Create these documents and upload to S3.

## Agriculture Category

### 1. Pest Control Guide (pest-control.txt)

```
PEST CONTROL GUIDE FOR FARMERS

Common Agricultural Pests:

1. Aphids
   - Small insects that suck plant sap
   - Prevention: Use neem oil spray weekly
   - Treatment: Apply insecticidal soap

2. Caterpillars
   - Eat leaves and damage crops
   - Prevention: Plant marigolds as companion plants
   - Treatment: Use Bacillus thuringiensis (Bt) spray

3. Whiteflies
   - Cause yellowing of leaves
   - Prevention: Use yellow sticky traps
   - Treatment: Spray with neem oil solution

Integrated Pest Management (IPM):
- Monitor crops regularly
- Use biological controls first
- Apply chemical pesticides only when necessary
- Rotate crops to break pest cycles

Natural Pest Control Methods:
- Companion planting
- Beneficial insects (ladybugs, lacewings)
- Neem oil and garlic spray
- Crop rotation
```

### 2. Crop Care Tips (crop-care.txt)

```
CROP CARE ESSENTIALS

Watering Guidelines:
- Water early morning or evening
- Avoid overhead watering to prevent disease
- Check soil moisture before watering
- Deep watering is better than frequent shallow watering

Soil Health:
- Test soil pH annually
- Add organic compost regularly
- Practice crop rotation
- Use mulch to retain moisture

Fertilization:
- Apply nitrogen-rich fertilizer during growth phase
- Use phosphorus for root development
- Potassium for fruit production
- Follow soil test recommendations

Disease Prevention:
- Remove infected plants immediately
- Ensure good air circulation
- Avoid working with wet plants
- Sanitize tools between uses

Harvest Tips:
- Harvest at proper maturity
- Use clean, sharp tools
- Handle produce gently
- Store in cool, dry place
```

## Health Category

### 3. Fever Treatment Basics (fever-treatment.txt)

```
FEVER TREATMENT GUIDE

What is Fever?
Fever is body temperature above 100.4°F (38°C). It's a sign that your body is fighting infection.

Home Treatment:
1. Rest and stay in bed
2. Drink plenty of fluids (water, juice, soup)
3. Take paracetamol or ibuprofen as directed
4. Use cool compress on forehead
5. Wear light clothing

When to See a Doctor:
- Fever above 103°F (39.4°C)
- Fever lasting more than 3 days
- Severe headache or stiff neck
- Difficulty breathing
- Persistent vomiting
- Confusion or drowsiness

Medication Guidelines:
- Paracetamol: 500mg every 4-6 hours (max 4g/day)
- Ibuprofen: 400mg every 6-8 hours with food
- Never give aspirin to children
- Complete the prescribed course

Prevention:
- Wash hands frequently
- Avoid close contact with sick people
- Get adequate sleep
- Maintain good nutrition
- Stay hydrated
```

### 4. Medicine Reminders (medicine-reminders.txt)

```
MEDICINE SAFETY AND REMINDERS

Taking Medicines Safely:

1. Follow Prescription:
   - Take exact dose prescribed
   - Don't skip doses
   - Complete full course of antibiotics
   - Don't share medicines

2. Timing:
   - Set daily alarms for medicine times
   - Take with or without food as directed
   - Maintain consistent timing

3. Storage:
   - Keep in cool, dry place
   - Away from direct sunlight
   - Out of reach of children
   - Check expiry dates regularly

4. Side Effects:
   - Read medicine information leaflet
   - Report unusual symptoms to doctor
   - Don't stop suddenly without consulting

Common Medicine Interactions:
- Antibiotics and dairy products
- Blood thinners and green vegetables
- Pain relievers and alcohol
- Always inform doctor of all medicines you take

Medicine Checklist:
□ Take morning medicines with breakfast
□ Afternoon dose after lunch
□ Evening dose with dinner
□ Bedtime medicines before sleep
□ Record any side effects
```

## Safety Category

### 5. OTP Scam Warnings (otp-scam-warnings.txt)

```
OTP SCAM AWARENESS

What is OTP?
One-Time Password (OTP) is a security code sent to your phone for verification.

NEVER SHARE YOUR OTP WITH ANYONE!

Common OTP Scams:

1. Fake Bank Calls:
   - Scammer pretends to be from your bank
   - Asks for OTP to "verify" or "update" account
   - REAL BANKS NEVER ASK FOR OTP

2. Prize/Lottery Scams:
   - Message saying you won a prize
   - Asks for OTP to claim prize
   - NO LEGITIMATE PRIZE REQUIRES OTP

3. KYC Update Scams:
   - Message about KYC expiry
   - Link to fake website asking for OTP
   - VERIFY DIRECTLY WITH YOUR BANK

4. Delivery Scams:
   - Fake delivery message with OTP request
   - Claims package is waiting
   - CHECK TRACKING ON OFFICIAL WEBSITE

How to Stay Safe:
✓ Never share OTP with anyone
✓ Don't click suspicious links
✓ Verify caller identity independently
✓ Use official apps and websites only
✓ Enable two-factor authentication
✓ Report scams to authorities

If You Shared OTP:
1. Contact your bank immediately
2. Block your cards
3. Change passwords
4. File police complaint
5. Monitor account for unauthorized transactions
```

### 6. Fraud Awareness (fraud-awareness.txt)

```
FRAUD PREVENTION GUIDE

Types of Common Frauds:

1. Phone Frauds:
   - Fake lottery/prize calls
   - Impersonation of officials
   - Tech support scams
   - Job offer scams

2. Online Frauds:
   - Phishing emails
   - Fake shopping websites
   - Social media scams
   - Investment frauds

3. Financial Frauds:
   - Credit card cloning
   - ATM skimming
   - Loan scams
   - Ponzi schemes

Warning Signs:
⚠ Pressure to act immediately
⚠ Requests for personal information
⚠ Too good to be true offers
⚠ Unsolicited contact
⚠ Request for advance payment
⚠ Poor grammar in messages

Protection Measures:

Banking Safety:
- Never share PIN, CVV, or OTP
- Use secure internet connections
- Check bank statements regularly
- Enable transaction alerts
- Use strong passwords

Online Safety:
- Verify website security (https://)
- Don't click suspicious links
- Use antivirus software
- Keep software updated
- Be cautious on social media

What to Do if Scammed:
1. Stop all communication with scammer
2. Contact your bank immediately
3. File police complaint (cybercrime.gov.in)
4. Document all evidence
5. Warn friends and family
6. Report to relevant authorities

Emergency Contacts:
- Cybercrime Helpline: 1930
- Banking Fraud: Contact your bank
- Consumer Helpline: 1800-11-4000

Remember: If it sounds too good to be true, it probably is!
```

## How to Use These Documents

1. Create text files with the content above
2. Upload to S3 in appropriate folders:
   ```bash
   aws s3 cp pest-control.txt s3://voiceaid-knowledge-docs/knowledge/agriculture/
   aws s3 cp crop-care.txt s3://voiceaid-knowledge-docs/knowledge/agriculture/
   aws s3 cp fever-treatment.txt s3://voiceaid-knowledge-docs/knowledge/health/
   aws s3 cp medicine-reminders.txt s3://voiceaid-knowledge-docs/knowledge/health/
   aws s3 cp otp-scam-warnings.txt s3://voiceaid-knowledge-docs/knowledge/safety/
   aws s3 cp fraud-awareness.txt s3://voiceaid-knowledge-docs/knowledge/safety/
   ```

3. Sync Knowledge Base in AWS Console

4. Test queries:
   - "How to control aphids on crops?"
   - "What should I do for fever?"
   - "How to identify OTP scams?"
