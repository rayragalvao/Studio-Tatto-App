import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { lerNotaFiscal } from '../services/notaFiscalService';
import { styles } from './EscanearNotaModal.styles';

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Extract' },
  { id: 3, label: 'Transform' },
  { id: 4, label: 'Load' },
];

export default function EscanearNotaModal({ visible, onClose, onSuccess }) {
  const [imageUri, setImageUri] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetState = () => {
    setImageUri(null);
    setCurrentStep(1);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleTirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      setError('Permissão de câmera negada.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!resultado.canceled) {
      setImageUri(resultado.assets[0].uri);
      setError(null);
    }
  };

  const handleEscolherDaGaleria = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      setError('Permissão de galeria negada.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!resultado.canceled) {
      setImageUri(resultado.assets[0].uri);
      setError(null);
    }
  };

  const handleIniciarLeitura = async () => {
    if (!imageUri) {
      setError('Tire uma foto ou escolha um arquivo da nota primeiro.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setCurrentStep(2);

      const dadosExtraidos = await lerNotaFiscal(imageUri, 'nfe');

      setCurrentStep(3);
      setCurrentStep(4);
      onSuccess?.(dadosExtraidos);
      handleClose();
    } catch (err) {
      setError(err.message || 'Erro ao processar a nota fiscal.');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <Camera size={18} color={'#00D3F2'} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Escanear Nota Fiscal</Text>
                <Text style={styles.headerSubtitle}>IA → EXTRACT → TRANSFORM → LOAD</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, currentStep >= step.id && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, currentStep >= step.id && styles.stepNumberActive]}>
                      {step.id}
                    </Text>
                  </View>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={styles.stepLine} />}
              </React.Fragment>
            ))}
          </View>

          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handleTirarFoto}
            onLongPress={handleEscolherDaGaleria}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <>
                <Camera size={28} color={colors.textMuted} />
                <Text style={styles.uploadTitle}>Foto ou upload da nota fiscal</Text>
                <Text style={styles.uploadSubtitle}>A IA fará o OCR e passará ao pipeline ETL</Text>
                <Text style={styles.uploadHint}>Toque para tirar foto · segure para escolher da galeria</Text>
              </>
            )}
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.startButton, loading && styles.startButtonDisabled]}
            onPress={handleIniciarLeitura}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Camera size={16} color={'#00D3F2'} />
                <Text style={styles.startButtonText}>Iniciar leitura da nota</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}