/**
 * Sends an authenticated request and retries it once after the AuthProvider
 * obtains a new access token following a 401 response.
 */
export async function apiRequest(authenticatedFetch, path, options) {
  return authenticatedFetch(`/api${path}`, options);
}
