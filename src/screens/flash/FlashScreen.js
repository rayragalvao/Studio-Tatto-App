import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FlashCard from '../../components/FlashCard';
import FlashDetailModal from '../../components/FlashDetailModal';
import AddFlashModal from '../../components/AddFlashModal';
import { apiRequest, API_URL } from '../../services/api';
import { colors } from '../../theme/colors';
import { styles } from './FlashScreen.styles';

function formatarFlash(flash) {
  const imagemUrl = flash.imagemUrl || '';
  const uri = imagemUrl.startsWith('http')
    ? imagemUrl
    : `${API_URL}${imagemUrl.startsWith('/') ? '' : '/'}${imagemUrl}`;

  return {
    ...flash,
    codigo: `F-${flash.id}`,
    detalhe: flash.estilo,
    preco: String(flash.preco ?? ''),
    aplicado: flash.aplicado === true,
    imagem: imagemUrl ? { uri } : undefined,
  };
}

export default function FlashScreen() {
  const [flashs, setFlashs] = useState([]);
  const [flashSelecionado, setFlashSelecionado] = useState(null);
  const [flashEmEdicao, setFlashEmEdicao] = useState(null);
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [erroModal, setErroModal] = useState('');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const bloqueio = useRef(false);
  const sequencia = useRef(0);

  const carregarFlashs = useCallback(async () => {
    const numero = ++sequencia.current;
    setCarregando(true);
    setErro('');
    try {
      const dados = await apiRequest('/flash-tattoos');
      if (numero !== sequencia.current) return;
      if (dados && !Array.isArray(dados)) {
        throw new Error('Resposta inesperada na listagem de flashes.');
      }
      setFlashs((dados || []).map(formatarFlash).sort((a, b) => b.id - a.id));
    } catch (e) {
      if (numero === sequencia.current) {
        setErro(e.message || 'Não foi possível carregar os flashes.');
      }
    } finally {
      if (numero === sequencia.current) setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregarFlashs();
    return () => { sequencia.current += 1; };
  }, [carregarFlashs]));

  const atualizarLista = flash => {
    sequencia.current += 1;
    setCarregando(false);
    setFlashs(atuais => [
      flash,
      ...atuais.filter(item => item.id !== flash.id),
    ].sort((a, b) => b.id - a.id));
  };

  const abrirDetalhes = flash => {
    if (bloqueio.current) return;
    setErroModal('');
    setConfirmandoExclusao(false);
    setFlashSelecionado(flash);
  };

  const handleEditar = flash => {
    if (bloqueio.current) return;
    setFlashSelecionado(null);
    setFlashEmEdicao(flash);
    setErroModal('');
  };

  const handleSalvarFlash = async flashSalvo => {
    if (bloqueio.current) return false;
    bloqueio.current = true;
    setSalvando(true);
    setErroModal('');

    try {
      const formData = new FormData();
      formData.append('nome', flashSalvo.nome);
      formData.append('estilo', flashSalvo.estilo);
      formData.append('preco', flashSalvo.preco.replace(',', '.'));
      formData.append('descricao', flashSalvo.descricao || '');

      const fotoAlterada = flashSalvo.imagemUri
        && (!flashEmEdicao
          || flashSalvo.imagemUri !== flashEmEdicao.imagem?.uri);

      if (fotoAlterada) {
        const uri = flashSalvo.imagemUri;
        const extensao = uri.split('?')[0].split('.').pop()?.toLowerCase();
        const tipo = extensao === 'png' ? 'image/png'
          : extensao === 'webp' ? 'image/webp' : 'image/jpeg';
        const sufixo = tipo === 'image/png' ? 'png'
          : tipo === 'image/webp' ? 'webp' : 'jpg';

        formData.append('foto', {
          uri,
          name: `flash.${sufixo}`,
          type: tipo,
        });
      }

      const id = flashEmEdicao?.id;
      const resposta = await apiRequest(id ? `/flash-tattoos/${id}` : '/flash-tattoos', {
        method: id ? 'PUT' : 'POST',
        body: formData,
      });

      const formatado = formatarFlash(resposta);
      if (fotoAlterada && formatado.imagem) {
        formatado.imagem = {
          uri: `${formatado.imagem.uri}?v=${Date.now()}`,
        };
      }

      atualizarLista(formatado);
      setModalAdicionarVisivel(false);
      setFlashEmEdicao(null);
      return true;
    } catch (e) {
      setErroModal(e.message || 'Não foi possível salvar o flash.');
      return false;
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  };

  const handleAlternarAplicado = async flash => {
    if (bloqueio.current) return;
    bloqueio.current = true;
    setSalvando(true);
    setErroModal('');

    try {
      const resposta = await apiRequest(`/flash-tattoos/${flash.id}/status`, {
        method: 'PATCH',
        body: { aplicado: !flash.aplicado },
      });
      const atualizado = formatarFlash(resposta);
      atualizarLista(atualizado);
      setFlashSelecionado(atualizado);
    } catch (e) {
      setErroModal(e.message || 'Não foi possível alterar o status.');
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  };

  const handleExcluir = async flash => {
    if (bloqueio.current) return;
    bloqueio.current = true;
    setSalvando(true);
    setErroModal('');

    try {
      await apiRequest(`/flash-tattoos/${flash.id}`, { method: 'DELETE' });
      sequencia.current += 1;
      setCarregando(false);
      setFlashs(atuais => atuais.filter(item => item.id !== flash.id));
      setFlashSelecionado(null);
      setConfirmandoExclusao(false);
    } catch (e) {
      setErroModal(e.message || 'Não foi possível excluir o flash.');
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  };

  const fecharDetalhes = () => {
    if (bloqueio.current) return;
    setFlashSelecionado(null);
    setErroModal('');
    setConfirmandoExclusao(false);
  };

  const fecharFormulario = () => {
    if (bloqueio.current) return;
    setModalAdicionarVisivel(false);
    setFlashEmEdicao(null);
    setErroModal('');
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.flashScrollContent}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregarFlashs} />}>
        <View style={styles.flashHeader}>
          <Text style={styles.greeting}>Flash Tattoos</Text>
          <Text style={styles.date}>Catálogo de designs prontos</Text>
        </View>

        {erro ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.danger }}>{erro}</Text>
            <TouchableOpacity onPress={carregarFlashs}>
              <Text style={{ color: colors.info, marginTop: 8 }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {carregando && !flashs.length && <ActivityIndicator color={colors.info} />}

        <View style={styles.flashGrid}>
          <TouchableOpacity style={styles.flashCardAdd} disabled={salvando}
            onPress={() => {
              setErroModal('');
              setModalAdicionarVisivel(true);
            }}
            activeOpacity={0.8} accessibilityRole="button"
            accessibilityLabel="Adicionar flash">
            <Ionicons name="add" size={28} color={colors.textMuted} />
            <Text style={styles.flashCardAddText}>Adicionar flash</Text>
          </TouchableOpacity>

          {flashs.map(flash => (
            <FlashCard key={flash.id} {...flash}
              onPress={() => abrirDetalhes(flash)} />
          ))}
        </View>
      </ScrollView>

      <FlashDetailModal flash={flashSelecionado} visible={!!flashSelecionado}
        onClose={fecharDetalhes} onEdit={handleEditar}
        onToggleAplicado={handleAlternarAplicado}
        onDelete={handleExcluir} salvando={salvando}
        erro={erroModal} confirmandoExclusao={confirmandoExclusao}
        onPedirExclusao={() => {
          setErroModal('');
          setConfirmandoExclusao(true);
        }}
        onCancelarExclusao={() => setConfirmandoExclusao(false)} />

      <AddFlashModal visible={modalAdicionarVisivel || !!flashEmEdicao}
        onClose={fecharFormulario} onSave={handleSalvarFlash}
        flashParaEditar={flashEmEdicao} salvando={salvando} erro={erroModal} />
    </View>
  );
}