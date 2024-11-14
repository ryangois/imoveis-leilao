import React, { useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import styles from '../styles/Form.module.css';

export default function FormComponent({ formData, setFormData }) {
  // Ensure formData is defined and provide default values to prevent destructuring errors
  const {
    selectedStates = [],
    selectedCities = {},
    selectedDistricts = {},
    selectedNeighborhoods = {},
    states = [], // Default to empty array if states is not yet populated
    cities = {},
    neighborhoods = {}
  } = formData || {}; // Default formData to empty if undefined

  useEffect(() => {
    // 1. Load all states
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => setFormData(prevData => ({
        ...prevData,
        states: response.data
          .map(state => ({ value: state.id, label: state.nome }))
          .sort((a, b) => a.label.localeCompare(b.label)) // Sort states alphabetically
      })))
      .catch(error => console.error("Error loading states:", error));
  }, [setFormData]);

  const handleStateChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prevData => ({ ...prevData, selectedStates: selectedOptions || [] }));

    selectedIds.forEach(stateId => {
      if (!cities[stateId]) {
        // 2. Load cities for each selected state
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
          .then(response => setFormData(prevData => ({
            ...prevData,
            cities: {
              ...prevData.cities,
              [stateId]: response.data
                .map(city => ({ value: city.id, label: city.nome }))
                .sort((a, b) => a.label.localeCompare(b.label)) // Sort cities alphabetically
            }
          })))
          .catch(error => console.error(`Error loading cities for state ${stateId}:`, error));
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
      districts: prevData.districts || {}, // Initialize districts if undefined
    }));

    selectedOptions.forEach(city => {
      if (!(formData.districts && formData.districts[city.value])) {
        console.log(`Loading districts for city: ${city.label}`);

        // 3. Load districts for each selected city
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${city.value}/distritos`)
          .then(response => {
            setFormData(prevData => ({
              ...prevData,
              districts: {
                ...prevData.districts,
                [city.value]: response.data
                  .map(district => ({ value: district.id, label: district.nome }))
                  .sort((a, b) => a.label.localeCompare(b.label)) // Sort districts alphabetically
              }
            }));
          })
          .catch(error => console.error(`Error loading districts for city ${city.value}:`, error));
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
      if (!neighborhoods[district.value]) {
        console.log(`Loading neighborhoods for district: ${district.label}`);

        // 4. Load neighborhoods for each selected district
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/distritos/${district.value}/subdistritos`)
          .then(response => {
            console.log(`Neighborhood data received for district ${district.label}:`, response.data); // Log neighborhood data
            setFormData(prevData => ({
              ...prevData,
              neighborhoods: {
                ...prevData.neighborhoods,
                [district.value]: response.data
                  .map(neighborhood => ({ value: neighborhood.id, label: neighborhood.nome }))
                  .sort((a, b) => a.label.localeCompare(b.label)) // Sort neighborhoods alphabetically
              }
            }));
          })
          .catch(error => console.error(`Error loading neighborhoods for district ${district.value}:`, error));
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
      {/* Multi-select dropdown for selecting states */}
      <div className={styles.formGroup}>
        <label>Selecione os Estados de interesse:</label>
        <Select
          isMulti
          options={states}
          value={selectedStates}
          onChange={handleStateChange}
          placeholder="Selecione os Estados"
          className={styles.selectDropdown}
        />
      </div>

      {/* Multi-select dropdown for selecting cities for each selected state */}
      {selectedStates.map(state => (
        <div key={state.value} className={styles.formGroup}>
          <label>Selecione as Cidades de {state.label}:</label>
          <Select
            isMulti
            options={cities?.[state.value] || []}
            value={selectedCities[state.value] || []}
            onChange={(selectedOptions) => handleCityChange(state.value, selectedOptions)}
          />
        </div>
      ))}

      {/* Multi-select dropdown for selecting districts for each selected city */}
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

      {/* Multi-select dropdown for selecting neighborhoods for each selected district */}
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
