/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validation and normalization utility for Côte d'Ivoire 10-digit phone numbers
 * Regulatory compliance: ARTCI / Plan National de Numérotation 10 Chiffres
 * Operators:
 * - Orange: 07 XX XX XX XX
 * - MTN: 05 XX XX XX XX
 * - Moov: 01 XX XX XX XX
 * - Wave: Uses native mobile numbers (05, 07, 01)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formattedDisplay: string;
  formattedInternational: string;
  operator: 'Orange CI' | 'MTN CI' | 'Moov Africa CI' | 'Inconnu';
  error?: string;
}

export function validateIvorianPhoneNumber(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      formattedDisplay: '',
      formattedInternational: '',
      operator: 'Inconnu',
      error: 'Veuillez saisir un numéro de téléphone.',
    };
  }

  // Remove spaces, hyphens, parentheses, and +
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  // Strip international prefix if present
  if (cleaned.startsWith('+225')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('00225')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('225') && cleaned.length === 13) {
    cleaned = cleaned.substring(3);
  }

  // Handle old 8-digit migration hint
  if (cleaned.length === 8) {
    return {
      isValid: false,
      formattedDisplay: cleaned,
      formattedInternational: `+225${cleaned}`,
      operator: 'Inconnu',
      error: 'Numéro à 8 chiffres obsolète. Veuillez utiliser le format officiel ivoirien à 10 chiffres (ex: 05 04 49 14 06).',
    };
  }

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      formattedDisplay: cleaned,
      formattedInternational: `+225${cleaned}`,
      operator: 'Inconnu',
      error: 'Le numéro de téléphone ivoirien doit comporter exactement 10 chiffres (ex: 05 04 49 14 06).',
    };
  }

  // Detect operator
  const prefix = cleaned.substring(0, 2);
  let operator: 'Orange CI' | 'MTN CI' | 'Moov Africa CI' | 'Inconnu' = 'Inconnu';

  if (prefix === '07') {
    operator = 'Orange CI';
  } else if (prefix === '05') {
    operator = 'MTN CI';
  } else if (prefix === '01') {
    operator = 'Moov Africa CI';
  } else {
    return {
      isValid: false,
      formattedDisplay: cleaned,
      formattedInternational: `+225${cleaned}`,
      operator: 'Inconnu',
      error: 'Préfixe ivoirien non reconnu. Les numéros officiels débutent par 01 (Moov), 05 (MTN) ou 07 (Orange).',
    };
  }

  // Format in blocks: 05 04 49 14 06
  const formattedDisplay = `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
  const formattedInternational = `+225 ${formattedDisplay}`;

  return {
    isValid: true,
    formattedDisplay,
    formattedInternational,
    operator,
  };
}
