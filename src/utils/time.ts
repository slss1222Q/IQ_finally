/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Berilgan Unix ms vaqtini "necha vaqt oldin" formatida (o'zbek tilida) qaytaradi.
 * Masalan: "hozirgina", "3 daqiqa oldin", "2 soat oldin", "5 kun oldin".
 */
export function formatRelativeTimeUz(timestampMs: number): string {
  if (!timestampMs || Number.isNaN(timestampMs)) return 'hozirgina';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));

  if (diffSeconds < 30) return 'hozirgina';
  if (diffSeconds < 60) return `${diffSeconds} soniya oldin`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} soat oldin`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} kun oldin`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} hafta oldin`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} oy oldin`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} yil oldin`;
}
