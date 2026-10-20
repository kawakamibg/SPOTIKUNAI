import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const exibirAlerta = (titulo: string, mensagem: string, aoFechar?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
      if (aoFechar) aoFechar();
    } else {
      Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: aoFechar }]);
    }
  };

  const validarEmail = (textoEmail: string) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(textoEmail);
  };

  const handleLogin = async () => {
    if (!email.trim() || !validarEmail(email.trim())) {
      setEmailError('insira um e-mail válido');
      exibirAlerta('Atenção', 'insira um e-mail válido');
      return;
    }

    setEmailError('');

    if (!senha.trim()) {
      exibirAlerta('Atenção', 'Por favor, insira a sua senha.');
      return;
    }

    setLoading(true);
    try {
      const usuario = await authService.login(email.trim(), senha.trim());
      if (usuario) {
        exibirAlerta('Sucesso', `Bem-vindo de volta, ${usuario.nome}!`, () => {
          if (Platform.OS === 'web') {
            window.location.href = '/';
          } else {
            router.replace('/');
          }
        });
      } else {
        exibirAlerta('Erro ao entrar', 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      exibirAlerta('Erro', 'Ocorreu um problema ao tentar realizar o login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1DB954', '#191414']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Spotikunai</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <Text style={styles.label}>E-mail *</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="seuemail@exemplo.com"
          placeholderTextColor="#777"
          value={email}
          onChangeText={(texto) => {
            setEmail(texto);
            if (emailError && validarEmail(texto.trim())) {
              setEmailError('');
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Text style={styles.label}>Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#777"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Ainda não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/cadastro' as any)}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    maxWidth: 400,
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#B3B3B3',
    fontSize: 13,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#282828',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#383838',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    alignSelf: 'flex-start',
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 18,
  },
  registerText: {
    color: '#B3B3B3',
    fontSize: 13,
  },
  registerLink: {
    color: '#1DB954',
    fontSize: 13,
    fontWeight: 'bold',
  },
});