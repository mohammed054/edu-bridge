import { ROLE_HOME } from './constants';

export const resolveHomePath = (role) => ROLE_HOME[String(role || '').toLowerCase()] || '/login';