import React, { useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import styles from '../styles/Form.module.css';

export default function FormComponent({ formData, setFormData }) {
  const { selectedStates, selectedCities, selectedNeighborhoods } = formData;

  useEffect(() => {
    // Verifica se o código está sendo executado no lado do cliente antes de fazer a requisição
    if (typeof window !== "undefined") {
      axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response => setFormData(prevData => ({
          ...prevData,
          states: response.data
            .map(state => ({ value: state.id, label: state.nome }))
            .sort((a, b) => a.label.localeCompare(b.label)) // Ordena os estados
        })))
        .catch(error => console.error("Erro ao carregar os estados:", error));
    }
  }, [setFormData]);

  const handleStateChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prevData => ({ ...prevData, selectedStates: selectedOptions || [] }));

    selectedIds.forEach(stateId => {
      if (!formData.cities[stateId]) {
        if (typeof window !== "undefined") {
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
        if (typeof window !== "undefined") {
          axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${city.value}/distritos`)
            .then(response => {
              setFormData(prevData => ({
                ...prevData,
                neighborhoods: {
                  ...prevData.neighborhoods,
                  [city.value]: response.data
                    .map(neighborhood => ({ value: neighborhood.id, label: neighborhood.nome }))
                    .sort((a, b) => a.label.localeCompare(b.label)) // Ordena os bairros
                }
              }));
            })
            .catch(error => console.error(`Erro ao carregar os bairros da cidade ${city.value}:`, error));
        }
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
    </div>
  );
}
