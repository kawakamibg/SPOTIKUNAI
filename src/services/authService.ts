import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  fotoPerfil?: string;
}

const USERS_KEY = '@spotikunai_users';
const CURRENT_USER_KEY = '@spotikunai_current_user';

export const authService = {
  async getUsuarios(): Promise<User[]> {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  async cadastrar(nome: string, email: string, senha: string): Promise<boolean> {
    try {
      const usuarios = await this.getUsuarios();
      const emailTratado = email.trim().toLowerCase();
      
      const emailExiste = usuarios.some(
        (u) => u.email.trim().toLowerCase() === emailTratado
      );

      if (emailExiste) {
        return false;
      }

      const novoUsuario: User = {
        id: Date.now().toString(),
        nome: nome.trim(),
        email: emailTratado,
        senha: senha.trim(),
        fotoPerfil: '',
      };

      usuarios.push(novoUsuario);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(novoUsuario));
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      return false;
    }
  },

  async login(email: string, senha: string): Promise<User | null> {
    try {
      const usuarios = await this.getUsuarios();
      const emailTratado = email.trim().toLowerCase();
      const senhaTratada = senha.trim();

      const usuario = usuarios.find(
        (u) => u.email.trim().toLowerCase() === emailTratado && u.senha === senhaTratada
      );

      if (usuario) {
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
        return usuario;
      }
      return null;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  },

  async getUsuarioAtual(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  },

  async atualizarPerfil(
    userId: string,
    novoNome: string,
    novoEmail: string,
    senhaAtual?: string,
    novaSenha?: string,
    fotoPerfil?: string
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      const usuarios = await this.getUsuarios();
      const usuarioIndex = usuarios.findIndex((u) => u.id === userId);

      if (usuarioIndex === -1) {
        return { sucesso: false, mensagem: 'Usuário não encontrado.' };
      }

      const usuario = usuarios[usuarioIndex];
      const emailTratado = novoEmail.trim().toLowerCase();

      const emailEmUso = usuarios.some(
        (u) => u.id !== userId && u.email.trim().toLowerCase() === emailTratado
      );

      if (emailEmUso) {
        return { sucesso: false, mensagem: 'Este e-mail já está em uso por outra conta.' };
      }

      if (novaSenha && novaSenha.trim().length > 0) {
        if (!senhaAtual || usuario.senha !== senhaAtual.trim()) {
          return { sucesso: false, mensagem: 'A senha atual está incorreta.' };
        }
        if (novaSenha.trim().length < 4) {
          return { sucesso: false, mensagem: 'A nova senha deve ter no mínimo 4 caracteres.' };
        }
        usuario.senha = novaSenha.trim();
      }

      usuario.nome = novoNome.trim();
      usuario.email = emailTratado;
      usuario.fotoPerfil = fotoPerfil ? fotoPerfil.trim() : '';

      usuarios[usuarioIndex] = usuario;

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));

      return { sucesso: true, mensagem: 'Perfil atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { sucesso: false, mensagem: 'Erro interno ao atualizar os dados.' };
    }
  },
};