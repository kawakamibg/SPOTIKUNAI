import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="favoritos" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="login" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="detalhes/[id]" />
    </Stack>
  );
}