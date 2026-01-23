/**
 * @description pm2 configuration file.
 * @example
 *  production mode :: pm2 start ecosystem.config.js --only prod
 *  development mode :: pm2 start ecosystem.config.js --only dev
 */
module.exports = {
    apps: [
        {
            name: 'prod',
            script: 'dist/src/server.js',
            instances: 2,
            exec_mode: 'cluster',
            watch: false,
            autorestart: true,
            output: './logs/access.log', // pm2 log file
            error: './logs/error.log', // pm2 error log file
            ignore_watch: ['node_modules', 'logs'], // ignore files change
            max_memory_restart: '1G', // restart if process use more than 1G memory
            merge_logs: true, // if true, stdout and stderr will be merged and sent to pm2 log
            env: {
                PORT: 8090,
                NODE_ENV: 'production',
            },
        },
        {
            name: 'dev', // pm2 start App name
            script: 'ts-node', // ts-node
            args: '-r tsconfig-paths/register --transpile-only src/server.ts', // ts-node args
            exec_mode: 'fork', // 'cluster' or 'fork'
            instance_var: 'INSTANCE_ID', // instance variable
            instances: 1, // pm2 instance count
            autorestart: true, // auto restart if process crash
            watch: false, // files change automatic restart
            ignore_watch: ['node_modules', 'logs'], // ignore files change
            max_memory_restart: '1G', // restart if process use more than 1G memory
            merge_logs: true, // if true, stdout and stderr will be merged and sent to pm2 log
            output: './logs/access.log', // pm2 log file
            error: './logs/error.log', // pm2 error log file
            env: {
                // environment variable
                PORT: 8090,
                NODE_ENV: 'development',
            },
        },
    ],
};
