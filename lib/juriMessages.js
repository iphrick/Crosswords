// lib/juriMessages.js

export const FAILURE_MESSAGES = [
  'IMPROCEDENTE POR UNANIMIDADE!',
  'INDEFERIDO!',
  'REPROVADO NOS AUTOS!',
  'ARQUIVADO POR FALTA DE ACERTOS!',
];

export const SUCCESS_MESSAGES = [
  'NEM CABE RECURSO!',
  'DECISÃO FAVORÁVEL!',
  'ACERTO IRREFUTÁVEL!',
  'DESEMPENHO MERITÓRIO!',
];

export const REPEATED_FAILURE_MSG = 'Volte para os estudos, doutor(a).';

export const SUBJECTS = [
  'Direito Constitucional',
  'Direito Penal',
  'Direito Civil',
  'Direito do Trabalho',
  'Direito Administrativo',
  'Direito Tributário',
  'Direito Previdenciário - Custeio',
  'Direito Previdenciário - Benefícios',
];

export const CHARACTERS = [
  { u: 'Lawyer',       l: 'Advogado' },
  { u: 'LawyerGirl',   l: 'Advogada' },
  { u: 'Judge',        l: 'Juiz' },
  { u: 'JudgeGirl',    l: 'Juíza' },
  { u: 'Suit',         l: 'Terno Preto' },
  { u: 'SuitGirl',     l: 'Terno Fem.' },
  { u: 'Business',     l: 'Executivo' },
  { u: 'BusinessWoman',l: 'Executiva' },
  { u: 'Steve',        l: 'Steve' },
  { u: 'Alex',         l: 'Alex' },
];

export const ADMIN_EMAIL   = 'pedrohenriqueinsec281@gmail.com';
export const ADMIN_PHONE   = '+5584991101624';

export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getAvatarUrl(username) {
  return `https://minotar.net/armor/body/${username || 'Lawyer'}/150.png`;
}

export function getAvatarHeadUrl(username) {
  return `https://minotar.net/helm/${username || 'Lawyer'}/32.png`;
}

export function rankingUpMsg(name) {
  return `Muito bem Dr(a) ${name}, o Senhor está LOGRANDO ÊXITO no ranking.`;
}

export function rankingOvertakenMsg(overtakerName) {
  return `O usuário ${overtakerName} PRETERIU você.`;
}
