import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const formData = req.body;
        const protocolo = `PROT-${Math.floor(Math.random() * 1000000)}`;

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const adminMessage = `
            Novo formulário de intenção de compra de imóvel.
            Protocolo: ${protocolo}
            
            Dados:
            ${Object.keys(formData)
                    .map((key) => `${key}: ${JSON.stringify(formData[key], null, 2)}`)
                    .join('\n')}
            `;

            // Envia e-mail para o administrador
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: 'seuemail@example.com',
                subject: `Novo formulário de intenção - Protocolo: ${protocolo}`,
                text: adminMessage,
            });

            // Envia confirmação ao usuário, se o e-mail estiver disponível
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
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
