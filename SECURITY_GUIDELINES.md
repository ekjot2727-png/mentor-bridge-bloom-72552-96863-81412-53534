# Security Guidelines for Alumni-Student Platform

## Phase 1 Security Implementation ✅ COMPLETED

### Secure Database Views

The platform implements field-level security through database views that automatically filter sensitive data based on user relationships.

#### 1. Public Profiles View (`public_profiles`)

Use this view instead of querying the `profiles` table directly for directory listings and browsing.

**Protected Fields:**
- `email` - Only visible to: profile owner, connected users, or admins
- `terms_accepted` - Only visible to: profile owner or admins  
- `email_verified` - Only visible to: profile owner or admins

**Example Usage:**
```typescript
// ✅ CORRECT - Use the secure view for directories
const { data: alumni } = await supabase
  .from('public_profiles')
  .select('*')
  .eq('user_type', 'alumni');

// ❌ WRONG - Don't query profiles directly for public listings
const { data: alumni } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_type', 'alumni');
```

#### 2. Public Student Profiles View (`public_student_profiles`)

Use this view for browsing student academic information.

**Protected Fields:**
- `cgpa` - Only visible to: profile owner, admins, or connected alumni
- `career_goals` - Only visible to: profile owner, admins, or connected alumni

**Example Usage:**
```typescript
// ✅ CORRECT - Sensitive fields auto-filtered
const { data: studentInfo } = await supabase
  .from('public_student_profiles')
  .select('*')
  .eq('user_id', userId);

// ❌ WRONG - Direct table access
const { data: studentInfo } = await supabase
  .from('student_profiles')
  .select('*')
  .eq('user_id', userId);
```

### When to Use Direct Table Queries

You can still query tables directly in these cases:
- User is viewing their own profile (filtered by `auth.uid()`)
- Admin operations with proper role checks
- Server-side edge functions with service role key

**Example - Own Profile:**
```typescript
// ✅ OK - User viewing their own data
const { data: { user } } = await supabase.auth.getUser();
const { data: myProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

### Helper Functions Available

#### `are_users_connected(user1_id, user2_id)`
Checks if two users have an accepted connection.

#### `is_admin(user_id)`
Checks if a user has admin role.

#### `has_role(user_id, role, institute_id)`
Checks if a user has a specific role in an institute.

## Row Level Security (RLS) Policies

### Student Profiles Table
- ✅ Students can view their own complete profile
- ✅ Other authenticated users can view basic info (sensitive fields filtered by view)
- ✅ Students can insert/update their own profile

### Profiles Table
- ✅ Users can view profiles from their institute
- ✅ Users can insert/update their own profile
- ✅ Email visibility controlled by `public_profiles` view

### Connections Table
- ✅ Users can only view their own connections
- ✅ Students can create connection requests
- ✅ Alumni can accept/reject requests

## Best Practices

1. **Always use secure views for public listings and directories**
2. **Direct table queries only for own data or admin operations**
3. **Never log sensitive user data (emails, CGPA, etc.) to console**
4. **Use proper authentication checks before any database operation**
5. **Implement rate limiting for public endpoints**

## Next Steps (Phase 2 & 3)

### Phase 2: Password Protection
- ✅ Enable Leaked Password Protection in auth settings

### Phase 3: Enhanced Security
- Add rate limiting to contact form
- Sanitize bulk upload error logs
- Create audit logging for sensitive operations

## Security Contact

For security concerns or to report vulnerabilities, please contact the system administrator immediately.

---

**Last Updated:** 2025-11-13  
**Security Review Status:** Phase 1 Complete ✅
