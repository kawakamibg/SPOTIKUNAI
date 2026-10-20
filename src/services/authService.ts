import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  nome: string;
  email: string;
  senha?: string;
}

const USERS_KEY = '@spotikunai_users';
const CURRENT_USER_KEY = '@spotikunai_current_user';

export const authService = {
  // Cadastra um novo usuário no banco de dados local
  async cadastrar(novoUsuario: User): Promise<{ success: boolean; message: string }> {
    try {
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

      // Verificar se o e-mail já está cadastrado
      const userExists = users.some((u) => u.email.toLowerCase() === novoUsuario.email.toLowerCase());
      if (userExists) {
        return { success: false, message: 'E-mail já cadastrado na aplicação.' };
      }

      users.push(novoUsuario);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Define como usuário logado automaticamente ao cadastrar
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(novoUsuario));

      return { success: true, message: 'Conta criada com sucesso!' };
    } catch (error) {
      return { success: false, message: 'Erro ao salvar dados do usuário.' };
    }
  },

  // Realiza a verificação de Login
  async login(email: string, senha: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
      );

      if (!user) {
        return { success: false, message: 'E-mail ou senha incorretos.' };
      }

      // Salva a sessão ativa
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      return { success: true, message: 'Login realizado!', user };
    } catch (error) {
      return { success: false, message: 'Erro ao realizar login.' };
    }
  },

  // Busca o usuário que está atualmente logado
  async getUsuarioAtual(): Promise<User | null> {
    try {
      const userRaw = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userRaw ? JSON.parse(userRaw) : null;
    } catch (error) {
      return null;
    }
  },

  // Encerra a sessão do usuário (Logout)
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
  }
};