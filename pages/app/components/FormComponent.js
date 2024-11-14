import React, { useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import styles from '../styles/Form.module.css';

export default function FormComponent({ formData, setFormData }) {
  const { selectedStates, selectedCities, selectedDistricts, selectedNeighborhoods } = formData;

  useEffect(() => {
    // 1. Carrega todos os estados
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => setFormData(prevData => ({
        ...prevData,
        states: response.data
          .map(state => ({ value: state.id, label: state.nome }))
          .sort((a, b) => a.label.localeCompare(b.label)) // Ordena os estados
      })))
      .catch(error => console.error("Erro ao carregar os estados:", error));
  }, [setFormData]);

  const handleStateChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prevData => ({ ...prevData, selectedStates: selectedOptions || [] }));

    selectedIds.forEach(stateId => {
      if (!formData.cities?.[stateId]) {
        // 2. Carrega os municípios (cidades) para cada estado selecionado
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
          .then(response => setFormData(prevData => ({
            ...prevData,
            cities: {
              ...prevData.cities,
              [stateId]: response.data
                .map(city => ({ value: city.id, label: city.nome }))
                .sort((a, b) => a.label.localeCompare(b.label)) // Ordena as cidades
            }
          })))
          .catch(error => console.error(`Erro ao carregar as cidades do estado ${stateId}:`, error));
      }
    });
  };

  const handleCityChange = (stateId, selectedOptions) => {
    setFormData(prevData => ({
      ...prevData,
      selectedCities: {
        ...prevData.selectedCities,
        [stateId]: selectedOptions || []
      },
      districts: prevData.districts || {}, // Inicializa districts se estiver undefined
    }));

    selectedOptions.forEach(city => {
      if (!(formData.districts && formData.districts[city.value])) {
        console.log(`Carregando distritos para a cidade: ${city.label}`);

        // 3. Carrega os distritos para cada município selecionado
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${city.value}/distritos`)
          .then(response => {
            setFormData(prevData => ({
              ...prevData,
              districts: {
                ...prevData.districts,
                [city.value]: response.data
                  .map(district => ({ value: district.id, label: district.nome }))
                  .sort((a, b) => a.label.localeCompare(b.label)) // Ordena os distritos
              }
            }));
          })
          .catch(error => console.error(`Erro ao carregar os distritos da cidade ${city.value}:`, error));
      }
    });
  };

  const handleDistrictChange = (cityId, selectedOptions) => {
    setFormData(prevData => ({
      ...prevData,
      selectedDistricts: {
        ...prevData.selectedDistricts,
        [cityId]: selectedOptions || []
      }
    }));

    selectedOptions.forEach(district => {
      if (!formData.neighborhoods?.[district.value]) {
        console.log(`Carregando bairros para o distrito: ${district.label}`);

        // 4. Carrega os subdistritos (bairros) para cada distrito selecionado
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/distritos/${district.value}/subdistritos`)
          .then(response => {
            console.log(`Dados dos bairros recebidos para o distrito ${district.label}:`, response.data); // Log dos dados recebidos
            setFormData(prevData => ({
              ...prevData,
              neighborhoods: {
                ...prevData.neighborhoods,
                [district.value]: response.data
                  .map(neighborhood => ({ value: neighborhood.id, label: neighborhood.nome }))
                  .sort((a, b) => a.label.localeCompare(b.label)) // Ordena os bairros
              }
            }));
          })
          .catch(error => console.error(`Erro ao carregar os bairros do distrito ${district.value}:`, error));
      }
    });
  };

  const handleNeighborhoodChange = (districtId, selectedOptions) => {
    setFormData(prevData => ({
      ...prevData,
      selectedNeighborhoods: {
        ...prevData.selectedNeighborhoods,
        [districtId]: selectedOptions || []
      }
    }));
  };

  return (
    <div>
      {/* Multi-select dropdown para seleção dos Estados */}
      <div className={styles.formGroup}>
        <label>Selecione os Estados de interesse:</label>
        <Select
          isMulti
          options={formData.states}
          value={selectedStates}
          onChange={handleStateChange}
          placeholder="Selecione os Estados"
          className={styles.selectDropdown}
        />
      </div>

      {/* Multi-select dropdown para seleção de Cidades para cada Estado selecionado */}
      {selectedStates.map(state => (
        <div key={state.value} className={styles.formGroup}>
          <label>Selecione as Cidades de {state.label}:</label>
          <Select
            isMulti
            options={formData.cities?.[state.value] || []}
            value={selectedCities[state.value] || []}
            onChange={(selectedOptions) => handleCityChange(state.value, selectedOptions)}
          />
        </div>
      ))}

      {/* Multi-select dropdown para seleção de Distritos para cada Cidade selecionada */}
      {Object.keys(selectedCities || {}).map(stateId => (
        (selectedCities[stateId] || []).map(city => (
          <div key={city.value} className={styles.formGroup}>
            <label>Selecione os Distritos de {city.label}:</label>
            <Select
              isMulti
              options={formData.districts?.[city.value] || []}
              value={selectedDistricts?.[city.value] || []}
              onChange={(selectedOptions) => handleDistrictChange(city.value, selectedOptions)}
            />
          </div>
        ))
      ))}

      {/* Multi-select dropdown para seleção de Bairros para cada Distrito selecionado */}
      {Object.keys(selectedDistricts || {}).map(cityId => (
        (selectedDistricts[cityId] || []).map(district => (
          <div key={district.value} className={styles.formGroup}>
            <label>Selecione os Bairros de {district.label}:</label>
            <Select
              isMulti
              options={formData.neighborhoods?.[district.value] || []}
              value={selectedNeighborhoods?.[district.value] || []}
              onChange={(selectedOptions) => handleNeighborhoodChange(district.value, selectedOptions)}
            />
          </div>
        ))
      ))}
    </div>
  );
}
