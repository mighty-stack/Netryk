import { createSlice } from '@reduxjs/toolkit';

const KEY = 'netryk_token';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* storage blocked */ } };

const token = read();

// `ready` is false only while a stored token is being checked against /auth/me.
const slice = createSlice({
  name: 'auth',
  initialState: { token, user: null, ready: !token },
  reducers: {
    setSession(state, { payload }) { state.token = payload.token; state.user = payload.user; state.ready = true; write(payload.token); },
    setUser(state, { payload }) { state.user = payload; state.ready = true; },
    clearSession(state) { state.token = null; state.user = null; state.ready = true; write(null); },
  },
});

export const { setSession, setUser, clearSession } = slice.actions;
export default slice.reducer;
