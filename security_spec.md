# Security Specification - Shale-Namma Pride

## Data Invariants
1. Daily Meal: Only one post per day (ID must be YYYY-MM-DD). Only Headmaster/Admin can write.
2. Facility Tour: Only Admin can write. Anyone can read.
3. Student Stars: Only Headmaster/Admin can write. Anyone can read.
4. Feedback: Parents can create (anonymous or tagged). Admin can read all.
5. Users: Users can read their own profile. Admin can manage roles.

## The "Dirty Dozen" Payloads (Anti-Tests)
1. **Identity Spoofing**: Attempt to create a 'StudentStar' with a fake `headmasterId`.
2. **Resource Poisoning**: Injection of a 2MB string into `Facility` description.
3. **Admin Escalation**: A parent attempting to update their own `role` to 'admin'.
4. **Duplicate Meal**: Attempt to overwrite today's meal if it already exists (handled by rule).
5. **Unauthorized Feedback Read**: A parent attempting to read other parents' feedback.
6. **Malicious Document ID**: Attempt to create a document with ID `../../etc/passwd`.
7. **Future Meal**: Attempt to post a meal with a future date.
8. **Invalid Enum**: Attempt to set a user role to 'super-god-mode'.
9. **Spam Feedback**: Attempt to write 100 feedback messages in a second (rate limiting via rules/app).
10. **System Field Overwrite**: Attempt to change `createdAt` on a feedback.
11. **Anonymous PII Leak**: feedback marked as anonymous but containing `userId` that is readable by others.
12. **PII Scraping**: Attempt to list all users to harvest emails.

## Test Strategy
I will use the rules logic to prevent these.
