import nodemailer from 'nodemailer';
// process.env.EMAIL_USER
// process.env.EMAIL_PASS

// Função para filtrar os dados, se necessário
function processForm(formData) {
    return formData; // Retorna os dados sem alteração, mas pode ser customizado
}

function formatFormDataWithBullets(formData) {
    const fieldLabels = {
        nome: 'Nome',
        email: 'Email',
        telefone: 'Telefone',
        estadoImportante: 'Estado Importante',
        objetivo: 'Objetivo',
        tipoImovel: 'Tipo de Imóvel',
        estadosSelecionados: 'Estados Selecionados',
        cidadesSelecionadas: 'Cidades Selecionadas',
        bairrosSelecionados: 'Bairros Selecionados',
        // Adicione outros campos conforme necessário
    };

    return Object.entries(formData)
        .map(([key, value]) => {
            let formattedValue = "";

            // Se for um array de objetos (estados, cidades, bairros)
            if (Array.isArray(value)) {
                // Verifica se é um array de objetos que contém 'label' (como estados, cidades, bairros)
                formattedValue = value
                    .map((item) => {
                        if (typeof item === 'object' && item.label) {
                            return item.label;  // Exibe o valor da chave 'label'
                        }
                        return item;  // Se não for objeto ou não tiver 'label', exibe o valor diretamente
                    })
                    .join(', ');  // Junta os valores com vírgula
            }
            // Se for um objeto, exibe suas chaves e valores
            else if (typeof value === "object") {
                formattedValue = Object.entries(value)
                    .map(([subKey, subValue]) => `${subKey}: ${subValue}`)
                    .join(', ');  // Mostra as chaves e valores do objeto
            }
            // Caso contrário, exibe o valor diretamente
            else {
                formattedValue = value ?? "Não informado";
            }

            return `• ${fieldLabels[key] || key}: ${formattedValue}`;
        })
        .join('\n\n');  // Adiciona espaçamento entre os itens
}







export default async function handler(req, res) {
    if (req.method === 'POST') {
        const formData = req.body;
        const protocolo = `PROT-${Math.floor(Math.random() * 1000000)}`;

        console.log("Dados recebidos no formulário:", formData);


        // Filtra os dados antes de enviar o e-mail
        const filteredFormData = processForm(formData);

        // Formata os dados com bullets
        const formattedFormData = formatFormDataWithBullets(filteredFormData);

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "ryangoisdev@gmail.com",
                    pass: "",
                },
            });

            const adminMessage = `
            Novo formulário de intenção de compra de imóvel.
            Protocolo: ${protocolo}
            
            Dados:
            ${formattedFormData}
            `;

            // Envia e-mail para o administrador
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: 'ryangoisdev@gmail.com',
                subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
                text: adminMessage,
            });

            // Envia confirmação ao usuário, se o e-mail estiver disponível
            if (filteredFormData.email) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: filteredFormData.email,
                    subject: `Confirmação de recebimento - Protocolo: ${protocolo}`,
                    text: `Recebemos seu formulário. Seu protocolo é: ${protocolo}`,
                });
            }

            // Resposta para o cliente
            res.status(200).json({ protocolo });

        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            res.status(500).json({ message: 'Erro ao enviar e-mail.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
