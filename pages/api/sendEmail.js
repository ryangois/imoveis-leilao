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
            console.log('Generating PDF...');
            const pdfBuffer = await createHtmlPdf(htmlContent);
            console.log('PDF generated successfully.');

            console.log('Setting up email transport...');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "ryangoisdev@gmail.com",
                    pass: "xmwuqfxhwkolerlp",

                },
            });

            console.log('Sending email to admin...');
            await transporter.sendMail({
                from: "ryangoisdev@gmail.com",
                to: "ryangoisdev@gmail.com",
                subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
                text: `Form details: ${JSON.stringify(formData)}`,
                attachments: [
                    { filename: `${protocolo}.pdf`, content: pdfBuffer },
                ],
            });

            if (formData.email) {
                console.log('Sending confirmation email to user...');
                await transporter.sendMail({
                    from: "ryangoisdev@gmail.com",
                    to: formData.email,
                    subject: `Confirmação de recebimento - Protocolo: ${protocolo}`,
                    text: `Recebemos seu formulário. Seu protocolo é: ${protocolo}`,
                });
            }

            console.log('All emails sent successfully.');
            res.status(200).json({ protocolo });
        } catch (error) {
            console.error('Error processing request:', error); // Log the full error
            res.status(500).json({ message: 'Erro ao enviar e-mail ou gerar PDF.', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} não permitido.`);
    }
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

}
