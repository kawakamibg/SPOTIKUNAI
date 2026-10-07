import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Importação dos componentes criados
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = () => {
    Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
    router.push('/');
  };

  return (
    <LinearGradient colors={['#191414', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <Header
          title="Criar Conta"
          subtitle="Junte-se ao Spotikunai para avaliar álbuns"
        />

        {/* --- Formulário de Cadastro --- */}
        <View style={styles.form}>
          <CustomInput
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            value={nome}
            onChangeText={setNome}
          />

          <CustomInput
            label="E-mail"
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <CustomInput
            label="Senha"
            placeholder="Digite sua senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <CustomInput
            label="Confirmar Senha"
            placeholder="Confirme sua senha"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />

          {/* Botão para submeter o cadastro */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCadastro}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          {/* Botão para voltar à Home */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Já tem uma conta? Voltar</Text>
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
  scroll: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 500, // Limita a largura para ficar elegante na Web
    marginTop: 20,
    gap: 16, // Espaçamento automático entre os campos
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
    cursor: 'pointer',
  },
  backButtonText: {
    color: '#B3B3B3',
    fontSize: 14,
  },
});