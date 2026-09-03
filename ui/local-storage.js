// localStorage kapalıysa (gizli sekme, kota, kurumsal kısıt) uygulama bellek
// içi durumla çalışmaya devam eder; bu sarmalayıcılar hatayı yutar.

export function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Depolama yoksa silinecek kayıt da yoktur.
  }
}
