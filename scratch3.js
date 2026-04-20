const { buildLayout } = require('./lib/crosswordEngine.js');

const data = {
  "crossword": [
    {
      "question": "Considerada asilo inviolável do indivíduo, sem entrada sem consentimento do morador",
      "answer": "CASA",
      "subject": "Direito Constitucional",
      "level": 1,
      "length": 4
    },
    {
      "question": "Garantia assegurada aos acusados em geral, com os meios e recursos a ela inerentes",
      "answer": "DEFESA",
      "subject": "Direito Constitucional",
      "level": 1,
      "length": 6
    }
  ]
};

const result = buildLayout(data.crossword);
console.log(JSON.stringify(result, null, 2));
