/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Firebase Realtime Database xizmat qatlami — IQ Level UZ
 * ------------------------------------------------------------------
 * Bu fayl butun ilova uchun YAGONA joy bo'lib, Firebase bilan barcha
 * o'qish/yozish amallari shu yerda amalga oshiriladi:
 *
 *   users/{userId}      -> UserProfile   (barcha ro'yxatdan o'tgan foydalanuvchilar)
 *   duels/{duelId}      -> DuelOutcome   (so'nggi 1v1 duel natijalari, umumiy lenta)
 *   adminSettings       -> AdminSettings (butun ilova uchun bitta umumiy sozlama)
 *
 * Barcha funksiyalar xato bo'lsa ilovani qulatmaydi — xatolar konsolga
 * yoziladi va callback bo'sh/oldingi holat bilan chaqiriladi, shunday qilib
 * UI doim barqaror ishlaydi (internet uzilishi, ruxsat xatosi va h.k. holatlarda ham).
 */

import {
  ref,
  onValue,
  set,
  push,
  get,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database';
import { database } from '../firebase';
import { UserProfile, DuelOutcome, AdminSettings } from '../types';

// ============================================================
// FOYDALANUVCHILAR (users/*) — barcha foydalanuvchilarga umumiy
// ============================================================

/**
 * Barcha ro'yxatdan o'tgan foydalanuvchilarni real vaqtda kuzatadi.
 * Har safar users/* tugunida o'zgarish bo'lsa, callback yangi ro'yxat bilan chaqiriladi.
 * Qaytarilgan funksiyani chaqirish orqali obunani bekor qilish mumkin (unsubscribe).
 */
export function subscribeToUsers(callback: (users: UserProfile[]) => void): () => void {
  const usersRef = ref(database, 'users');

  // onValue o'zi obunani bekor qilish uchun funksiya (unsubscribe) qaytaradi —
  // shuni to'g'ridan-to'g'ri chaqiruvchiga qaytaramiz.
  return onValue(
    usersRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const list: UserProfile[] = Object.values(data).filter(
        (u): u is UserProfile => !!u && typeof u === 'object' && 'id' in u
      );
      callback(list);
    },
    (error) => {
      console.error("[Firebase] Foydalanuvchilar ro'yxatini yuklashda xatolik:", error);
      callback([]);
    }
  );
}

/**
 * Bitta foydalanuvchi profilini bulutga (Firebase) yozadi/yangilaydi.
 * Bu funksiya "fire-and-forget" tarzida ishlaydi — chaqiruvchi kod natijani kutishi shart emas,
 * lekin xato bo'lsa konsolga chiqadi.
 */
export function saveUserToCloud(user: UserProfile): void {
  if (!user || !user.id) return;
  const userRef = ref(database, `users/${user.id}`);
  set(userRef, user).catch((error) => {
    console.error('[Firebase] Foydalanuvchini saqlashda xatolik:', error);
  });
}

/**
 * Bitta martalik (real-time bo'lmagan) foydalanuvchilar ro'yxatini olib keladi.
 * Masalan, ilova birinchi ochilganda tezkor snapshot kerak bo'lganda ishlatiladi.
 */
export async function fetchUsersOnce(): Promise<UserProfile[]> {
  try {
    const snapshot = await get(ref(database, 'users'));
    const data = snapshot.val();
    if (!data) return [];
    return Object.values(data).filter(
      (u): u is UserProfile => !!u && typeof u === 'object' && 'id' in u
    );
  } catch (error) {
    console.error("[Firebase] Foydalanuvchilarni bir martalik o'qishda xatolik:", error);
    return [];
  }
}

// ============================================================
// DUELLAR (duels/*) — so'nggi jonli 1v1 natijalar lentasi, umumiy
// ============================================================

/**
 * Eng so'nggi N ta duel natijasini real vaqtda kuzatadi (createdAt bo'yicha tartiblangan,
 * eng yangisi ro'yxat boshida). Standart holatda oxirgi 5 ta duel olinadi.
 */
export function subscribeToRecentDuels(
  callback: (duels: DuelOutcome[]) => void,
  limit: number = 5
): () => void {
  const duelsQuery = query(ref(database, 'duels'), orderByChild('createdAt'), limitToLast(limit));

  return onValue(
    duelsQuery,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const list: DuelOutcome[] = (Object.values(data) as DuelOutcome[])
        .filter((d) => !!d && typeof d === 'object')
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    },
    (error) => {
      console.error('[Firebase] Duellar lentasini yuklashda xatolik:', error);
      callback([]);
    }
  );
}

/**
 * Yangi tugagan duel natijasini umumiy lentaga (bulutga) qo'shadi.
 * createdAt avtomatik ravishda joriy vaqt (Date.now()) bilan to'ldiriladi,
 * shu orqali barcha foydalanuvchilar bir xil tartibda va real vaqt bilan ko'radi.
 */
export function addDuelToCloud(duel: Omit<DuelOutcome, 'id'> & { id?: string }): void {
  const duelsRef = ref(database, 'duels');
  const newRef = push(duelsRef);
  const payload: DuelOutcome = {
    ...duel,
    id: newRef.key || duel.id || `duel-${Date.now()}`,
    createdAt: duel.createdAt || Date.now(),
  } as DuelOutcome;

  set(newRef, payload).catch((error) => {
    console.error('[Firebase] Duel natijasini saqlashda xatolik:', error);
  });
}

// ============================================================
// ADMIN SOZLAMALARI (adminSettings) — bitta umumiy hujjat
// ============================================================

/**
 * Admin sozlamalarini real vaqtda kuzatadi. Har qanday admin panelidan
 * kiritilgan o'zgarish barcha foydalanuvchilarga bir zumda yetib boradi.
 */
export function subscribeToAdminSettings(
  callback: (settings: AdminSettings | null) => void
): () => void {
  const settingsRef = ref(database, 'adminSettings');

  return onValue(
    settingsRef,
    (snapshot) => {
      callback(snapshot.exists() ? (snapshot.val() as AdminSettings) : null);
    },
    (error) => {
      console.error('[Firebase] Admin sozlamalarini yuklashda xatolik:', error);
      callback(null);
    }
  );
}

/**
 * Admin sozlamalarini to'liq bulutga yozadi (barcha foydalanuvchilar uchun umumiy).
 */
export function saveAdminSettingsToCloud(settings: AdminSettings): void {
  const settingsRef = ref(database, 'adminSettings');
  set(settingsRef, settings).catch((error) => {
    console.error('[Firebase] Admin sozlamalarini saqlashda xatolik:', error);
  });
}

/**
 * Agar bazada hali adminSettings umuman bo'lmasa (loyiha birinchi marta ishga tushganda),
 * standart sozlamalar bilan urug'lantiradi (seed). Bu faqat bir marta, bo'sh bo'lgandagina yoziladi —
 * shuning uchun boshqa foydalanuvchilarning kiritgan o'zgarishlarini hech qachon ustidan yozib yubormaydi.
 */
export async function ensureAdminSettingsSeed(defaultSettings: AdminSettings): Promise<void> {
  try {
    const settingsRef = ref(database, 'adminSettings');
    const snapshot = await get(settingsRef);
    if (!snapshot.exists()) {
      await set(settingsRef, defaultSettings);
    }
  } catch (error) {
    console.error('[Firebase] Admin sozlamalarini urug\'lantirishda xatolik:', error);
  }
}
