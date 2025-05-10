// Node
import { styleText } from 'util';

export const logger = {
    log: (message: string) => console.log(styleText('cyanBright', `[POT-SERVER] ${message}`)),
    success: (message: string) => console.log(styleText('green', `[POT-SERVER] ${message}`)),
    info: (message: string) => console.info(styleText('cyan', `[POT-SERVER] ${message}`)),
    time: (message: string) => console.time(styleText('magentaBright', `[POT-SERVER] ${message}`)),
    timeEnd: (message: string) => {
        console.timeEnd(styleText('magentaBright', `[POT-SERVER] ${message}`));
    },
    warn: (message: string) => console.warn(styleText('yellow', `[POT-SERVER] ${message}\n`)),
    error: (message: string, err?: Error | string) => {
        console.error(styleText('red', `[POT-SERVER ${message}\n`), ...(err ? [err, '\n'] : []));
    },
};
