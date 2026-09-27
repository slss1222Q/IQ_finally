/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Firebase ulanishi — IQ Level UZ
 * ------------------------------------------------------------------
 * Bu loyihada barcha foydalanuvchilar, duellar va admin sozlamalari
 * Firebase Realtime Database orqali UMUMIY (real-time, hamma foydalanuvchiga
 * bir xil) tarzda saqlanadi va sinxronlanadi.
 *
 * Muhim: loyiha talabiga ko'ra konfiguratsiya to'g'ridan-to'g'ri shu faylda
 * saqlanadi (hech qanday .env fayl yoki muhit o'zgaruvchisi talab qilinmaydi).
 * Realtime Database qoidalari ochiq (public) rejimda ishlatilishi mo'ljallangan,
 * shuning uchun bu yerda maxfiy backend kalitlari mavjud emas — apiKey faqat
 * Firebase loyihasini aniqlash uchun ishlatiladi, u maxfiy hisoblanmaydi.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCCkFdA6M1mxbB0dJPOh3Yzd1Dp6lpPOqI',
  authDomain: 'iq1bott.firebaseapp.com',
  databaseURL: 'https://iq1bott-default-rtdb.firebaseio.com',
  projectId: 'iq1bott',
  storageBucket: 'iq1bott.firebasestorage.app',
  messagingSenderId: '883264451249',
  appId: '1:883264451249:web:0ec2d1357f954795fd6890',
  measurementId: 'G-YBR2CPEYD0',
};

// Ilova bir necha marta qayta render bo'lganda ham Firebase faqat bir marta
// initsializatsiya qilinishini kafolatlaydi (HMR / StrictMode xavfsiz).
const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Realtime Database instansi — butun ilova davomida shu bitta instansdan foydalaniladi.
export const database: Database = getDatabase(firebaseApp);

export default firebaseApp;
