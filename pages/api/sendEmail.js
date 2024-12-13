import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

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
    };

    return Object.entries(formData)
        .map(([key, value]) => {
            let formattedValue = "";

            if (Array.isArray(value)) {
                formattedValue = value
                    .map((item) => (typeof item === 'object' && item.label ? item.label : item))
                    .join(', ');
            } else if (typeof value === "object") {
                formattedValue = Object.entries(value)
                    .map(([subKey, subValue]) => ${subKey}: ${subValue})
                    .join(', ');
            } else {
                formattedValue = value ?? "Não informado";
            }

            return • ${fieldLabels[key] || key}: ${formattedValue};
        })
        .join('\n\n');
}

// Função para criar o PDF em buffer
async function createPdf(formData, protocolo) {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => console.log('PDF criado com sucesso'));

    doc.fontSize(16).text('Formulário de Intenção de Compra de Imóvel', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(Protocolo: ${protocolo});
    doc.moveDown();

    doc.text('Dados do Formulário:', { underline: true });
    doc.moveDown();

    const formattedFormData = formatFormDataWithBullets(formData);
    doc.fontSize(10).text(formattedFormData, { align: 'left', lineGap: 6 });

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));
    });
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const formData = req.body;
        const protocolo = PROT-${Math.floor(Math.random() * 1000000)};

        console.log("Dados recebidos no formulário:", formData);

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const pdfBuffer = await createPdf(formData, protocolo);
            console.log('PDF gerado em buffer');

            const adminMessage = `
Novo formulário de intenção de compra de imóvel.
Protocolo: ${protocolo}

Dados:
${formatFormDataWithBullets(formData)}
            `;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: Novo formulário de intenção - Protocolo: ${protocolo},
                text: adminMessage,
                attachments: [
                    {
                        filename: ${protocolo}.pdf,
                        content: pdfBuffer,
                    },
                ],
            });

            if (formData.email) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: formData.email,
                    subject: Confirmação de recebimento - Protocolo: ${protocolo},
                    text: Recebemos seu formulário. Seu protocolo é: ${protocolo},
                });
            }

            res.status(200).json({ protocolo });
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            res.status(500).json({ message: 'Erro ao enviar e-mail.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(Método ${req.method} não permitido);
    }
}
