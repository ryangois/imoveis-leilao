import React, { useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import styles from '../styles/Form.module.css';

export default function FormComponent({ formData, setFormData }) {
  const {
    selectedStates = [],
    selectedCities = {},
    selectedDistricts = {},
    selectedNeighborhoods = {},
    states = [],
    cities = {},
    districts = {},
    neighborhoods = {},
  } = formData || {}; // Default formData to empty if undefined

  // Fetch states once on component mount
  useEffect(() => {
    axios
      .get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then((response) =>
        setFormData((prevData) => ({
          ...prevData,
          states: response.data
            .map((state) => ({ value: state.id, label: state.nome }))
            .sort((a, b) => a.label.localeCompare(b.label)), // Sort states alphabetically
        }))
      )
      .catch((error) => console.error('Error loading states:', error));
  }, [setFormData]);

  const handleStateChange = useCallback(
    (selectedOptions) => {
      const selectedIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
      const removedStateIds = selectedStates
        .filter((state) => !selectedIds.includes(state.value))
        .map((state) => state.value);

      setFormData((prevData) => {
        const updatedCities = { ...prevData.cities };
        const updatedDistricts = { ...prevData.districts };
        const updatedNeighborhoods = { ...prevData.neighborhoods };

        // Limpar cidades, distritos e bairros para estados desmarcados
        removedStateIds.forEach((stateId) => {
          if (updatedCities[stateId]) {
            updatedCities[stateId].forEach((city) => {
              // Remover distritos da cidade
              if (updatedDistricts[city.value]) {
                updatedDistricts[city.value].forEach((district) => {
                  delete updatedNeighborhoods[district.value]; // Remover bairros do distrito
                });
                delete updatedDistricts[city.value]; // Remover distritos
              }
            });
            delete updatedCities[stateId]; // Remover cidades
          }
        });

        return {
          ...prevData,
          selectedStates: selectedOptions || [],
          cities: updatedCities,
          districts: updatedDistricts,
          neighborhoods: updatedNeighborhoods,
        };
      });


      // Carregar cidades para estados recém-selecionados
      selectedIds.forEach((stateId) => {
        if (!cities[stateId]) {
          axios
            .get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
            .then((response) =>
              setFormData((prevData) => ({
                ...prevData,
                cities: {
                  ...prevData.cities,
                  [stateId]: response.data
                    .map((city) => ({ value: city.id, label: city.nome }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
                },
              }))
            )
            .catch((error) => console.error(`Error loading cities for state ${stateId}:`, error));
        }
      });
    },
    [selectedStates, cities, setFormData]
  );

  const handleCityChange = useCallback(
    (stateId, selectedOptions) => {
      const selectedCityIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
      const removedCityIds = (selectedCities[stateId] || [])
        .filter((city) => !selectedCityIds.includes(city.value))
        .map((city) => city.value);

      setFormData((prevData) => {
        const updatedDistricts = { ...prevData.districts };
        const updatedNeighborhoods = { ...prevData.neighborhoods };

        removedCityIds.forEach((cityId) => {
          delete updatedDistricts[cityId];
          delete updatedNeighborhoods[cityId];
        });

        return {
          ...prevData,
          selectedCities: {
            ...prevData.selectedCities,
            [stateId]: selectedOptions || [],
          },
          districts: updatedDistricts,
          neighborhoods: updatedNeighborhoods,
        };
      });

      // Load districts for newly selected cities
      selectedOptions.forEach((city) => {
        if (!districts[city.value]) {
          axios
            .get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${city.value}/distritos`)
            .then((response) =>
              setFormData((prevData) => ({
                ...prevData,
                districts: {
                  ...prevData.districts,
                  [city.value]: response.data
                    .map((district) => ({ value: district.id, label: district.nome }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
                },
              }))
            )
            .catch((error) => console.error(`Error loading districts for city ${city.value}:`, error));
        }
      });
    },
    [selectedCities, districts, setFormData]
  );

  const handleDistrictChange = useCallback(
    (cityId, selectedOptions) => {
      const selectedDistrictIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
      const removedDistrictIds = (selectedDistricts[cityId] || [])
        .filter((district) => !selectedDistrictIds.includes(district.value))
        .map((district) => district.value);

      setFormData((prevData) => {
        const updatedNeighborhoods = { ...prevData.neighborhoods };
        removedDistrictIds.forEach((districtId) => delete updatedNeighborhoods[districtId]);

        return {
          ...prevData,
          selectedDistricts: {
            ...prevData.selectedDistricts,
            [cityId]: selectedOptions || [],
          },
          neighborhoods: updatedNeighborhoods,
        };
      });

      // Load neighborhoods for newly selected districts
      selectedOptions.forEach((district) => {
        if (!neighborhoods[district.value]) {
          axios
            .get(`https://servicodados.ibge.gov.br/api/v1/localidades/distritos/${district.value}/subdistritos`)
            .then((response) =>
              setFormData((prevData) => ({
                ...prevData,
                neighborhoods: {
                  ...prevData.neighborhoods,
                  [district.value]: response.data
                    .map((neighborhood) => ({ value: neighborhood.id, label: neighborhood.nome }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
                },
              }))
            )
            .catch((error) => console.error(`Error loading neighborhoods for district ${district.value}:`, error));
        }
      });
    },
    [selectedDistricts, neighborhoods, setFormData]
  );

  const handleNeighborhoodChange = useCallback(
    (districtId, selectedOptions) => {
      setFormData((prevData) => ({
        ...prevData,
        selectedNeighborhoods: {
          ...prevData.selectedNeighborhoods,
          [districtId]: selectedOptions || [],
        },
      }));
    },
    [setFormData]
  );


  // Handle moving to the next input field on "Enter" press
  const handleKeyDown = (e, nextElement) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextElement.focus(); // Move focus to the next element
    }
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
      {Object.keys(selectedCities || {}).map((stateId) =>
        (selectedCities[stateId] || []).map((city) =>
          formData.districts?.[city.value] && formData.districts[city.value].length > 0 ? (
            <div key={city.value} className={styles.formGroup}>
              <label>Selecione os Distritos de {city.label}:</label>
              <Select
                isMulti
                options={formData.districts[city.value] || []}
                value={selectedDistricts?.[city.value] || []}
                onChange={(selectedOptions) => handleDistrictChange(city.value, selectedOptions)}
              />
            </div>
          ) : null // Não exibe distritos se não houver cidades
        )
      )}


      {/* Multi-select dropdown for selecting neighborhoods for each selected district */}
      {Object.keys(selectedDistricts || {}).map(cityId => (
        (selectedDistricts[cityId] || []).map(district => (
          // Verifica se existem bairros para esse distrito
          formData.neighborhoods?.[district.value] && formData.neighborhoods[district.value].length > 0 ? (
            <div key={district.value} className={styles.formGroup}>
              <label>Selecione os Bairros de {district.label}:</label>
              <Select
                isMulti
                options={formData.neighborhoods?.[district.value] || []}
                value={selectedNeighborhoods?.[district.value] || []}
                onChange={(selectedOptions) => handleNeighborhoodChange(district.value, selectedOptions)}
              />
            </div>
          ) : null // Não exibe o campo se não houver bairros
        ))
      ))}

    </div>
  );
}
