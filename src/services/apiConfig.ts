import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getExpoHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest2?: { extra?: { expoGo?: { hostUri?: string } } } }).manifest2?.extra?.expoGo?.hostUri ??
    (Constants as { expoGo?: { hostUri?: string } }).expoGo?.hostUri ??
    '';

  return hostUri.split(':')[0];
}

export function resolveApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  const host = getExpoHost();
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:3000`;
  }

  // O Android Emulator encaminha 10.0.2.2 para o computador hospedeiro.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();
