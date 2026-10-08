# Promo Code 4: Gmail / iPhone password-recovery rollout

## Why this change is needed

The default Supabase email link can return an authorization `code` for PKCE. A code exchanged in Gmail's in-app browser may not have access to the `code_verifier` saved in the browser that initiated the reset. Repeating resets and opening stale links won't solve that. Production observations on 2026-10-08 included repeated invalid login attempts and browser recovery failures.

This branch adds a **token-hash recovery** option. Verification of a one-time `recovery` token directly against Supabase binds the password change to the identity proved by the email link, without trusting a previously logged-in account. Legacy PKCE remains supported when the verifier is available.

## Required operations BEFORE calling this resolved

1. Confirm the deployed application is built from this GitHub repository. The current Vercel connector cannot read the team's project deployment/environment (403), so this is **not yet confirmed**.
2. In the **correct** Supabase project, go to **Authentication → URL Configuration** and set the *Site URL* to the permanent production origin. Review allowed redirect URLs, removing old preview origins when safe.
3. In **Authentication → Email Templates → Reset Password**, preserve the email design but replace the reset link with the following token-hash form (using the actual canonical origin from Site URL):

   ```html
   <a href="{{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery">
     Reset Password
   </a>
   ```

   This is a privileged dashboard change. Do **not** put real recovery tokens in source code, logs or support messages. Verify that the email is from the correct Supabase tenant.
4. Build and deploy the reviewed app change only after the correct project, environment variables, and email template are verified; do not deploy this PR on its own and assume the browser issue is resolved.

## Required verification (staging/test account; do not use the owner's email for repeated test runs)

- Request a fresh email; open it in Gmail on iPhone, including an external Safari context and Gmail's in-app browser.
- One fresh token verifies once and opens the password form; reusing the token does not.
- Password update is allowed only when the current user matches the one verified from the token; old signed-in session without a recovery token cannot change a password from this page.
- After changing the password, new sign-in works and the prior password does not; no admin roles or profile rows have been altered.
- Malformed, expired, replayed or wrong-type links fail closed.
- At completion, the browser location no longer contains the one-time token.
- Verify that the recovery email is linked to the correct canonical production domain and Supabase project.
- Run `npm run typecheck`, `npm run lint`, and a production build in CI before merge.

## Rollback

Revert the page update and restore the old email template together if any regression is seen. Do not touch `auth.users` password hashes directly, issue service-role credentials to the frontend, or disable rate limits. Never mark production resolved based on code review alone.
