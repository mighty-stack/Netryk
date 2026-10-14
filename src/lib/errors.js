// RTK Query errors: { status, data: { message, errors?: [{ path, message }] } } or { status: 'FETCH_ERROR' }
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return '';
  if (error.status === 'FETCH_ERROR') return 'Cannot reach the server. Check your connection and try again.';
  return error.data?.message || fallback;
}

// Puts the API's field-level errors onto Formik fields; returns true if any were applied.
export function applyServerErrors(error, setFieldError) {
  const list = error?.data?.errors;
  if (!Array.isArray(list) || !list.length) return false;
  list.forEach((e) => e.path && setFieldError(e.path, e.message));
  return true;
}
