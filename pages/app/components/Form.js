import React, { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import styles from '../styles/Form.module.css';

// Dynamically import the FormComponent to disable SSR for this component
const FormComponent = dynamic(() => import('./FormComponent'), { ssr: false });

export default function Form() {
  const [formData, setFormData] = useState({
    goal: '',
    stateImportant: '',
    selectedStates: [],
    selectedCities: {},
    selectedNeighborhoods: {},
    propertyType: [],
    minArea: '',
    maxArea: '',
    garageSpaces: '',
    rooms: '',
    bathrooms: '',
    infrastructure: [],
    otherInfrastructure: '',
    paymentPreference: '',
    fgtsValue: '',
    creditApproved: '',
    approvedInstitutions: [],
    institutionCreditValues: {},
    availableFunds: '',
    monthlyContribution: '',
    advisoryPhase: '',
    additionalInfo: '',
    email: '',
  });

  const [loading, setLoading] = useState(false); // State to handle loading
  const [message, setMessage] = useState(null); // State for status messages

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/sendEmail', formData);
      setMessage({
        type: 'success',
        text: `Formulário submetido com sucesso! Protocolo: ${response.data.protocolo}`,
      });
    } catch (error) {
      console.error('Erro ao enviar o formulário:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao enviar o formulário. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h1 className={styles.formTitle}>Questionário de Intenção de Compra de Imóvel de Leilão</h1>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {loading && <div className={styles.loading}>Enviando...</div>}

      {/* Objetivo */}
      <div className={styles.formGroup}>
        <label>Qual é o objetivo da sua arrematação?</label>
        <select
          onChange={(e) => handleInputChange('goal', e.target.value)}
          value={formData.goal}
        >
          <option value="">Selecione</option>
          <option value="moradia">Para moradia própria</option>
          <option value="locacao">Para locação</option>
          <option value="compra_e_venda">Para compra e venda</option>
          <option value="construcao">Construção</option>
        </select>
      </div>

      {/* Estado Importante */}
      <div className={styles.formGroup}>
        <label>O Estado do imóvel é importante para você?</label>
        <select
          onChange={(e) => handleInputChange('stateImportant', e.target.value)}
          value={formData.stateImportant}
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>

      {formData.stateImportant === 'sim' && (
        <FormComponent formData={formData} setFormData={setFormData} />
      )}

      {/* Características do Imóvel */}
      <div className={styles.formGroup}>
        <label>Características do imóvel que você busca:</label>
        <div>
          {['Casa', 'Apartamento', 'Terreno', 'Imóvel comercial', 'Prédio', 'Vaga de Garagem'].map(
            (type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  value={type}
                  checked={formData.propertyType.includes(type)}
                  onChange={(e) => {
                    const selected = e.target.checked
                      ? [...formData.propertyType, type]
                      : formData.propertyType.filter((t) => t !== type);
                    handleInputChange('propertyType', selected);
                  }}
                />
                {type}
              </label>
            )
          )}
        </div>
      </div>

      {/* Metragem */}
      <div className={styles.formGroup}>
        <label>Metragem mínima:</label>
        <input
          type="number"
          onChange={(e) => handleInputChange('minArea', e.target.value)}
          value={formData.minArea}
        />

        <label>Metragem máxima:</label>
        <input
          type="number"
          onChange={(e) => handleInputChange('maxArea', e.target.value)}
          value={formData.maxArea}
        />
      </div>

      {/* Garagem, Quartos e Banheiros */}
      <div className={styles.formGroup}>
        <label>Vagas de garagem:</label>
        <select
          onChange={(e) => handleInputChange('garageSpaces', e.target.value)}
          value={formData.garageSpaces}
        >
          <option value="">Selecione</option>
          <option value="1+">1+</option>
          <option value="2+">2+</option>
          <option value="3+">3+</option>
          <option value="4+">4+</option>
        </select>

        <label>Quartos:</label>
        <select
          onChange={(e) => handleInputChange('rooms', e.target.value)}
          value={formData.rooms}
        >
          <option value="">Selecione</option>
          <option value="1+">1+</option>
          <option value="2+">2+</option>
          <option value="3+">3+</option>
          <option value="4+">4+</option>
        </select>

        <label>Banheiros:</label>
        <select
          onChange={(e) => handleInputChange('bathrooms', e.target.value)}
          value={formData.bathrooms}
        >
          <option value="">Selecione</option>
          <option value="1+">1+</option>
          <option value="2+">2+</option>
          <option value="3+">3+</option>
          <option value="4+">4+</option>
        </select>
      </div>

      {/* Infraestrutura */}
      <div className={styles.formGroup}>
        <label>Infraestrutura indispensável:</label>
        <div>
          {[
            'Academia',
            'Churrasqueira',
            'Piscina',
            'Playground',
            'Quadra poliesportiva',
            'Salão de festas',
            'Sauna',
            'Elevador',
            'Portaria 24h',
          ].map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                value={item}
                checked={formData.infrastructure.includes(item)}
                onChange={(e) => {
                  const selected = e.target.checked
                    ? [...formData.infrastructure, item]
                    : formData.infrastructure.filter((i) => i !== item);
                  handleInputChange('infrastructure', selected);
                }}
              />
              {item}
            </label>
          ))}
        </div>
        <input
          type="text"
          placeholder="O que mais é indispensável para você?"
          value={formData.otherInfrastructure}
          onChange={(e) => handleInputChange('otherInfrastructure', e.target.value)}
        />
      </div>

      {/* Pagamento */}
      <div className={styles.formGroup}>
        <label>Preferência por pagamento:</label>
        <select
          onChange={(e) => handleInputChange('paymentPreference', e.target.value)}
          value={formData.paymentPreference}
        >
          <option value="">Selecione</option>
          <option value="vista">À vista</option>
          <option value="parcelado">Parcelado</option>
          <option value="financiado">Financiado</option>
          <option value="fgts">Utiliza FGTS</option>
        </select>
      </div>

      {/* Mais Campos */}
      <div className={styles.formGroup}>
        <label>Você pretende fazer a contratação da assessoria apenas da fase 1, ou fases 1 e 2?</label>
        <select
          onChange={(e) => handleInputChange('advisoryPhase', e.target.value)}
          value={formData.advisoryPhase}
        >
          <option value="">Selecione</option>
          <option value="fase1">Fase 1</option>
          <option value="fase1_e_2">Fases 1 e 2</option>
        </select>
      </div>

      {/* E-mail */}
      <div className={styles.formGroup}>
        <label>E-mail para confirmação:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
}
