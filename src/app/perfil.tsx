import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { authService, User } from '../services/authService';

export default function Perfil() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<User | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  const carregarPerfil = async () => {
    const user = await authService.getUsuarioAtual();
    if (!user) {
      router.replace('/login' as any);
      return;
    }
    setUsuario(user);
    setNome(user.nome);
    setEmail(user.email);
    setFotoPerfil(user.fotoPerfil || '');
  };

  const exibirAlerta = (titulo: string, mensagem: string, aoFechar?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
      if (aoFechar) aoFechar();
    } else {
      Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: aoFechar }]);
    }
  };

  // Função para abrir o seletor de arquivos do computador/celular
  const selecionarFotoLocal = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        exibirAlerta(
          'Permissão necessária',
          'Você precisa permitir o acesso aos arquivos para selecionar uma foto.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Converte para string Base64 garantindo persistência local no AsyncStorage
        const imagemFormatada = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        
        setFotoPerfil(imagemFormatada);
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      exibirAlerta('Erro', 'Ocorreu um problema ao selecionar a imagem local.');
    }
  };

  const validarEmail = (textoEmail: string) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(textoEmail);
  };

  const handleSalvar = async () => {
    if (!usuario) return;

    if (!nome.trim()) {
      exibirAlerta('Atenção', 'O nome não pode ficar em branco.');
      return;
    }

    if (!email.trim() || !validarEmail(email.trim())) {
      exibirAlerta('Atenção', 'Por favor, insira um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const resultado = await authService.atualizarPerfil(
        usuario.id,
        nome,
        email,
        senhaAtual,
        novaSenha,
        fotoPerfil
      );

      if (resultado.sucesso) {
        exibirAlerta('Sucesso', resultado.mensagem, () => {
          setSenhaAtual('');
          setNovaSenha('');
          carregarPerfil();
        });
      } else {
        exibirAlerta('Erro', resultado.mensagem);
      }
    } catch (error) {
      exibirAlerta('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1DB954', '#191414']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          
          {/* Foto de Perfil com Botão de Lápis */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {fotoPerfil.trim() !== '' ? (
                <Image source={{ uri: fotoPerfil }} style={styles.avatarPreview} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#1DB954" />
                </View>
              )}

              {/* Botão de Lápis para Seleção de Arquivo Local */}
              <TouchableOpacity 
                style={styles.pencilButton} 
                onPress={selecionarFotoLocal}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Meu Perfil</Text>
            <Text style={styles.subtitle}>Clique no lápis para escolher uma foto local</Text>
          </View>

          <Text style={styles.sectionHeader}>Informações Pessoais</Text>

          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#777"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>E-mail *</Text>
          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.sectionHeader}>Alterar Senha (Opcional)</Text>
          
          <Text style={styles.label}>Senha Atual</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a senha atual para alterar"
            placeholderTextColor="#777"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureTextEntry
          />

          <Text style={styles.label}>Nova Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Nova senha (min. 4 caracteres)"
            placeholderTextColor="#777"
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSalvar}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await authService.logout();
              if (Platform.OS === 'web') {
                window.location.href = '/';
              } else {
                router.replace('/');
              }
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#FF6B6B" style={{ marginRight: 6 }} />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#1DB954',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1DB954',
  },
  pencilButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1DB954',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#181818',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#B3B3B3',
    marginTop: 2,
  },
  sectionHeader: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 4,
  },
  label: {
    color: '#B3B3B3',
    fontSize: 13,
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#282828',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#383838',
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
  },
});