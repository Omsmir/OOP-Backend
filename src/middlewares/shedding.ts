import { BaseController } from '@/controllers/base.controller';
import { NextFunction, Request, Response } from 'express';
import { performance } from 'perf_hooks';
import os from 'os';

export enum LOAD_MAXS {
    MAX_MEMORY = 1.5 * 1024 * 1024 * 1024,
    MAX_EVENT_LOOP_DELAY = 200,
}

class loadSheddings extends BaseController {
    constructor() {
        super();
    }

    private memory = () => {
        const usedMemory = process.memoryUsage().rss; // Node process memory in bytes
        const totalSystemMemory = os.totalmem();
        const usagePercent = (usedMemory / totalSystemMemory) * 100;

        console.log(totalSystemMemory / 1024 / 1024);
        console.log(`memory used ${usagePercent.toFixed(2)}% of total system memory`);
    };

    public isOverloaded = (): Boolean => {
        const MEMORY = process.memoryUsage().rss;

        const EVENT_LOOP_DELAY = performance.eventLoopUtilization().utilization * 1000;

        return MEMORY > LOAD_MAXS.MAX_MEMORY || EVENT_LOOP_DELAY > LOAD_MAXS.MAX_EVENT_LOOP_DELAY;
    };

    public sheddingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (this.isOverloaded()) {
                // 50% chance of rejecting to smooth out spikes
                if (Math.random() < 0.5) {
                    res.status(503).json({ message: 'Server busy right now' });
                    return;
                }
            }
            return next();
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export default loadSheddings;
