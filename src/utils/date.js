// src/utils/date.js - Legacy date formatting module
// Yeni API modülüne yönlendirme yapıyor

import { formatDate as formatDateFromAPI } from '@/lib/api/wordpress';

/**
 * Tarih formatlamak için utility fonksiyon
 * @param {string} dateString - ISO formatında tarih string'i (örn: "2024-10-15")
 * @returns {string} Formatlanmış tarih (örn: "15 Ekim 2024")
 */
export function formatDate(dateString) {
  return formatDateFromAPI(dateString);
} 