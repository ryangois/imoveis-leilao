import React, { useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import styles from './Form.module.css';

export default function FormComponent({ formData, setFormData }) {
  const { selectedStates, selectedCities, selectedNeighborhoods } = formData;

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => setFormData(prevData => ({
        ...prevData,
        states: response.data.map(state => ({ value: state.id, label: state.nome }))
      })))
      .catch(error => console.error("Erro ao carregar os estados:", error));
  }, [setFormData]);

  const handleStateChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prevData => ({ ...prevData, selectedStates: selectedOptions || [] }));

    selectedIds.forEach(stateId => {
      if (!formData.cities[stateId]) {
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
          .then(response => setFormData(prevData => ({
            ...prevData,
            cities: {
              ...prevData.cities,
              [stateId]: response.data.map(city => ({ value: city.id, label: city.nome }))
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
      }
    }));

    selectedOptions.forEach(city => {
      if (!formData.neighborhoods[city.value]) {
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${city.value}/distritos`)
          .then(response => setFormData(prevData => ({
            ...prevData,
            neighborhoods: {
              ...prevData.neighborhoods,
              [city.value]: response.data.map(neighborhood => ({ value: neighborhood.id, label: neighborhood.nome }))
            }
          })))
          .catch(error => console.error(`Erro ao carregar os bairros da cidade ${city.value}:`, error));
      }
    });
  };

  const handleNeighborhoodChange = (cityId, selectedOptions) => {
    setFormData(prevData => ({
      ...prevData,
      selectedNeighborhoods: {
        ...prevData.selectedNeighborhoods,
        [cityId]: selectedOptions || []
      }
    }));
  };

  return (
    <div>
      {/* Multi-select dropdown para seleção dos Estados */}
      <div className={styles.formGroup}>
        <label>3 - Selecione os Estados de interesse:</label>
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
            placeholder="Selecione as Cidades"
            className={styles.selectDropdown}
          />
        </div>
      ))}

      {/* Multi-select dropdown para seleção de Bairros para cada Cidade selecionada */}
      {Object.keys(selectedCities).map(stateId =>
        selectedCities[stateId]?.map(city => (
          formData.neighborhoods?.[city.value] ? (
            <div key={city.value} className={styles.formGroup}>
              <label>Selecione os Bairros de {city.label}:</label>
              <Select
                isMulti
                options={formData.neighborhoods[city.value] || []}
                value={selectedNeighborhoods[city.value] || []}
                onChange={(selectedOptions) => handleNeighborhoodChange(city.value, selectedOptions)}
                placeholder="Selecione os Bairros"
                className={styles.selectDropdown}
              />
            </div>
          ) : null
        ))
      )}
    </div>
  );
}
