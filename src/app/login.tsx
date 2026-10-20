import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

export default function LoginScreen() {
  const router = useRouter();

  // Controla se o usuário está na aba de 'Login' ou de 'Cadastro'
  const [isModoCadastro, setIsModoCadastro] = useState(false);

  // States do Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmeter = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (isModoCadastro) {
      if (!nome.trim()) {
        Alert.alert('Erro', 'Por favor, informe o seu nome.');
        return;
      }

      // Cadastrar no banco local
      const res = await authService.cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha: senha.trim(),
      });

      if (res.success) {
        Alert.alert('Sucesso', res.message);
        router.replace('/' as any);
      } else {
        Alert.alert('Atenção', res.message);
      }
    } else {
      // Realizar Login
      const res = await authService.login(email.trim(), senha.trim());

      if (res.success) {
        Alert.alert('Bem-vindo!', `Olá, ${res.user?.nome || 'usuário'}!`);
        router.replace('/' as any);
      } else {
        Alert.alert('Erro', res.message);
      }
    }
  };

  return (
    <LinearGradient colors={['#1DB954', '#191414', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Botão de Voltar para Home */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* Logo e Título */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Spotikunai</Text>
          <Text style={styles.appSubtitle}>Sua conta na rede social de álbuns</Text>
        </View>

        {/* Alternador Entrar / Criar Conta */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, !isModoCadastro && styles.tabActive]}
            onPress={() => setIsModoCadastro(false)}
          >
            <Text style={[styles.tabText, !isModoCadastro && styles.tabTextActive]}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, isModoCadastro && styles.tabActive]}
            onPress={() => setIsModoCadastro(true)}
          >
            <Text style={[styles.tabText, isModoCadastro && styles.tabTextActive]}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Formulário */}
        <View style={styles.formCard}>
          {isModoCadastro ? (
            <>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Shinobi da Música"
                placeholderTextColor="#777"
                value={nome}
                onChangeText={setNome}
              />
            </>
          ) : null}

          <Text style={styles.inputLabel}>E-mail *</Text>
          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Senha *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#777"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmeter}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isModoCadastro ? 'Cadastrar e Entrar' : 'Entrar na Conta'}
            </Text>
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
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#B3B3B3',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 4,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#1DB954',
  },
  tabText: {
    color: '#B3B3B3',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLabel: {
    color: '#B3B3B3',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#282828',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#383838',
  },
  submitButton: {
    backgroundColor: '#1DB954',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});