import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  FlatList,
  Switch,
  Image,
  Platform
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import AlbumCard from '../components/AlbumCard';
import { ALBUNS_INICIAIS, Album } from '../data/albuns';
import { authService, User } from '../services/authService';

const ALBUNS_STORAGE_KEY = '@spotikunai_albuns';

export default function Home() {
  const router = useRouter();

  // States de Dados do Utilizador e Lista
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [genero, setGenero] = useState<string>('Nenhuma preferência salva');
  const [inputGeneroCustom, setInputGeneroCustom] = useState<string>('');
  const [avaliacoes, setAvaliacoes] = useState<Album[]>([]); 

  const [modoCompacto, setModoCompacto] = useState(false);

  // States do Modal de Avaliação
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nomeAlbum, setNomeAlbum] = useState('');
  const [nomeArtista, setNomeArtista] = useState('');
  const [dataLancamento, setDataLancamento] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  const [nota, setNota] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    carregarUsuario();
    carregarGenero();
    carregarAlbuns();
  }, []);

  const carregarUsuario = async () => {
    const user = await authService.getUsuarioAtual();
    setUsuarioLogado(user);
  };

  async function carregarAlbuns() {
    try {
      const albunsSalvosRaw = await AsyncStorage.getItem(ALBUNS_STORAGE_KEY);
      if (albunsSalvosRaw !== null) {
        const albunsSalvos: Album[] = JSON.parse(albunsSalvosRaw);
        ALBUNS_INICIAIS.length = 0;
        ALBUNS_INICIAIS.push(...albunsSalvos);
        setAvaliacoes(albunsSalvos);
      } else {
        await AsyncStorage.setItem(ALBUNS_STORAGE_KEY, JSON.stringify([]));
        ALBUNS_INICIAIS.length = 0;
        setAvaliacoes([]);
      }
    } catch (erro) {
      console.error('Erro ao carregar álbuns:', erro);
    }
  }

  // Práticas AsyncStorage
  async function carregarGenero() {
    try {
      const valor = await AsyncStorage.getItem('genero_favorito');
      setGenero(valor ?? 'Nenhuma preferência salva');
    } catch (erro) {
      console.error('Erro ao carregar gênero:', erro);
    }
  }

  async function salvarGenero(novoGenero: string) {
    try {
      await AsyncStorage.setItem('genero_favorito', novoGenero);
      setGenero(novoGenero);
      Alert.alert('Preferência Salva', `Gênero favorito salvo: ${novoGenero}`);
    } catch (erro) {
      console.error('Erro ao salvar gênero:', erro);
    }
  }

  async function salvarGeneroCustomizado() {
    if (!inputGeneroCustom.trim()) {
      Alert.alert('Atenção', 'Por favor, digite um gênero musical antes de salvar.');
      return;
    }
    try {
      await AsyncStorage.setItem('genero_favorito', inputGeneroCustom.trim());
      setGenero(inputGeneroCustom.trim());
      Alert.alert('Sucesso', `Gênero "${inputGeneroCustom.trim()}" gravado no armazenamento local!`);
      setInputGeneroCustom('');
    } catch (erro) {
      console.error('Erro ao salvar gênero customizado:', erro);
    }
  }

  async function removerGenero() {
    try {
      await AsyncStorage.removeItem('genero_favorito');
      setGenero('Preferência removida');
      Alert.alert('Removido', 'Gênero favorito apagado do dispositivo com sucesso!');
    } catch (erro) {
      console.error('Erro ao remover gênero:', erro);
    }
  }

  const handleAbrirCriar = () => {
    setEditingId(null);
    setNomeAlbum('');
    setNomeArtista('');
    setDataLancamento('');
    setUrlImagem('');
    setNota(0);
    setReviewText('');
    setModalVisible(true);
  };

  const handleAbrirEditar = (item: Album) => {
    setEditingId(item.id);
    setNomeAlbum(item.nomeAlbum);
    setNomeArtista(item.nomeArtista);
    setDataLancamento(item.dataLancamento);
    setUrlImagem(item.urlImagem || '');
    setNota(item.nota);
    setReviewText(item.descricao || '');
    setModalVisible(true);
  };

  const handleDeletar = (id: string, nome: string) => {
    const executarExclusao = async () => {
      const novaLista = avaliacoes.filter(item => item.id !== id);
      ALBUNS_INICIAIS.length = 0;
      ALBUNS_INICIAIS.push(...novaLista);
      await AsyncStorage.setItem(ALBUNS_STORAGE_KEY, JSON.stringify(novaLista));
      setAvaliacoes(novaLista);
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Tem certeza que deseja apagar a avaliação de "${nome}"?`);
      if (confirmou) executarExclusao();
    } else {
      Alert.alert(
        "Excluir Avaliação",
        `Tem certeza que deseja apagar a avaliação de "${nome}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: executarExclusao }
        ]
      );
    }
  };

  const handleSalvarAvaliacao = async () => {
    if (!nomeAlbum.trim() || !nomeArtista.trim()) {
      Alert.alert("Atenção", "Por favor, preencha pelo menos o nome do álbum e do artista.");
      return;
    }

    let novaLista: Album[] = [];

    if (editingId) {
      novaLista = avaliacoes.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            nomeAlbum: nomeAlbum.trim(),
            nomeArtista: nomeArtista.trim(),
            dataLancamento: dataLancamento.trim() || '2024',
            urlImagem: urlImagem.trim(),
            nota: nota,
            descricao: reviewText.trim() || 'Sem review escrita.',
          };
        }
        return item;
      });
    } else {
      const novoAlbum: Album = {
        id: Date.now().toString(),
        nomeAlbum: nomeAlbum.trim(),
        nomeArtista: nomeArtista.trim(),
        dataLancamento: dataLancamento.trim() || '2024',
        urlImagem: urlImagem.trim(),
        nota: nota,
        genero: genero !== 'Nenhuma preferência salva' ? genero : 'Gênero não informado',
        descricao: reviewText.trim() || 'Sem review escrita.',
      };
      novaLista = [novoAlbum, ...avaliacoes];
    }

    ALBUNS_INICIAIS.length = 0;
    ALBUNS_INICIAIS.push(...novaLista);
    try {
      await AsyncStorage.setItem(ALBUNS_STORAGE_KEY, JSON.stringify(novaLista));
    } catch (erro) {
      console.error('Erro ao salvar álbuns:', erro);
    }

    setAvaliacoes(novaLista);
    setModalVisible(false);
  };

  return (
    <LinearGradient colors={['#1DB954', '#191414']} style={styles.container}>
      
      {/* Topo de Autenticação */}
      <View style={styles.topHeader}>
        {usuarioLogado ? (
          <View style={styles.userHeaderInfo}>
            <Text style={styles.userGreeting}>👤 Olá, {usuarioLogado.nome}</Text>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={async () => {
                await authService.logout();
                setUsuarioLogado(null);
              }}
            >
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.topButton} 
            onPress={() => router.push('/login' as any)}
          >
            <Ionicons name="person-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.topButtonText}>Entrar / Cadastrar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={avaliacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlbumCard
            id={item.id}
            nomeAlbum={item.nomeAlbum}
            nomeArtista={item.nomeArtista}
            dataLancamento={item.dataLancamento}
            urlImagem={item.urlImagem}
            nota={item.nota}
            modoCompacto={modoCompacto}
            onPress={() => router.push(`/detalhes/${item.id}` as any)}
            onEdit={() => handleAbrirEditar(item)}
            onDelete={() => handleDeletar(item.id, item.nomeAlbum)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="disc-outline" size={48} color="#555" />
            <Text style={styles.emptyText}>Nenhum álbum avaliado ainda.</Text>
            <Text style={styles.emptySubtext}>Clique no botão "+ Nova" para adicionar sua primeira avaliação!</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            
            <Animatable.View animation="fadeInDown" duration={1500} style={styles.titleContainer}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
              <Text style={styles.title}>Spotikunai</Text>
            </Animatable.View>

            <Text style={styles.subtitle}>Sua rede social de álbuns</Text>

            {/* CARD DAS PRÁTICAS DO PROFESSOR (1, 2, 3 e 4) */}
            <View style={styles.preferenceCard}>
              <Text style={styles.preferenceTitle}>🎧 Práticas AsyncStorage</Text>
              <Text style={styles.preferenceText}>
                Gênero Salvo: <Text style={styles.preferenceHighlight}>{genero}</Text>
              </Text>
              
              {/* PRÁTICA 4: Entrada do Usuário (TextInput + Botão Salvar) */}
              <Text style={styles.inputPrefLabel}>Prática 4: Digite seu gênero favorito</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="Ex: Heavy Metal, MPB, K-Pop..."
                  placeholderTextColor="#777"
                  value={inputGeneroCustom}
                  onChangeText={setInputGeneroCustom}
                />
                <TouchableOpacity 
                  style={styles.saveCustomButton} 
                  onPress={salvarGeneroCustomizado}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveCustomButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>

              {/* Botões Rápidos de Exemplo */}
              <View style={styles.preferenceButtonsContainer}>
                <TouchableOpacity style={styles.savePrefButtonSecondary} onPress={() => salvarGenero('Rock')}>
                  <Text style={styles.savePrefButtonText}>"Rock"</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.savePrefButtonSecondary} onPress={() => salvarGenero('Pop')}>
                  <Text style={styles.savePrefButtonText}>"Pop"</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.savePrefButtonSecondary} onPress={() => salvarGenero('Hip-Hop')}>
                  <Text style={styles.savePrefButtonText}>"Hip-Hop"</Text>
                </TouchableOpacity>
              </View>

              {/* PRÁTICA 2 e 3: Carregar e Remover */}
              <View style={styles.actionRowContainer}>
                <TouchableOpacity style={styles.loadPrefButton} onPress={carregarGenero} activeOpacity={0.8}>
                  <Ionicons name="refresh-circle-outline" size={18} color="#1DB954" style={{ marginRight: 4 }} />
                  <Text style={styles.loadPrefButtonText}>Carregar (getItem)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.removePrefButton} onPress={removerGenero} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" style={{ marginRight: 4 }} />
                  <Text style={styles.removePrefButtonText}>Remover (removeItem)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Alternador de Modo Compacto */}
            <View style={styles.modeToggleContainer}>
              <Text style={styles.modeToggleText}>
                {modoCompacto ? 'Modo Compacto Ativo' : 'Modo Completo Ativo'}
              </Text>
              <Switch
                value={modoCompacto}
                onValueChange={setModoCompacto}
                trackColor={{ false: '#383838', true: '#1DB954' }}
                thumbColor={modoCompacto ? '#FFFFFF' : '#B3B3B3'}
              />
            </View>

            {/* Cabeçalho do Feed */}
            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Minhas Avaliações ({avaliacoes.length})</Text>
              <TouchableOpacity style={styles.addReviewButtonSmall} onPress={handleAbrirCriar}>
                <Ionicons name="add" size={18} color="#000" />
                <Text style={styles.addReviewButtonSmallText}>Nova</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* Modal Criar / Editar Avaliação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Editar Avaliação' : 'Nova Avaliação'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#B3B3B3" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nome do Álbum *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Dark Side of the Moon"
              placeholderTextColor="#777"
              value={nomeAlbum}
              onChangeText={setNomeAlbum}
            />

            <Text style={styles.inputLabel}>Nome do Artista *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pink Floyd"
              placeholderTextColor="#777"
              value={nomeArtista}
              onChangeText={setNomeArtista}
            />

            <Text style={styles.inputLabel}>Sua Nota</Text>
            <View style={styles.starPickerContainer}>
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <TouchableOpacity
                  key={starIndex}
                  onPress={() => setNota(starIndex === nota ? 0 : starIndex)}
                >
                  <Ionicons
                    name={starIndex <= nota ? "star" : "star-outline"}
                    size={30}
                    color="#FFD700"
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Sua Review / Crítica *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escreva a sua opinião sobre o álbum..."
              placeholderTextColor="#777"
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Ano de Lançamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1973"
              placeholderTextColor="#777"
              value={dataLancamento}
              onChangeText={setDataLancamento}
            />

            <Text style={styles.inputLabel}>URL da Imagem da Capa</Text>
            <TextInput
              style={styles.input}
              placeholder="https://link-da-imagem.com/capa.jpg"
              placeholderTextColor="#777"
              value={urlImagem}
              onChangeText={setUrlImagem}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSalvarAvaliacao}>
                <Text style={styles.saveButtonText}>
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  userHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userGreeting: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  logoutButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderWidth: 1,
    borderColor: '#E74C3C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  logoutButtonText: { color: '#FF6B6B', fontSize: 12, fontWeight: 'bold' },
  topButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  topButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  listContent: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  headerComponent: { alignItems: 'center', width: '100%', maxWidth: 500 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 5,
    gap: 12,
  },
  logoImage: { width: 48, height: 48 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 16, color: '#B3B3B3', marginBottom: 16 },
  preferenceCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  preferenceTitle: { color: '#1DB954', fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  preferenceText: { color: '#B3B3B3', fontSize: 13, marginBottom: 12 },
  preferenceHighlight: { color: '#FFFFFF', fontWeight: 'bold' },
  inputPrefLabel: { color: '#B3B3B3', fontSize: 12, marginBottom: 6 },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  customTextInput: {
    flex: 1,
    backgroundColor: '#282828',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#383838',
  },
  saveCustomButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  saveCustomButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  preferenceButtonsContainer: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  savePrefButtonSecondary: { backgroundColor: 'rgba(255, 255, 255, 0.12)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14 },
  savePrefButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  actionRowContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadPrefButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    borderColor: '#1DB954',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  loadPrefButtonText: { color: '#1DB954', fontWeight: 'bold', fontSize: 12 },
  removePrefButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  removePrefButtonText: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 12 },
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeToggleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  feedHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  addReviewButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  addReviewButtonSmallText: { color: '#000000', fontWeight: 'bold', fontSize: 13, marginLeft: 4 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#B3B3B3',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  inputLabel: { color: '#B3B3B3', fontSize: 13, marginBottom: 4, marginTop: 8 },
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
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  starPickerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  starIcon: { marginRight: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 22, gap: 12 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, justifyContent: 'center' },
  cancelButtonText: { color: '#B3B3B3', fontWeight: '600' },
  saveButton: { backgroundColor: '#1DB954', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20 },
  saveButtonText: { color: '#000000', fontWeight: 'bold' },
});