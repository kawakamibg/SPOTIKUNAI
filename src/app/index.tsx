import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  Image
} from 'react-native';

// Importações dos pacotes de interface
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';

// Interface para definir a estrutura de uma avaliação
interface Avaliacao {
  id: string;
  nomeAlbum: string;
  nomeArtista: string;
  dataLancamento: string;
  urlImagem: string;
  nota: number; // Nota de 0 a 5
}

export default function Home() {
  const router = useRouter();

  // Lista onde as avaliações ficam salvas na memória
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  // Estados para controlar o Modal e os dados dos campos
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeAlbum, setNomeAlbum] = useState('');
  const [nomeArtista, setNomeArtista] = useState('');
  const [dataLancamento, setDataLancamento] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  const [nota, setNota] = useState<number>(0);

  // Função para salvar a avaliação
  const handleSalvarAvaliacao = () => {
    if (!nomeAlbum.trim() || !nomeArtista.trim()) {
      Alert.alert("Atenção", "Por favor, preencha pelo menos o nome do álbum e do artista.");
      return;
    }

    const novaAvaliacao: Avaliacao = {
      id: Date.now().toString(),
      nomeAlbum: nomeAlbum.trim(),
      nomeArtista: nomeArtista.trim(),
      dataLancamento: dataLancamento.trim(),
      urlImagem: urlImagem.trim(),
      nota: nota,
    };

    // Adiciona a nova avaliação no topo da lista
    setAvaliacoes([novaAvaliacao, ...avaliacoes]);

    // Limpa os campos do formulário e fecha o modal
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
      {/* Botão sutil no canto superior direito */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.topButton} 
          onPress={() => router.push('/cadastro')}
          activeOpacity={0.7}
        >
          <Text style={styles.topButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Título principal com animação suave */}
        <Animatable.Text animation="fadeInDown" duration={1500} style={styles.title}>
          Spotikunai
        </Animatable.Text>

        <Text style={styles.subtitle}>Sua rede social de álbuns</Text>

        {/* --- SE NÃO HOUVER AVALIAÇÕES: Exibe estado inicial --- */}
        {avaliacoes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="disc-outline" size={64} color="#1DB954" style={styles.icon} />
            <Text style={styles.emptyTitle}>Nenhuma avaliação por aqui</Text>
            <Text style={styles.emptySubtitle}>
              Adicione o primeiro álbum e compartilhe a sua opinião!
            </Text>

            <TouchableOpacity 
              style={styles.addReviewButton} 
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.addReviewButtonText}>Adicionar Avaliação</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* --- SE HOUVER AVALIAÇÕES: Exibe a lista de cards estilo Letterboxd --- */
          <View style={styles.feedContainer}>
            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Minhas Avaliações ({avaliacoes.length})</Text>
              <TouchableOpacity 
                style={styles.addReviewButtonSmall} 
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#000" />
                <Text style={styles.addReviewButtonSmallText}>Nova</Text>
              </TouchableOpacity>
            </View>

            {/* Renderização de cada Card de Avaliação */}
            {avaliacoes.map((item) => (
              <View key={item.id} style={styles.cardLetterboxd}>
                {/* Capa do Álbum ou Placeholder */}
                {item.urlImagem ? (
                  <Image 
                    source={{ uri: item.urlImagem }} 
                    style={styles.albumCover}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.albumCover, styles.albumCoverPlaceholder]}>
                    <Ionicons name="disc" size={36} color="#1DB954" />
                  </View>
                )}

                {/* Informações do Álbum */}
                <View style={styles.cardInfo}>
                  <Text style={styles.albumTitle} numberOfLines={1}>
                    {item.nomeAlbum}
                  </Text>
                  <Text style={styles.artistName} numberOfLines={1}>
                    {item.nomeArtista}
                  </Text>
                  
                  {/* Estrelas da Nota */}
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <Ionicons
                        key={starIndex}
                        name={starIndex <= item.nota ? "star" : "star-outline"}
                        size={16}
                        color="#FFD700"
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>

                  {item.dataLancamento ? (
                    <Text style={styles.releaseDate}>
                      Lançamento: {item.dataLancamento}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* --- Mini Aba / Modal de Nova Avaliação --- */}
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
              <Text style={styles.modalTitle}>Nova Avaliação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#B3B3B3" />
              </TouchableOpacity>
            </View>

            {/* Campo: Nome do Álbum */}
            <Text style={styles.inputLabel}>Nome do Álbum *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Dark Side of the Moon"
              placeholderTextColor="#777"
              value={nomeAlbum}
              onChangeText={setNomeAlbum}
            />

            {/* Campo: Nome do Artista */}
            <Text style={styles.inputLabel}>Nome do Artista *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pink Floyd"
              placeholderTextColor="#777"
              value={nomeArtista}
              onChangeText={setNomeArtista}
            />

            {/* Campo: Avaliação de Estrelas (0 a 5) */}
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

            {/* Campo: Data de Lançamento */}
            <Text style={styles.inputLabel}>Data de Lançamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1973 ou 01/03/1973"
              placeholderTextColor="#777"
              value={dataLancamento}
              onChangeText={setDataLancamento}
            />

            {/* Campo: URL da Imagem do Álbum */}
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

            {/* Botões do Modal */}
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
  scroll: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 30,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 20,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    cursor: 'pointer',
  },
  addReviewButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
  },

  /* Feed e Cards estilo Letterboxd */
  feedContainer: {
    width: '100%',
    maxWidth: 500,
    marginTop: 10,
  },
  feedHeader: {
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
  cardLetterboxd: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 14,
  },
  albumCoverPlaceholder: {
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artistName: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  releaseDate: {
    color: '#B3B3B3',
    fontSize: 12,
  },

  /* Styles do Modal / Mini Aba */
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