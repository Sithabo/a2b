/** Where customers reach A2B support. */
export const SUPPORT_EMAIL = 'kalekyezikid@gmail.com';

/** A `mailto:` link to support with the subject (and optionally the body) filled in. */
export function supportEmailUrl({ subject, body }: { subject: string; body?: string }) {
  const query = [`subject=${encodeURIComponent(subject)}`];
  if (body) query.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${SUPPORT_EMAIL}?${query.join('&')}`;
}
