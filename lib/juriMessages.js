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



export const ADMIN_EMAIL   = 'pedrohenriqueinsec281@gmail.com';
export const ADMIN_PHONE   = '+5584991101624';

export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}



export function rankingUpMsg(name) {
  return `Muito bem Dr(a) ${name}, o Senhor está LOGRANDO ÊXITO no ranking.`;
}

export function rankingOvertakenMsg(overtakerName) {
  return `O usuário ${overtakerName} PRETERIU você.`;
}
