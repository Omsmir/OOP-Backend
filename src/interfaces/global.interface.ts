
export interface sendEmailProps {
    to: string;
    link?: string;
    templateName: string;
    appName?: string;
    otp?: string;
    year?: string | number | Date;
    date?: string | number | Date;
}
