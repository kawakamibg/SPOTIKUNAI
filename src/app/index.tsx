import React, { useState } from 'react';
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
  Image
} from 'react-native';

// Importações do Expo Router
import { Link, useRouter } from 'expo-router';

// Componentes e pacotes visuais
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AlbumCard from '../components/AlbumCard';

// Importa a lista inicial e a interface do ficheiro compartilhado de dados
import { ALBUNS_INICIAIS, Album } from '../data/albuns';

export default function Home() {
  // Hook do Expo Router para navegação programática
  const router = useRouter();

  // State principal da lista de álbuns
  const [avaliacoes, setAvaliacoes] = useState<Album[]>(ALBUNS_INICIAIS);

  // State de controlo de exibição (Modo Compacto)
  const [modoCompacto, setModoCompacto] = useState(false);

  // States do Modal de Cadastro de nova avaliação
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeAlbum, setNomeAlbum] = useState('');
  const [nomeArtista, setNomeArtista] = useState('');
  const [dataLancamento, setDataLancamento] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  const [nota, setNota] = useState<number>(0);

  // Função para abrir a tela de detalhes programaticamente passando o ID dinâmico
  function handleAbrirDetalhes(id: string) {
    console.log(`[Navegação Programática] Transição disparada via toque no card ID: ${id}`);
    router.push(`/detalhes/${id}` as any);
  }

  // Função para salvar uma nova avaliação na lista local
  const handleSalvarAvaliacao = () => {
    if (!nomeAlbum.trim() || !nomeArtista.trim()) {
      Alert.alert("Atenção", "Por favor, preencha pelo menos o nome do álbum e do artista.");
      return;
    }

    const novaAvaliacao: Album = {
      id: Date.now().toString(),
      nomeAlbum: nomeAlbum.trim(),
      nomeArtista: nomeArtista.trim(),
      dataLancamento: dataLancamento.trim(),
      urlImagem: urlImagem.trim(),
      nota: nota,
      genero: 'Gênero não informado',
      descricao: 'Avaliação adicionada recentemente pelo usuário.'
    };

    setAvaliacoes([novaAvaliacao, ...avaliacoes]);

    // Limpar os campos do formulário
    setNomeAlbum('');
    setNomeArtista('');
    setDataLancamento('');
    setUrlImagem('');
    setNota(0);
    setModalVisible(false);
  };

  return (
    <LinearGradient
      colors={['#1DB954', '#191414']}
      style={styles.container}
    >
      {/* Botão de navegação estática no topo */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.topButton} 
          onPress={() => router.push('/cadastro' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.topButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      {/* FlatList principal renderizando os itens da lista com AlbumCard */}
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
            onPress={() => handleAbrirDetalhes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            
            {/* TÍTULO E LOGO COM ANIMAÇÃO */}
            <Animatable.View 
              animation="fadeInDown" 
              duration={1500} 
              style={styles.titleContainer}
            >
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
              <Text style={styles.title}>Spotikunai</Text>
            </Animatable.View>

            <Text style={styles.subtitle}>Sua rede social de álbuns</Text>

            {/* Exemplo de Link Declarativo */}
            <View style={styles.featuredContainer}>
              <Text style={styles.featuredLabel}>Álbum em Destaque (Link Declarativo):</Text>
              <Link href={"/detalhes/1" as any} style={styles.featuredLink}>
                <Text style={styles.featuredLinkText}>⭐ Ver Destaque: The Dark Side of the Moon</Text>
              </Link>
            </View>

            {/* Switch para Modo Compacto */}
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
              <Text style={styles.feedTitle}>Álbuns Avaliados ({avaliacoes.length})</Text>
              <TouchableOpacity 
                style={styles.addReviewButtonSmall} 
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#000" />
                <Text style={styles.addReviewButtonSmallText}>Nova</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* Modal para Adicionar Nova Avaliação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Avaliação</Text>
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
                  activeOpacity={0.7}
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

            <Text style={styles.inputLabel}>Data de Lançamento</Text>
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
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSalvarAvaliacao}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  topButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    cursor: 'pointer',
  },
  topButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerComponent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 5,
    gap: 12,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 20,
  },
  featuredContainer: {
    width: '100%',
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    borderColor: '#1DB954',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  featuredLabel: {
    color: '#B3B3B3',
    fontSize: 12,
    marginBottom: 4,
  },
  featuredLink: {
    marginTop: 2,
  },
  featuredLinkText: {
    color: '#1DB954',
    fontWeight: 'bold',
    fontSize: 14,
  },
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
  modeToggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  feedHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addReviewButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    cursor: 'pointer',
  },
  addReviewButtonSmallText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputLabel: {
    color: '#B3B3B3',
    fontSize: 13,
    marginBottom: 4,
    marginTop: 8,
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
  starPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  starIcon: {
    marginRight: 6,
    cursor: 'pointer',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 22,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: 'center',
    cursor: 'pointer',
  },
  cancelButtonText: {
    color: '#B3B3B3',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    cursor: 'pointer',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});