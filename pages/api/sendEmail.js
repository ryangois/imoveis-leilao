import chromium from 'chrome-aws-lambda';
import nodemailer from 'nodemailer';

async function createHtmlPdf(htmlContent) {
    let browser;
    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        return pdfBuffer;
    } catch (error) {
        console.error('Error creating PDF:', error);
        throw new Error('Failed to generate PDF.');
    } finally {
        if (browser) await browser.close();
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const formData = req.body;
        const protocolo = `PROT-${Math.floor(Math.random() * 1000000)}`;
        console.log('Received form data:', formData);

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
            // Generate PDF
            const pdfBuffer = await createHtmlPdf(htmlContent);

            // Configure Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Prepare email data
            const adminEmail = process.env.EMAIL_USER;
            const adminMessage = `
            Novo formulário de intenção de compra de imóvel.
            Protocolo: ${protocolo}
            
            Dados:
            ${Object.entries(formData)
                .map(([key, value]) => `- ${key}: ${value}`)
                .join('\n')}
            `;

            // Send email to admin
            const emailPromises = [
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: adminEmail,
                    subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
                    text: adminMessage,
                    attachments: [
                        {
                            filename: `${protocolo}.pdf`,
                            content: pdfBuffer,
                        },
                    ],
                }),
            ];

            // Send confirmation email to the user if email is provided
            if (formData.email) {
                emailPromises.push(
                    transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: formData.email,
                        subject: `Confirmação de recebimento - Protocolo: ${protocolo}`,
                        text: `Recebemos seu formulário. Seu protocolo é: ${protocolo}`,
                    })
                );
            }

            // Await all email operations
            await Promise.all(emailPromises);

            // Respond to the client
            res.status(200).json({ protocolo });
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ message: 'Erro ao enviar e-mail ou gerar PDF.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} não permitido.`);
    }
}
