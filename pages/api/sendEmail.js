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
        await page.setContent(htmlContent, { waitUntil: 'networkidle2' });

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
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed.`);
    }

    const formData = req.body;
    const protocolo = `PROT-${Math.floor(Math.random() * 1000000)}`;
    console.log('Received form data:', formData);

    const htmlContent = `
        <h1>Formulário de Intenção de Compra</h1>
        <p><strong>Protocolo:</strong> ${protocolo}</p>
        <ul>
            ${Object.entries(formData)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value || 'Não informado'}</li>`)
                .join('')}
        </ul>
    `;

    try {
        // Generate PDF
        console.log('Generating PDF...');
        const pdfBuffer = await createHtmlPdf(htmlContent);
        console.log('PDF generated successfully.');

        // Configure Nodemailer
        console.log('Setting up email transport...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send email to admin
        console.log('Sending email to admin...');
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
            text: `Form details: ${JSON.stringify(formData)}`,
            attachments: [
                { filename: `${protocolo}.pdf`, content: pdfBuffer },
            ],
        });

        // Send confirmation email to user (if email is provided)
        if (formData.email) {
            console.log('Sending confirmation email to user...');
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: formData.email,
                subject: `Confirmação de recebimento - Protocolo: ${protocolo}`,
                text: `Recebemos seu formulário. Seu protocolo é: ${protocolo}`,
            });
        }

        console.log('All emails sent successfully.');
        res.status(200).json({ protocolo });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Erro ao enviar e-mail ou gerar PDF.', details: error.message });
    }
}