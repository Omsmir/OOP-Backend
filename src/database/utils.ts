type sslPropsType = {
    POSTGRES_SSL: string | boolean;
};

export const allowDisallowPostgresSsl = ({ POSTGRES_SSL }: sslPropsType) => {
    const connection_parameter: { ssl: { rejectUnauthorized: boolean } | boolean } = { ssl: false };
    switch (POSTGRES_SSL) {
        case 'true':
        case true:
            connection_parameter.ssl = { rejectUnauthorized: false };
            break;
        case 'false':
            connection_parameter.ssl = false;
            break;
        default:
            throw new Error(`${POSTGRES_SSL} is not a valid value`);
    }
    return connection_parameter
};
