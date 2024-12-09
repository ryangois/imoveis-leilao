import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Função para formatar os dados do formulário com bullets
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
                formattedValue = value
                    .map((item) => {
                        if (typeof item === 'object' && item.label) {
                            return item.label;
                        }
                        return item;
                    })
                    .join(', ');
            }
            // Se for um objeto, exibe suas chaves e valores
            else if (typeof value === "object") {
                formattedValue = Object.entries(value)
                    .map(([subKey, subValue]) => `${subKey}: ${subValue}`)
                    .join(', ');
            }
            // Caso contrário, exibe o valor diretamente
            else {
                formattedValue = value ?? "Não informado";
            }

            return `• ${fieldLabels[key] || key}: ${formattedValue}`;
        })
        .join('\n\n');
}

// Função para criar o PDF
function createPdf(formData, protocolo) {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `${protocolo}.pdf`);

    // Salva o PDF em um arquivo
    doc.pipe(fs.createWriteStream(filePath));

    // Adiciona título e protocolo
    doc.fontSize(16).text('Formulário de Intenção de Compra de Imóvel', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Protocolo: ${protocolo}`);
    doc.moveDown();

    // Adiciona dados do formulário
    doc.text('Dados do Formulário:', { underline: true });
    doc.moveDown();

    // Formata e escreve os dados no PDF
    const formattedFormData = formatFormDataWithBullets(formData);
    doc.fontSize(10).text(formattedFormData, { align: 'left', lineGap: 6 });

    // Finaliza o PDF
    doc.end();

    return filePath;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const formData = req.body;
        const protocolo = `PROT-${Math.floor(Math.random() * 1000000)}`;

        console.log("Dados recebidos no formulário:", formData);

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "davifrancoassessoria@gmail.com",
                    pass: "kvoscqnffqlezpnb",
                },
            });

            // Cria o PDF com os dados do formulário
            const pdfPath = createPdf(formData, protocolo);
            console.log('PDF gerado em:', pdfPath);

            const adminMessage = `
            Novo formulário de intenção de compra de imóvel.
            Protocolo: ${protocolo}
            
            Dados:
            ${formatFormDataWithBullets(formData)}
            `;

            // Envia e-mail para o administrador com o PDF em anexo
            await transporter.sendMail({
                from: "davifrancoassessoria@gmail.com",
                to: "davifrancoassessoria@gmail.com",
                subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
                text: adminMessage,
                attachments: [
                    {
                        filename: `${protocolo}.pdf`,
                        path: pdfPath,
                    },
                ],
            });

            // Envia confirmação ao usuário, se o e-mail estiver disponível
            if (formData.email) {
                await transporter.sendMail({
                    from: "davifrancoassessoria@gmail.com",
                    to: formData.email,
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
