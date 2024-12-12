import chromium from 'chrome-aws-lambda';
import nodemailer from 'nodemailer';

async function createHtmlPdf(htmlContent) {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const formData = req.body;
        const protocolo = `PROT-${Math.floor(Math.random() * 1000000)}`;

        const htmlContent = `
        <h1>Formulário de Intenção de Compra</h1>
        <p><strong>Protocolo:</strong> ${protocolo}</p>
        <ul>
            ${Object.entries(formData)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                .join('')}
        </ul>
        `;

        try {
            // Generate PDF from HTML
            const pdfBuffer = await createHtmlPdf(htmlContent);

            // Configure Nodemailer transport
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Email to administrator
            const adminMessage = `
            Novo formulário de intenção de compra de imóvel.
            Protocolo: ${protocolo}
            
            Dados:
            ${formatFormDataWithBullets(formData)}
            `;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
                text: adminMessage,
                attachments: [
                    {
                        filename: `${protocolo}.pdf`,
                        content: pdfBuffer,
                    },
                ],
            });

            // Confirmation email to the user (if email is provided)
            if (formData.email) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: formData.email,
                    subject: `Confirmação de recebimento - Protocolo: ${protocolo}`,
                    text: `Recebemos seu formulário. Seu protocolo é: ${protocolo}`,
                });
            }

            res.status(200).json({ protocolo });
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            res.status(500).json({ message: 'Erro ao enviar e-mail.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} não permitido.`);
    }
}
