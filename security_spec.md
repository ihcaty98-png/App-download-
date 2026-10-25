# Security Specification: FireChat App Download Platform

## 1. Data Invariants

1. **Unpublished App Isolation**:
   Only apps where `isPublished == true` are readable by public/unauthenticated users. Unpublished apps are strictly invisible to non-admins.
2. **Admin-Only Modification**:
   Creation, deletion, and metadata edits on `/apps/{appId}` and `/apps/{appId}/versions/{versionId}` require administrative authorization (`isAdmin()` via the verified `admins` collection or verified admin email).
3. **Download Increment Integrity**:
   Public users can ONLY increment the `downloadCount` field via an atomic download recording action accompanied by a corresponding `download_events` document with a unique `idempotencyKey`. Users cannot alter `name`, `downloadUrl`, `sha256`, `isPublished`, or arbitrary fields.
4. **Download Events Immutability**:
   Once written with status `completed`, a `download_events` document is strictly immutable. It cannot be updated or deleted by public users.
5. **No Spoofed Admin Roles**:
   Users cannot write to `/admins/{adminId}` or elevate their own privileges.
6. **Strict Schema Constraints**:
   Every string field has hard length bounds; SHA-256 must match `^[a-fA-F0-9]{64}$`; numbers must be non-negative.

---

## 2. The "Dirty Dozen" Threat Payloads

1. **Payload 1 (Shadow Field / Privilege Escalation)**: Public user attempts to create an app with `isAdmin: true` and `isPublished: true`.
   - *Expected*: PERMISSION_DENIED.
2. **Payload 2 (Unpublished Catalog Snooping)**: Unauthenticated user queries or fetches an app document where `isPublished == false`.
   - *Expected*: PERMISSION_DENIED.
3. **Payload 3 (Arbitrary Field Tampering on Download)**: Public user attempts to update `downloadCount` while sneaking in a replacement `downloadUrl` or `sha256`.
   - *Expected*: PERMISSION_DENIED.
4. **Payload 4 (Fake Admin Document Creation)**: User registers their own UID under `/admins/{uid}` with role `superadmin`.
   - *Expected*: PERMISSION_DENIED.
5. **Payload 5 (Unauthenticated App Creation)**: Unauthenticated user attempts to POST a new APK to `/apps`.
   - *Expected*: PERMISSION_DENIED.
6. **Payload 6 (Tampering with Event Immutability)**: User attempts to edit an existing `download_events/{id}` document to change the `appId` or `timestamp`.
   - *Expected*: PERMISSION_DENIED.
7. **Payload 7 (Oversized Payload / Denial of Wallet)**: Attacker sends a 1MB string in `name` or `description`.
   - *Expected*: PERMISSION_DENIED.
8. **Payload 8 (Malformed SHA-256 Injection)**: Admin or attacker uploads an app with an invalid non-hex checksum string.
   - *Expected*: PERMISSION_DENIED.
9. **Payload 9 (Unverified Admin Email Spoofing)**: Attacker sets up an account with the admin email string but `email_verified == false`.
   - *Expected*: PERMISSION_DENIED.
10. **Payload 10 (Delete App Without Admin Authorization)**: Non-admin calls `deleteDoc` on `/apps/{appId}`.
    - *Expected*: PERMISSION_DENIED.
11. **Payload 11 (Negative Download Count Counter Tampering)**: User attempts to decrease `downloadCount` or set an arbitrary negative integer.
    - *Expected*: PERMISSION_DENIED.
12. **Payload 12 (Direct Deletion of Download Event Logs)**: Attacker attempts to erase audit trail in `/download_events`.
    - *Expected*: PERMISSION_DENIED.
