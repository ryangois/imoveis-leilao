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
          onChange={(e) => handleInputChange("goal", e.target.value)}
          value={formData.goal}
        >
          <option value="">Selecione</option>
          <option value="moradia">Para moradia própria</option>
          <option value="locacao">Para locação</option>
          <option value="compra_e_venda">Para compra e venda</option>
          <option value="construcao">Construção</option>
          <option value="outros">Outro</option>
        </select>
        {formData.goal === "outros" && (
          <input
            type="text"
            placeholder="Descreva o objetivo"
            value={formData.otherGoal || ""}
            onChange={(e) => handleInputChange("otherGoal", e.target.value)}
          />
        )}

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
        {/* Vagas de garagem */}
        <label>Vagas de garagem:</label>
        <select
          onChange={(e) => handleInputChange("garageSpaces", e.target.value)}
          value={formData.garageSpaces}
        >
          <option value="">Selecione</option>
          <option value="1+">1+</option>
          <option value="2+">2+</option>
          <option value="3+">3+</option>
          <option value="4+">4+</option>
          <option value="outros">Outros</option>
        </select>
        {formData.garageSpaces === "outros" && (
          <input
            type="text"
            placeholder="Descreva o número de vagas"
            value={formData.otherGarageSpaces || ""}
            onChange={(e) => handleInputChange("otherGarageSpaces", e.target.value)}
          />
        )}

        {/* Quartos */}
        <label>Quartos:</label>
        <select
          onChange={(e) => handleInputChange("rooms", e.target.value)}
          value={formData.rooms}
        >
          <option value="">Selecione</option>
          <option value="1+">1+</option>
          <option value="2+">2+</option>
          <option value="3+">3+</option>
          <option value="4+">4+</option>
          <option value="outros">Outros</option>
        </select>
        {formData.rooms === "outros" && (
          <input
            type="text"
            placeholder="Descreva o número de quartos"
            value={formData.otherRooms || ""}
            onChange={(e) => handleInputChange("otherRooms", e.target.value)}
          />
        )}

        {/* Banheiros */}
        <label>Banheiros:</label>
        <select
          onChange={(e) => handleInputChange("bathrooms", e.target.value)}
          value={formData.bathrooms}
        >
          <option value="">Selecione</option>
          <option value="1+">1+</option>
          <option value="2+">2+</option>
          <option value="3+">3+</option>
          <option value="4+">4+</option>
          <option value="outros">Outros</option>
        </select>
        {formData.bathrooms === "outros" && (
          <input
            type="text"
            placeholder="Descreva o número de banheiros"
            value={formData.otherBathrooms || ""}
            onChange={(e) => handleInputChange("otherBathrooms", e.target.value)}
          />
        )}
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
            'Outros',
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
          {/* Input for "Outros" */}
          {formData.infrastructure.includes('Outros') && (
            <input
              type="text"
              placeholder="Descreva outras infraestruturas indispensáveis"
              value={formData.otherInfrastructure || ''}
              onChange={(e) => handleInputChange('otherInfrastructure', e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Pagamento */}
      <div className={styles.formGroup}>
        <label>Preferência por pagamento:</label>
        <select
          onChange={(e) => handleInputChange("paymentPreference", e.target.value)}
          value={formData.paymentPreference}
        >
          <option value="">Selecione</option>
          <option value="vista">À vista</option>
          <option value="parcelado">Parcelado</option>
          <option value="financiado">Financiado</option>
          <option value="fgts">Utilizar FGTS</option>
          <option value="outros">Outra Forma</option>
        </select>
        {formData.paymentPreference === "outros" && (
          <input
            type="text"
            placeholder="Descreva outra forma de pagamento"
            value={formData.otherPaymentPreference || ""}
            onChange={(e) => handleInputChange("otherPaymentPreference", e.target.value)}
          />
        )}

        {formData.paymentPreference === "fgts" && (
          <input
            type="number"
            placeholder="Valor disponível em FGTS"
            value={formData.fgtsValue}
            onChange={(e) => handleInputChange('fgtsValue', e.target.value)}
          />
        )}

        {formData.paymentPreference === "financiado" && (
          <>
            <label>Já possui crédito aprovado?</label>
            <select onChange={(e) => handleInputChange('creditApproved', e.target.value)} value={formData.creditApproved}>
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>

            {formData.creditApproved === "sim" && (
              <div>
                <label>Em qual(is) instituição(ões):</label>
                {["Caixa Econômica Federal", "Banco do Brasil", "Bradesco", "Itaú", "Santander", "C6", "Nubank", "Outra instituição"].map(inst => (
                  <div key={inst}>
                    <label>
                      <input
                        type="checkbox"
                        value={inst}
                        checked={formData.approvedInstitutions.includes(inst)}
                        onChange={(e) => {
                          const selected = e.target.checked
                            ? [...formData.approvedInstitutions, inst]
                            : formData.approvedInstitutions.filter(i => i !== inst);
                          handleInputChange('approvedInstitutions', selected);
                        }}
                      />
                      {inst}
                    </label>
                    {formData.approvedInstitutions.includes(inst) && (
                      <input
                        type="number"
                        placeholder={`Crédito aprovado - ${inst}`}
                        value={formData.institutionCreditValues[inst] || ''}
                        onChange={(e) => {
                          const values = { ...formData.institutionCreditValues, [inst]: e.target.value };
                          handleInputChange('institutionCreditValues', values);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className={styles.formGroup}>
        <label>De quanto você dispõe para aportes mensais (eventualidades e custos fixos)?</label>
        <input
          type="number"
          placeholder="Valor que dispõe"
          value={formData.monthlyContribution}
          onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
        />
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
        <p>Obs: Fase 1 vai desde a análise do imóvel até a desocupação e registro em seu nome. A fase 2 vai desde a reforma até a venda do imóvel.</p>
      </div>

      <div className={styles.formGroup}>
        <label>Existe mais alguma informação ou observação que gostaria de adicionar?</label>
        <textarea
          placeholder="Escreva suas observações aqui"
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          rows="4"
        />
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
