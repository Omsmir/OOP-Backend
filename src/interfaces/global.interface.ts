import type { QueryResult, QueryConfig, QueryResultRow, QueryConfigValues, PoolClient } from 'pg';

export enum SUBJECT_TYPES {
    EMAIL_VERIFICATION = 'Email Verification',
    PASSWORD_RESET = 'Password Reset',
    WELCOME_EMAIL = 'Welcome Email',
}




export enum EMAIL_TEMPLATES {
  EMAIL_VERIFICATION = 'emailVerification.hbs',
  EMAIL_VERIFICATION_ALERT = 'emailVerificationAlert.hbs',

}

export interface sendEmailProps {
    to: string;
    link?: string;
    templateName: EMAIL_TEMPLATES;
    appName: string;
    otp?: string;
    year: string | number | Date;
    date?: string | number | Date;
    subject: SUBJECT_TYPES;
}

export interface PostgresInterface {
    query<R extends QueryResultRow, I = unknown[]>(
        queryTextOrConfig: string | QueryConfig<I>,
        values?: QueryConfigValues<I>
    ): Promise<QueryResult<R>>;

    getClient: () => Promise<PoolClient>;
}
