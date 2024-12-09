const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const tmp = require('tmp');

// Função para formatar os dados do formulário
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

  return Object.entries(formData).map(([key, value]) => {
    let formattedValue = '';

    if (Array.isArray(value)) {
      formattedValue = value.map((item) => {
        if (typeof item === 'object' && item.label) {
          return item.label;
        }
        return item;
      }).join(', ');
    } else if (typeof value === 'object') {
      formattedValue = Object.entries(value).map(([subKey, subValue]) => `${subKey}: ${subValue}`).join(', ');
    } else {
      formattedValue = value ?? 'Não informado';
    }

    return `• ${fieldLabels[key] || key}: ${formattedValue}`;
  }).join('\n\n');
}

// Função para criar o PDF
function createPdf(formData, protocolo) {
  const doc = new PDFDocument();
  const tmpFile = tmp.fileSync();

  doc.fontSize(16).text('Formulário de Intenção de Compra de Imóvel', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Protocolo: ${protocolo}`);
  doc.moveDown();
  doc.text('Dados do Formulário:', { underline: true });
  doc.moveDown();
  doc.fontSize(10).text(formatFormDataWithBullets(formData), { align: 'left', lineGap: 6 });
  doc.end();

  fs.writeFileSync(tmpFile.name, doc.buffer);

  return tmpFile.name;
}

// Função para enviar e-mail
async function sendEmail(formData, protocolo) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ryangoisdev@gmail.com',
      pass: 'cohxnebuifwtgzvp',
    },
  });

  const pdfPath = createPdf(formData, protocolo);

  const adminMessage = `Novo formulário de intenção de compra de imóvel.\nProtocolo: ${protocolo}\nDados: ${formatFormDataWithBullets(formData)}`;

  await transporter.sendMail({
    from: 'ryangoisdev@gmail.com',
    to: 'ryangoisdev@gmail.com',
    subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
    text: adminMessage,
    attachments: [
      {
        filename: `${protocolo}.pdf`,
        path: pdfPath,
      },
    ],
  });

  if (formData.email) {
    await transporter.sendMail({
      from: 'ryangoidev@gmail.com',
      to: formData.email,
      subject: `Confirmação de recebimento - Protocolo: ${protocolo}`,
      text: `Recebemos seu formulário. Seu protocolo é: ${protocolo}`,
    });
  }
}
