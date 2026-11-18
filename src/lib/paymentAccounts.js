// Payment Accounts Management for WhatsApp Dispatcher and Master Profile
// Default accounts matching Nadir Habib's operational setup

export const DEFAULT_PAYMENT_ACCOUNTS = {
  active_method: 'jazzcash', // 'jazzcash' | 'easypaisa' | 'bank' | 'none'
  jazzcash: {
    enabled: true,
    name: 'JazzCash',
    icon: '🏦',
    number: '0322 2685868',
    title: 'Saima Jabeen > Nadir Habib'
  },
  easypaisa: {
    enabled: true,
    name: 'EasyPaisa',
    icon: '📱',
    number: '0322 2685868',
    title: 'Nadir Habib'
  },
  bank: {
    enabled: false,
    name: 'Meezan Bank',
    icon: '🏛️',
    number: '01020304050607',
    title: 'Nadir Habib'
  }
};

export const PAYMENT_STORAGE_KEY = 'website_controller_payment_accounts_v2';

export function getStoredPaymentAccounts() {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PAYMENT_ACCOUNTS,
        ...parsed,
        jazzcash: { ...DEFAULT_PAYMENT_ACCOUNTS.jazzcash, ...(parsed.jazzcash || {}) },
        easypaisa: { ...DEFAULT_PAYMENT_ACCOUNTS.easypaisa, ...(parsed.easypaisa || {}) },
        bank: { ...DEFAULT_PAYMENT_ACCOUNTS.bank, ...(parsed.bank || {}) }
      };
    }
  } catch (e) {
    console.warn('Error reading stored payment accounts:', e);
  }
  return { ...DEFAULT_PAYMENT_ACCOUNTS };
}

export function saveStoredPaymentAccounts(accounts) {
  try {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Error saving payment accounts to storage:', e);
  }
}

// Unpack payment accounts if stored inside master profile default_payment_notice
export function unpackProfileData(profileData) {
  if (!profileData) return { note: '', accounts: getStoredPaymentAccounts() };
  
  let note = profileData.default_payment_notice || '';
  let accounts = getStoredPaymentAccounts();

  if (typeof note === 'string' && note.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(note);
      if (parsed && parsed.__custom_meta__) {
        note = parsed.note || '';
        if (parsed.payment_accounts) {
          accounts = {
            ...accounts,
            ...parsed.payment_accounts,
            jazzcash: { ...accounts.jazzcash, ...(parsed.payment_accounts.jazzcash || {}) },
            easypaisa: { ...accounts.easypaisa, ...(parsed.payment_accounts.easypaisa || {}) },
            bank: { ...accounts.bank, ...(parsed.payment_accounts.bank || {}) }
          };
          saveStoredPaymentAccounts(accounts);
        }
      }
    } catch (e) {
      // Keep plain text
    }
  }

  return { note, accounts };
}

// Pack payment accounts into master profile update payload
export function packProfileData(noteText, accounts) {
  return JSON.stringify({
    __custom_meta__: true,
    note: noteText || 'Your monthly website hosting subscription is currently locked. To unlock and restore access immediately, please contact Nadir Habib.',
    payment_accounts: accounts
  });
}
