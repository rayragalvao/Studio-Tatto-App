// ATENÇÃO: confirme na documentação dentro de app.nota2json.com:
// 1) a URL exata dos endpoints (a que está abaixo é uma suposição
//    baseada na descrição pública do produto: "endpoints separados
//    para nota de produto e serviço");
// 2) o formato exato do header de autenticação (Bearer token,
//    x-api-key, etc — a doc pública não especifica isso).
const NOTA2JSON_BASE_URL = 'https://api.nota2json.com';
const NOTA2JSON_API_KEY = 'SUA_CHAVE_AQUI'; // pegue em app.nota2json.com

/**
 * Envia uma imagem/PDF de nota fiscal para a API Nota2JSON e retorna o JSON estruturado.
 * @param {string} fileUri - uri local do arquivo (retornado pelo expo-image-picker)
 * @param {'nfe' | 'nfse'} tipo - 'nfe' para nota de produto/DANFE, 'nfse' para nota de serviço
 */
export async function lerNotaFiscal(fileUri, tipo = 'nfe') {
  const endpoint = tipo === 'nfse' ? `${NOTA2JSON_BASE_URL}/nfse` : `${NOTA2JSON_BASE_URL}/nfe`;

  const fileName = fileUri.split('/').pop();
  const extensao = fileName.split('.').pop().toLowerCase();
  const mimeType = extensao === 'pdf' ? 'application/pdf' : `image/${extensao}`;

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTA2JSON_API_KEY}`,
      // Content-Type multipart/form-data NÃO deve ser setado manualmente
      // no React Native — o fetch já define o boundary correto sozinho
      // quando o body é um FormData.
    },
    body: formData,
  });

  if (!response.ok) {
    const textoErro = await response.text().catch(() => '');
    throw new Error(`Erro ao processar a nota (status ${response.status}): ${textoErro}`);
  }

  return response.json();
}