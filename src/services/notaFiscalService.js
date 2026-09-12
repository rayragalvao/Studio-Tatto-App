import * as ImageManipulator from 'expo-image-manipulator';
import { extrairItensNota } from './notaFiscalParser';

const OCR_URL = 'https://api.ocr.space/parse/image';
const LIMITE_BYTES = 950000; // Margem para o limite de 1 MB do plano gratuito.

async function prepararImagem(asset) {
  const maiorLado = Math.max(asset.width || 0, asset.height || 0);
  if (!asset.uri || !asset.width || !asset.height) {
    throw new Error('Não foi possível ler as dimensões da imagem. Escolha outra foto.');
  }

  for (const [ladoMaximo, compressao] of [[1800, 0.75], [1500, 0.6], [1200, 0.45]]) {
    const escala = Math.min(1, ladoMaximo / maiorLado);
    const manipulador = ImageManipulator.ImageManipulator.manipulate(asset.uri);
    manipulador.resize({
      width: Math.max(1, Math.round(asset.width * escala)),
      height: Math.max(1, Math.round(asset.height * escala)),
    });
    const imagem = await manipulador.renderAsync();
    const resultado = await imagem.saveAsync({
      format: ImageManipulator.SaveFormat.JPEG,
      compress: compressao,
      base64: true,
    });
    if (resultado.base64 && Math.ceil(resultado.base64.length * 0.75) <= LIMITE_BYTES) {
      return `data:image/jpeg;base64,${resultado.base64}`;
    }
  }

  throw new Error('A imagem excede 1 MB mesmo após a redução. Fotografe apenas a nota, com boa luz.');
}

export async function lerNotaFiscal(asset, chaveApi) {
  const chave = chaveApi?.trim();
  if (!chave) throw new Error('Informe sua chave gratuita da OCR.space.');

  const base64Image = await prepararImagem(asset);
  const body = new FormData();
  body.append('base64Image', base64Image);
  body.append('language', 'por');
  body.append('isTable', 'true');
  body.append('detectOrientation', 'true');
  body.append('scale', 'true');
  body.append('OCREngine', '2');

  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), 45000);
  try {
    const resposta = await fetch(OCR_URL, {
      method: 'POST',
      headers: { apikey: chave },
      body,
      signal: controlador.signal,
    });
    if (!resposta.ok) {
      throw new Error(`A OCR.space recusou a leitura (HTTP ${resposta.status}). Confira a chave e o limite gratuito.`);
    }
    const dados = await resposta.json();
    if (dados.IsErroredOnProcessing || dados.OCRExitCode !== 1) {
      const mensagem = Array.isArray(dados.ErrorMessage)
        ? dados.ErrorMessage.join(' ')
        : dados.ErrorMessage || dados.ErrorDetails;
      throw new Error(mensagem || 'A OCR.space não conseguiu processar a imagem.');
    }
    const texto = (dados.ParsedResults || []).map((pagina) => pagina.ParsedText || '').join('\n').trim();
    if (!texto) throw new Error('Nenhum texto foi encontrado. Tente uma foto mais nítida.');
    return { texto, itens: extrairItensNota(texto) };
  } catch (erro) {
    if (erro.name === 'AbortError') throw new Error('A leitura demorou demais. Tente novamente.');
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}
