import { EventManager } from '../src/managers/eventManager.js';
import { FileLogManager } from '../src/managers/fileLogManager.js';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { describe, test, assert } from './helpers.js';

const LOG_PATH = './tests/tmp-combat.log';

describe('FileLogManager', () => {
    test('writes log messages to file', () => {
        if (existsSync(LOG_PATH)) unlinkSync(LOG_PATH);
        const eventManager = new EventManager();
        new FileLogManager(eventManager, LOG_PATH);
        eventManager.publish('log', { message: 'File log test' });
        const content = readFileSync(LOG_PATH, 'utf-8').trim();
        assert.strictEqual(content, 'File log test');
        unlinkSync(LOG_PATH);
    });
});
