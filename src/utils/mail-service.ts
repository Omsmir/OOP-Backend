import { sendEmailProps } from '@/interfaces/global.interface';
import { APP_PASSWORD, PROJECT_NAME, SMTP_USER } from '@/config/defaults';
import { createTransport, Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import { logger } from './logger';
import { Command } from '@/classes/behavioral.class';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const renderTemplate = (templateName: string, context: object) => {
    const filePath = path.resolve(__dirname, `../templates/${templateName}`);
    const source = fs.readFileSync(filePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(context);
};

// this is the old version of the sendemail util, now let's refactor it in a class based clean code follows SOLID and Bevaioral command pattern
const sendEmail = async ({ to, link, templateName, appName, year, date, otp }: sendEmailProps) => {
    try {
        const transport = createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: SMTP_USER,
                pass: APP_PASSWORD,
            },
        });
        const from = 'OOP';
        const subject = 'OOP Email Verification';

        const html = renderTemplate(`${templateName}`, {
            to,
            link,
            appName,
            year,
            date,
            otp,
        });
        await transport.sendMail({ from, subject, to, html });

        logger.info(`Email sent to ${to} with template ${templateName}`);
    } catch (error: any) {
        logger.error(error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// this will be used inside the constructor of the class Invoker from behavoiral command pattern

// auth.controller.ts is used in sendVerficationEmailToUnverifiedUsers
export class EmailUtils implements Command {
    constructor(private readonly EmailProps: sendEmailProps) {}

    private transport = async (): Promise<
        Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | undefined
    > => {
        try {
            const transport = createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                auth: {
                    user: SMTP_USER,
                    pass: APP_PASSWORD,
                },
            });
            return transport;
        } catch (error: any) {
            logger.error(error.message);
        }
    };
    private renderTemplate = (templateName: string, context: object) => {
        const filePath = path.resolve(__dirname, `../templates/${templateName}`);
        const source = fs.readFileSync(filePath, 'utf-8');
        const template = Handlebars.compile(source);
        return template(context);
    };
    public execute = async () => {
        try {
            const from = PROJECT_NAME || 'OOP';
            const subject = PROJECT_NAME + ' ' + this.EmailProps.subject;

            const html = this.renderTemplate(`${this.EmailProps.templateName}`, {
                to: this.EmailProps.to,
                link: this.EmailProps.link,
                appName: this.EmailProps.appName,
                year: this.EmailProps.year,
                date: this.EmailProps.date,
                otp: this.EmailProps.otp,
            });

            const transport = await this.transport();

            if (!transport) {
                logger.error('Transporter could not be created');

                return;
            }
            await transport.sendMail({ from, subject, to: this.EmailProps.to, html });

            logger.info(
                `Email sent to ${this.EmailProps.to} with template ${this.EmailProps.templateName}`
            );
        } catch (error: any) {
            logger.error(error.message);
        }
    };
}
