# Dropbox API Routes

## Authentication Routes

### `GET /api/auth/dropbox`
Initiates the Dropbox OAuth flow for user authentication.

**Response:**
- Redirects to Dropbox authorization page

### `GET /api/auth/dropbox/callback`
Handles the OAuth callback from Dropbox after user authorization.

**Query Parameters:**
- `code` - Authorization code from Dropbox
- `state` - CSRF protection state parameter

**Response:**
- Redirects to home page with authentication cookie set

### `GET /api/auth/dropbox-token`
Retrieves and refreshes Dropbox access tokens for the current user.

**Response:**
```json
{
  "accessToken": "dropbox_access_token",
  "expiresAt": "ISO_timestamp"
}
```

**Error Responses:**
- 401: Authentication required
- 403: Dropbox access not authorized
- 404: User not found
- 500: Internal server error

## File Operations

File operations are handled client-side using the Dropbox JavaScript SDK via the `useDropbox` hook.

### `useDropbox` Hook

**Methods:**
- `uploadToDropbox(accessToken, file, filename)` - Uploads a file to Dropbox
- `isUploading` - Boolean indicating if an upload is in progress
- `progress` - Upload progress percentage (0-100)

**Upload Path:**
Files are uploaded to `/crema/videos/{user_id}/{filename}` in the user's Dropbox account.