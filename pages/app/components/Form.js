import React, { useState, useRef } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import styles from '../styles/Form.module.css';

// Dynamically import the FormComponent to disable SSR for this component
function processForm(formData) {
  const userFormData = {
    completeName: formData.completeName,
    email: formData.email,
    // cpf: formData.cpf,
    protocol: formData.protocol,
    goal: formData.goal,
    stateImportant: formData.stateImportant,
    selectedStates: formData.selectedStates,
    selectedCities: formData.selectedCities,
    selectedDistricts: formData.selectedDistricts,
    selectedNeighborhoods: formData.selectedNeighborhoods,
    propertyType: formData.propertyType,
    minArea: formData.minArea,
    maxArea: formData.maxArea,
    garageSpaces: formData.garageSpaces,
    rooms: formData.rooms,
    bathrooms: formData.bathrooms,
    infrastructure: formData.infrastructure,
    otherInfrastructure: formData.otherInfrastructure,
    paymentPreference: formData.paymentPreference,
    fgtsValue: formData.fgtsValue,
    creditApproved: formData.creditApproved,
    approvedInstitutions: formData.approvedInstitutions,
    institutionCreditValues: formData.institutionCreditValues,
    availableFunds: formData.availableFunds,
    monthlyContribution: formData.monthlyContribution,
    advisoryPhase: formData.advisoryPhase,
    additionalInfo: formData.additionalInfo,
  };

  const filteredData = Object.fromEntries(
    Object.entries(userFormData).filter(([key, value]) => value !== undefined && value !== "")
  );

  console.log(filteredData);

  return filteredData;
}

function formatFormDataWithBullets(formData) {
  const fieldLabels = {
    protocol: "Protocolo",
    completeName: "• Nome Completo",
    // cpf: "CPF",
    email: "• E-mail",
    goal: "Objetivo",
    stateImportant: "Estado importante",
    selectedStates: "• Estados selecionados",
    selectedCities: "• Cidades selecionadas",
    selectedNeighborhoods: "• Bairros selecionados",
    selectedDistricts: "• Distritos selecionados",
    propertyType: "• Tipo de imóvel",
    minArea: "• Área mínima (m²)",
    maxArea: "• Área máxima (m²)",
    garageSpaces: "• Vagas de garagem",
    rooms: "• Quartos",
    bathrooms: "• Banheiros",
    infrastructure: "• Infraestrutura",
    otherInfrastructure: "Outras Infraestruturas",
    paymentPreference: "• Preferência de pagamento",
    creditApproved: "• Crédito aprovado",
    approvedInstitutions: "• Instituições aprovadas",
    otherPaymentPreference: "• Outra preferencia de pagamento",
    institutionCreditValues: "• Valores de crédito das instituições",
    monthlyContribution: "• Contribuição mensal",
    advisoryPhase: "• Fase de consultoria",
    additionalInfo: "• Informações adicionais",

  };


  return Object.entries(formData)
    .map(([key, value]) => {
      const label = fieldLabels[key] || key;  // Obtém o nome do campo

      if (key === 'institutionCreditValues' && typeof value === 'object') {
        return Object.entries(value)
          .map(([institution, creditValue]) => {
            return `${institution}: R$ ${creditValue}`;
          })
          .join('\n');
      }

      // Caso o valor seja um array (como selectedStates, selectedCities, selectedNeighborhoods, selectedDistricts)
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Se o array contém objetos, mapeia e exibe o 'label' de cada objeto
          return `${label}:\n- ${value.map(item => item?.label || item).join('\n- ')}`;
        } else {
          return null; // Se o array estiver vazio, ignore
        }
      }

      // Caso o valor seja um objeto com arrays dentro (como selectedCities, selectedNeighborhoods, selectedDistricts)
      if (typeof value === 'object' && value !== null) {
        return Object.entries(value)
          .map(([subKey, subValue]) => {
            // Verifica se o subValor é um array de objetos (como as cidades, bairros e distritos)
            if (Array.isArray(subValue)) {
              return `${label} (${subKey}):\n- ${subValue.map(item => item?.label || item).join('\n- ')}`;
            } //pegar a subkey e fazer get na api de novo
            return null;
          })
          .filter(Boolean)  // Remove valores nulos
          .join('\n');  // Junta todos os resultados
      }

      // Agora vamos adicionar um if separado para os valores de 'institutionCreditValues'
      if (key === 'institutionCreditValues' && typeof value === 'object') {
        // Exibe os valores de crédito das instituições
        return Object.entries(value)
          .map(([institution, creditValue]) => {
            return `${institution}: R$ ${creditValue}`;
          })
          .join('\n'); // Junta os valores de crédito das instituições com uma nova linha
      }

      // Caso contrário, o valor é simples (string, número, etc)
      return value ? `${label}: ${value}` : null;
    })
    .filter(Boolean) // Remove valores nulos
    .join('\n'); // Junta todos os campos com nova linha
}

const FormComponent = dynamic(() => import('./FormComponent'), { ssr: false });

export default function Form() {
  const [formData, setFormData] = useState({
    completeName: '',
    // cpf: '',
    email: '',
    goal: '',
    stateImportant: '',
    selectedStates: [],
    selectedCities: {},
    selectedNeighborhoods: {},
    selectedDistricts: {},
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
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const messageRef = useRef(null);

  // function formatCPF(cpf) {
  //   cpf = cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
  //   if (cpf.length === 11) {
  //     // Formata o CPF se tiver 11 números
  //     return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  //   }
  //   return cpf; // Caso contrário, retorna o valor sem formatação
  // }

  function formatCurrency(value) {
    if (isNaN(value) || value === null || value === '') return ''; // Verifica se o valor não é um número válido

    // Se for válido, formata o valor como moeda
    value = parseFloat(value).toFixed(0); // Remove os centavos
    return `R$ ${value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`; // Formatação para adicionar pontos de milhar
  }

  const handlePropertyTypeChange = (type) => {
  if (type === 'Indiferente') {
    handleInputChange('propertyType', type === 'Indiferente' ? ['Indiferente'] : []);
  } else {
    const newSelected = type.checked 
      ? [...formData.propertyType, type] 
      : formData.propertyType.filter((t) => t !== type);
    handleInputChange('propertyType', newSelected);
  }
}

  const handleInputChange = (name, value) => {
    let formattedValue = value;

    // Verifica se o valor é uma string
    if (typeof value === 'string') {
      // Se for um campo monetário, tenta garantir que o valor é numérico
      if (['fgtsValue', 'availableFunds', 'monthlyContribution', 'institutionCreditValues'].includes(name)) {
        // Remove qualquer caractere não numérico (como vírgulas ou pontos)
        formattedValue = value.replace(/\D/g, '');
        // Se o valor for um número, formata como moeda
        if (formattedValue && !isNaN(formattedValue)) {
          formattedValue = formatCurrency(parseFloat(formattedValue));
        } else {
          formattedValue = ''; // Caso contrário, deixa o valor em branco
        }
      }
    }

    setFormData((prevData) => ({ ...prevData, [name]: formattedValue }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const filteredData = processForm(formData); // Filter out empty or undefined fields
    const formattedData = formatFormDataWithBullets(filteredData); // Format data with bullets


    try {
      const response = await axios.post('/api/sendEmail', formattedData);
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

      // Scroll to the message container and set focus on it
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageRef.current.focus();  // Set focus on the message element
      }
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h1 className={styles.formTitle}>Questionário de Intenção de Compra de Imóvel de Leilão</h1>


      <div className={styles.formGroup}>
        <label>Nome Completo</label>
        <input
          type="text"
          placeholder="Insira seu nome completo"
          value={formData.completeName}
          onChange={(e) => handleInputChange('completeName', e.target.value)}
          required
        />
      </div>
      {/* <div className={styles.formGroup}>
        <label>CPF</label>
        <input
          type="text"
          placeholder="Insira seu CPF"
          value={formData.cpf}
          onChange={(e) => handleInputChange('cpf', e.target.value)}

          required
        />
      </div> */}

      <div className={styles.formGroup}>
        <label>E-mail para confirmação:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>
      {/* Objetivo */}
      <div className={styles.formGroup}>
        <label>Qual é o objetivo da sua arrematação?</label>
        <select
          onChange={(e) => handleInputChange("goal", e.target.value)}
          value={formData.goal}
          required
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
          required
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
          {['Casa', 'Apartamento', 'Terreno', 'Imóvel comercial', 'Prédio', 'Indiferente'].map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                value={type}
                checked={formData.propertyType.includes(type)}
                onChange={(e) => {
                  if (type === 'Indiferente') {
                    // Se "Indiferente" for marcado, desmarque os outros e marque "Indiferente"
                    const newSelected = e.target.checked ? ['Indiferente'] : [];
                    handleInputChange('propertyType', newSelected);
                  } else {
                    // Se "Indiferente" não estiver marcado, altere os outros tipos normalmente
                    const newSelected = e.target.checked
                      ? [...formData.propertyType, type]
                      : formData.propertyType.filter((t) => t !== type);
                    handleInputChange('propertyType', newSelected);
                  }
                }}
                disabled={formData.propertyType.includes('Indiferente') && type !== 'Indiferente'}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Metragem */}
      <div className={styles.formGroup}>
        <label>Metragem mínima (m²):</label>
        <input
          type="number"
          onChange={(e) => handleInputChange('minArea', e.target.value)}
          value={formData.minArea}
        />

        <label>Metragem máxima (m²):</label>
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
            'Indiferente',
          ].map((item) => (
             <label key={type}>
              <input
                type="checkbox"
                value={type}
                checked={formData.propertyType.includes(type)}
                onChange={(e) => {
                  if (type === 'Indiferente') {
                    // Se "Indiferente" for marcado, desmarque os outros e marque "Indiferente"
                    const newSelected = e.target.checked ? ['Indiferente'] : [];
                    handleInputChange('propertyType', newSelected);
                  } else {
                    // Se "Indiferente" não estiver marcado, altere os outros tipos normalmente
                    const newSelected = e.target.checked
                      ? [...formData.propertyType, type]
                      : formData.propertyType.filter((t) => t !== type);
                    handleInputChange('propertyType', newSelected);
                  }
                }}
                disabled={formData.propertyType.includes('Indiferente') && type !== 'Indiferente'}
              />
              {type}
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
          <div className={styles.formGroup}>
            <label>Valor disponível em FGTS</label>
            <input
              type="text" // Change to text to allow for formatting
              placeholder="Valor disponível em FGTS"
              value={formData.fgtsValue}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9,\.]/g, ''); // Remove non-numeric characters
                handleInputChange('fgtsValue', value.replace(',', '.')); // Replace commas with dots
              }}
            />
          </div>
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
                {["Caixa Econômica Federal", "Banco do Brasil", "Bradesco", "Itaú", "Santander", "C6", "Nubank", "Outra instituição"].map((inst) => (
                  <div key={inst}>
                    <label>
                      <input
                        type="checkbox"
                        value={inst}
                        checked={formData.approvedInstitutions.includes(inst)}
                        onChange={(e) => {
                          const selected = e.target.checked
                            ? [...formData.approvedInstitutions, inst]
                            : formData.approvedInstitutions.filter((i) => i !== inst);
                          handleInputChange("approvedInstitutions", selected);
                        }}
                      />
                      {inst}
                    </label>
                    {formData.approvedInstitutions.includes(inst) && (
                      <div>
                        <label>{`Crédito aprovado - ${inst}`}</label>
                        <input
                          type="text"
                          placeholder={`Crédito aprovado - ${inst}`}
                          value={formatCurrency(formData.institutionCreditValues[inst])}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9,\.]/g, "").replace(",", ".");
                            const cleanedValue = rawValue.replace(/R\$/g, "").replace(/\./g, "").replace(",", ".");
                            const updatedInstitutionCreditValues = {
                              ...formData.institutionCreditValues,
                              [inst]: cleanedValue,
                            };
                            handleInputChange("institutionCreditValues", updatedInstitutionCreditValues);
                          }}
                        />
                      </div>
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
          type="text"
          placeholder="Valor que dispõe"
          value={formData.monthlyContribution}
          onChange={(e) => {
            // Remove qualquer coisa que não seja número ou ponto
            const value = e.target.value.replace(/[^0-9,\.]/g, '');

            // Substitui vírgula por ponto (caso a pessoa use vírgula como separador decimal)
            handleInputChange('monthlyContribution', value.replace(',', '.'));
          }}
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

      {message && (
        <div
          className={`${styles.message} ${styles[message.type]}`}
          ref={messageRef} // Attach the ref to the message container
          tabIndex="-1" // Ensure the message can receive focus
        >
          {message.text}
        </div>
      )}

      {loading && <div className={styles.loading}>Enviando...</div>}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}  // Desabilita o botão enquanto está carregando
      >
        {loading ? 'Enviando...' : 'Enviar Formulário'}
      </button>
    </form>
  );
}
