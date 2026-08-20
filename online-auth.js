(() => {
  'use strict';

  // This small bridge keeps the public Supabase browser configuration separate
  // from private payment credentials. The service-role key and InfinitePay
  // handle never reach this file or the browser.
  const SESSION_KEY = 'therichcorp-v3-online-session';
  const EXPIRY_SAFETY_MS = 45 * 1000;
  let configPromise = null;
  let loadedConfig = null;
  let activeSession = null;

  function safeStorage(name) {
    try { return window[name]; } catch (_) { return null; }
  }

  function readStoredSession() {
    const stores = [safeStorage('localStorage'), safeStorage('sessionStorage')];
    for (const store of stores) {
      if (!store) continue;
      try {
        const raw = store.getItem(SESSION_KEY);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.accessToken === 'string' && parsed.accessToken) return parsed;
      } catch (_) { /* Ignore stale or malformed browser storage. */ }
    }
    return null;
  }

  function clearStoredSession() {
    [safeStorage('localStorage'), safeStorage('sessionStorage')].forEach((store) => {
      try { store && store.removeItem(SESSION_KEY); } catch (_) { /* Storage can be disabled. */ }
    });
    activeSession = null;
  }

  function storeSession(session, remember = true) {
    activeSession = session;
    const preferred = safeStorage(remember ? 'localStorage' : 'sessionStorage');
    const other = safeStorage(remember ? 'sessionStorage' : 'localStorage');
    try { other && other.removeItem(SESSION_KEY); } catch (_) { /* Storage can be disabled. */ }
    try { preferred && preferred.setItem(SESSION_KEY, JSON.stringify(session)); } catch (_) { /* Session remains usable in memory. */ }
    return session;
  }

  function buildSession(payload, prior = {}) {
    if (!payload || typeof payload.access_token !== 'string' || !payload.access_token) return null;
    const expiresIn = Number(payload.expires_in);
    return {
      accessToken: payload.access_token,
      refreshToken: typeof payload.refresh_token === 'string' ? payload.refresh_token : (prior.refreshToken || null),
      expiresAt: Number.isFinite(expiresIn) ? Date.now() + expiresIn * 1000 : (prior.expiresAt || Date.now() + 55 * 60 * 1000),
      user: payload.user || prior.user || null,
    };
  }

  function publicReturnUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  async function responseData(response) {
    const data = await response.json().catch(() => ({}));
    if (response.ok) return data;
    const message = data && (data.msg || data.message || data.error_description || data.error) || 'Não foi possível concluir a autenticação.';
    throw new Error(message);
  }

  async function loadConfig() {
    if (configPromise) return configPromise;
    configPromise = (async () => {
      // file:// and a local static preview never get a live credentials setup.
      if (window.location.protocol !== 'https:') return null;
      try {
        const response = await fetch('/api/public-config', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
        const data = await responseData(response);
        const supabaseUrl = typeof data.supabaseUrl === 'string' ? data.supabaseUrl.replace(/\/$/, '') : '';
        const supabaseAnonKey = typeof data.supabaseAnonKey === 'string' ? data.supabaseAnonKey : '';
        loadedConfig = supabaseUrl && supabaseAnonKey ? { supabaseUrl, supabaseAnonKey } : null;
        return loadedConfig;
      } catch (_) {
        // The game still works as an offline local demo when the online layer is absent.
        loadedConfig = null;
        return null;
      }
    })();
    return configPromise;
  }

  async function getConfigOrThrow() {
    const config = await loadConfig();
    if (!config) throw new Error('A conta online ainda não está configurada neste ambiente.');
    return config;
  }

  async function postAuth(path, payload) {
    const config = await getConfigOrThrow();
    const response = await fetch(`${config.supabaseUrl}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: config.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return responseData(response);
  }

  async function refreshSession(session) {
    if (!session || !session.refreshToken) {
      clearStoredSession();
      return null;
    }
    try {
      const data = await postAuth('token?grant_type=refresh_token', { refresh_token: session.refreshToken });
      const refreshed = buildSession(data, session);
      return refreshed ? storeSession(refreshed, true) : null;
    } catch (_) {
      clearStoredSession();
      return null;
    }
  }

  function hydrateOAuthCallback() {
    const hash = window.location.hash ? window.location.hash.slice(1) : '';
    if (!hash) return;
    const parameters = new URLSearchParams(hash);
    const accessToken = parameters.get('access_token');
    if (!accessToken) return;
    const expiresIn = Number(parameters.get('expires_in'));
    const session = {
      accessToken,
      refreshToken: parameters.get('refresh_token'),
      expiresAt: Number.isFinite(expiresIn) ? Date.now() + expiresIn * 1000 : Date.now() + 55 * 60 * 1000,
      user: null,
    };
    storeSession(session, true);
    try { window.history.replaceState({}, document.title, publicReturnUrl()); } catch (_) { /* Cosmetic only. */ }
  }

  hydrateOAuthCallback();
  activeSession = readStoredSession();

  async function getAccessToken() {
    const session = activeSession || readStoredSession();
    if (!session) return null;
    if (Number(session.expiresAt) - Date.now() > EXPIRY_SAFETY_MS) return session.accessToken;
    const refreshed = await refreshSession(session);
    return refreshed ? refreshed.accessToken : null;
  }

  async function getSession() {
    const token = await getAccessToken();
    if (!token) return null;
    return activeSession || readStoredSession();
  }

  async function getUser() {
    const token = await getAccessToken();
    if (!token) return null;
    const session = activeSession || readStoredSession();
    if (session && session.user) return session.user;
    try {
      const config = await getConfigOrThrow();
      const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, { headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${token}` } });
      const user = await responseData(response);
      if (session) storeSession({ ...session, user }, true);
      return user;
    } catch (_) {
      return null;
    }
  }

  async function signIn({ email, password, remember = true }) {
    const data = await postAuth('token?grant_type=password', { email, password });
    const session = buildSession(data);
    if (!session) throw new Error('A conta não retornou uma sessão válida.');
    return storeSession(session, remember);
  }

  async function signUp({ email, password, remember = true }) {
    const data = await postAuth('signup', { email, password, options: { emailRedirectTo: publicReturnUrl() } });
    const session = buildSession(data);
    if (session) storeSession(session, remember);
    return { session, user: data.user || null, requiresConfirmation: !session };
  }

  async function signInWithGoogle() {
    const config = await getConfigOrThrow();
    const params = new URLSearchParams({ provider: 'google', redirect_to: publicReturnUrl() });
    window.location.assign(`${config.supabaseUrl}/auth/v1/authorize?${params.toString()}`);
  }

  async function resetPassword(email) {
    await postAuth('recover', { email, options: { redirectTo: publicReturnUrl() } });
  }

  window.TheRichAuth = Object.freeze({
    ready: loadConfig,
    isConfigured: async () => Boolean(await loadConfig()),
    isConfiguredSync: () => Boolean(loadedConfig),
    getAccessToken,
    getSession,
    getUser,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    signOut: clearStoredSession,
  });
})();
