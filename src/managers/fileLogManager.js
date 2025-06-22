import { appendFileSync, writeFileSync } from 'fs';

export class FileLogManager {
    constructor(eventManager, filePath = 'combat.log') {
        this.filePath = filePath;
        // initialize file
        try {
            writeFileSync(this.filePath, '', { flag: 'w' });
        } catch (e) {
            console.error('Failed to initialize log file', e);
        }
        eventManager.subscribe('log', (data) => {
            if (data && data.message) {
                this.write(data.message);
            }
        });
    }

    write(message) {
        try {
            appendFileSync(this.filePath, message + '\n');
        } catch (e) {
            console.error('Failed to write log', e);
        }
    }
}
