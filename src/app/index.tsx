import React, { useState, useCallback } from 'react';
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
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import AlbumCard from '../components/AlbumCard';
import { Album } from '../data/albuns';
import { authService, User } from '../services/authService';
import { apiService } from '../services/apiService';
import { spotifyService, SpotifyAlbum } from '../services/spotifyService';
import {
  carregarAlbuns as carregarAlbunsSalvos,
  carregarIdsFavoritos,
  salvarIdsFavoritos,
} from '../services/albumStorage';

export default function Home() {
  const router = useRouter();

  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [genero, setGenero] = useState<string>('Nenhuma preferência salva');
  const [inputGeneroCustom, setInputGeneroCustom] = useState<string>('');
  const [avaliacoes, setAvaliacoes] = useState<Album[]>([]); 
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const [modoCompacto, setModoCompacto] = useState(false);

  // States do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [etapaModal, setEtapaModal] = useState<'busca' | 'formulario'>('busca');
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<SpotifyAlbum[]>([]);
  const [buscandoAPI, setBuscandoAPI] = useState(false);

  // Campos da Avaliação
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nomeAlbum, setNomeAlbum] = useState('');
  const [nomeArtista, setNomeArtista] = useState('');
  const [dataLancamento, setDataLancamento] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  const [nota, setNota] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');

  useFocusEffect(
    useCallback(() => {
      carregarUsuario();
      carregarGenero();
      carregarAlbuns();
      carregarFavoritos();
    }, [])
  );

  const carregarUsuario = async () => {
    const user = await authService.getUsuarioAtual();
    setUsuarioLogado(user);
  };

  async function carregarAlbuns() {
    try {
      setAvaliacoes(await carregarAlbunsSalvos());
    } catch (erro) {
      console.error('Erro ao carregar álbuns:', erro);
    }
  }

  async function carregarFavoritos() {
    try {
      setFavoritos(await carregarIdsFavoritos());
    } catch (erro) {
      console.error('Erro ao carregar favoritos:', erro);
    }
  }

  async function alternarFavorito(id: string) {
    const novosFavoritos = favoritos.includes(id)
      ? favoritos.filter((favoritoId) => favoritoId !== id)
      : [...favoritos, id];

    try {
      await salvarIdsFavoritos(novosFavoritos);
      setFavoritos(novosFavoritos);
    } catch (erro) {
      console.error('Erro ao atualizar favoritos:', erro);
      Alert.alert('Erro', 'Não foi possível salvar a alteração nos favoritos.');
    }
  }
  // Busca álbuns via Spotify (proxy pelo servidor Express local)
  const executarBuscaAPI = async () => {
    if (!termoBusca.trim()) {
      Alert.alert('Atenção', 'Digite o nome do álbum ou artista para pesquisar.');
      return;
    }

    setBuscandoAPI(true);
    setResultadosBusca([]);

    try {
      const resultados = await spotifyService.buscarAlbuns(termoBusca.trim(), 8);
      if (resultados.length > 0) {
        setResultadosBusca(resultados);
      } else {
        Alert.alert('Nenhum resultado', 'Nenhum álbum foi encontrado com esse termo.');
      }
    } catch (error) {
      console.error('Erro ao buscar no Spotify:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao serviço de busca. Verifique se a API local está rodando.');
    } finally {
      setBuscandoAPI(false);
    }
  };

  // Ao clicar em um álbum da lista encontrada (Spotify)
  const selecionarAlbumEAvancar = (item: SpotifyAlbum) => {
    setNomeAlbum(item.nomeAlbum || '');
    setNomeArtista(item.nomeArtista || '');
    setDataLancamento(item.ano || '2024');
    setUrlImagem(item.urlImagem || '');
    setNota(5);
    setReviewText('');
    setEtapaModal('formulario');
  };

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
    setTermoBusca('');
    setResultadosBusca([]);
    setNomeAlbum('');
    setNomeArtista('');
    setDataLancamento('');
    setUrlImagem('');
    setNota(5);
    setReviewText('');
    setEtapaModal('busca');
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
    setEtapaModal('formulario');
    setModalVisible(true);
  };

  const handleDeletar = (id: string, nome: string) => {
    const executarExclusao = async () => {
      await apiService.deletarAlbum(id);
      await carregarAlbuns();
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

    if (editingId) {
      await apiService.atualizarAlbum(editingId, {
        nomeAlbum: nomeAlbum.trim(),
        nomeArtista: nomeArtista.trim(),
        ano: dataLancamento.trim() || '2024',
        urlImagem: urlImagem.trim(),
        nota: nota,
        descricao: reviewText.trim() || 'Sem review escrita.',
      });
    } else {
      await apiService.criarAlbum({
        nomeAlbum: nomeAlbum.trim(),
        nomeArtista: nomeArtista.trim(),
        ano: dataLancamento.trim() || '2024',
        urlImagem: urlImagem.trim(),
        nota: nota,
        descricao: reviewText.trim() || 'Sem review escrita.',
      });
    }

    await carregarAlbuns();
    setModalVisible(false);
  };

  return (
    <LinearGradient colors={['#1DB954', '#191414']} style={styles.container}>
      
      {/* Cabeçalho */}
      <View style={styles.topHeader}>
        {usuarioLogado ? (
          <View style={styles.userHeaderInfo}>
            <TouchableOpacity 
              style={styles.profileAvatarButton} 
              onPress={() => router.push('/perfil' as any)}
              activeOpacity={0.8}
            >
              {usuarioLogado.fotoPerfil && usuarioLogado.fotoPerfil.trim() !== '' ? (
                <Image 
                  source={{ uri: usuarioLogado.fotoPerfil }} 
                  style={styles.headerAvatarImage} 
                />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Ionicons name="person" size={20} color="#1DB954" />
                </View>
              )}
              <Text style={styles.userGreeting}>{usuarioLogado.nome}</Text>
            </TouchableOpacity>

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
            onFavorite={() => alternarFavorito(item.id)}
            isFavorite={favoritos.includes(item.id)}
            onDelete={() => handleDeletar(item.id, item.nomeAlbum)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="disc-outline" size={48} color="#555" />
            <Text style={styles.emptyText}>Nenhum álbum avaliado ainda.</Text>
            <Text style={styles.emptySubtext}>Clique no botão "+ Nova" para buscar e avaliar um álbum!</Text>
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

            {/* Card das Práticas */}
            <View style={styles.preferenceCard}>
              <Text style={styles.preferenceTitle}>🎧 Práticas AsyncStorage</Text>
              <Text style={styles.preferenceText}>
                Gênero Salvo: <Text style={styles.preferenceHighlight}>{genero}</Text>
              </Text>
              
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

            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Minhas Avaliações ({avaliacoes.length})</Text>
              <View style={styles.feedActions}>
                <TouchableOpacity
                  style={styles.favoritesButton}
                  onPress={() => router.push('/favoritos' as any)}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir favoritos"
                >
                  <Ionicons name="heart" size={18} color="#FF6B6B" />
                  <Text style={styles.favoritesButtonText}>Favoritos ({favoritos.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addReviewButtonSmall} onPress={handleAbrirCriar}>
                  <Ionicons name="add" size={18} color="#000" />
                  <Text style={styles.addReviewButtonSmallText}>Nova</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />

      {/* MODAL ETAPA 1 (BUSCAR ÁLBUM) E ETAPA 2 (AVALIAR / EDITAR) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            {/* Cabeçalho do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId 
                  ? 'Editar Avaliação' 
                  : (etapaModal === 'busca' ? '1. Buscar Álbum na Web' : '2. Escrever Avaliação')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#B3B3B3" />
              </TouchableOpacity>
            </View>

            {/* ETAPA 1: BUSCAR E SELECIONAR ÁLBUM */}
            {etapaModal === 'busca' && !editingId && (
              <View>
                <Text style={styles.inputLabel}>Digite o nome do álbum ou artista:</Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Ex: Nirvana, Nevermind, Gorillaz..."
                    placeholderTextColor="#777"
                    value={termoBusca}
                    onChangeText={setTermoBusca}
                    onSubmitEditing={executarBuscaAPI}
                  />
                  <TouchableOpacity 
                    style={styles.searchSubmitButton} 
                    onPress={executarBuscaAPI}
                    disabled={buscandoAPI}
                  >
                    {buscandoAPI ? (
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <Ionicons name="search" size={20} color="#000" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Lista de Resultados de Busca */}
                <ScrollView style={styles.resultsScrollView} nestedScrollEnabled>
                  {resultadosBusca.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.resultCard}
                      onPress={() => selecionarAlbumEAvancar(item)}
                      activeOpacity={0.7}
                    >
                      {item.urlImagem ? (
                        <Image source={{ uri: item.urlImagem }} style={styles.resultImage} />
                      ) : (
                        <View style={styles.resultImagePlaceholder}>
                          <Ionicons name="disc" size={24} color="#555" />
                        </View>
                      )}
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle} numberOfLines={1}>{item.nomeAlbum}</Text>
                        <Text style={styles.resultArtist} numberOfLines={1}>{item.nomeArtista}</Text>
                        <Text style={styles.resultYear}>{item.ano}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#1DB954" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity 
                  style={styles.manualEntryButton}
                  onPress={() => {
                    setNomeAlbum('');
                    setNomeArtista('');
                    setDataLancamento('');
                    setUrlImagem('');
                    setNota(5);
                    setReviewText('');
                    setEtapaModal('formulario');
                  }}
                >
                  <Text style={styles.manualEntryText}>ou preencher dados manualmente ➔</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ETAPA 2: FORMULÁRIO DE AVALIAÇÃO (REVIEW + ESTRELAS) */}
            {(etapaModal === 'formulario' || editingId) && (
              <ScrollView style={{ maxHeight: 420 }} nestedScrollEnabled>
                
                {/* Resumo do Álbum Selecionado */}
                {urlImagem ? (
                  <View style={styles.selectedAlbumHeader}>
                    <Image source={{ uri: urlImagem }} style={styles.selectedCover} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectedTitle}>{nomeAlbum}</Text>
                      <Text style={styles.selectedArtist}>{nomeArtista} • {dataLancamento}</Text>
                      {!editingId && (
                        <TouchableOpacity onPress={() => setEtapaModal('busca')}>
                          <Text style={styles.changeAlbumText}>Trocar álbum</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : null}

                <Text style={styles.inputLabel}>Sua Nota *</Text>
                <View style={styles.starPickerContainer}>
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <TouchableOpacity
                      key={starIndex}
                      onPress={() => setNota(starIndex)}
                    >
                      <Ionicons
                        name={starIndex <= nota ? "star" : "star-outline"}
                        size={32}
                        color="#FFD700"
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Sua Review / Crítica *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="O que achou das faixas, produção e conceito do álbum?"
                  placeholderTextColor="#777"
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Nome do Álbum</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Nevermind"
                  placeholderTextColor="#777"
                  value={nomeAlbum}
                  onChangeText={setNomeAlbum}
                />

                <Text style={styles.inputLabel}>Nome do Artista</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Nirvana"
                  placeholderTextColor="#777"
                  value={nomeArtista}
                  onChangeText={setNomeArtista}
                />

                <Text style={styles.inputLabel}>Ano de Lançamento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1991"
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
                      {editingId ? 'Atualizar' : 'Salvar Avaliação'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

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
  userHeaderInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  profileAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1DB954',
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1DB954',
  },
  userGreeting: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
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
  preferenceText: { color: '#FFFFFF', fontSize: 13, marginBottom: 12 },
  preferenceHighlight: { color: '#1DB954', fontWeight: 'bold' },
  inputPrefLabel: { color: '#FFFFFF', fontSize: 12, marginBottom: 6 },
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
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181818',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  favoritesButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
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
    maxWidth: 480,
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#282828',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#383838',
  },
  searchSubmitButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  resultsScrollView: {
    maxHeight: 280,
    marginVertical: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#383838',
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  resultImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultArtist: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 2,
  },
  resultYear: {
    color: '#1DB954',
    fontSize: 11,
    marginTop: 2,
  },
  manualEntryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  manualEntryText: {
    color: '#1DB954',
    fontSize: 13,
    fontWeight: 'bold',
  },
  selectedAlbumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  selectedCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  selectedTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectedArtist: {
    color: '#B3B3B3',
    fontSize: 13,
    marginTop: 2,
  },
  changeAlbumText: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },
  inputLabel: { color: '#FFFFFF', fontSize: 13, marginBottom: 4, marginTop: 8, fontWeight: '600' },
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
    height: 80,
    textAlignVertical: 'top',
  },
  starPickerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, gap: 4 },
  starIcon: { marginRight: 2 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18, gap: 12, marginBottom: 10 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, justifyContent: 'center' },
  cancelButtonText: { color: '#B3B3B3', fontWeight: '600' },
  saveButton: { backgroundColor: '#1DB954', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20 },
  saveButtonText: { color: '#000000', fontWeight: 'bold' },
});