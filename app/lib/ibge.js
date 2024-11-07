// lib/ibge.js

// Função para buscar estados
export async function fetchEstados() {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    const data = await response.json();
    return data;
  }
  
  // Função para buscar cidades de um estado específico
  export async function fetchCidades(uf) {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    const data = await response.json();
    return data;
  }
  