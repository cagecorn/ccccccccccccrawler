import assert from 'assert';

const describeStack = [];
const groupFilter = process.env.GROUP;

export function describe(name, fn) {
    describeStack.push(name);
    const indent = ' '.repeat(describeStack.length - 1);
    const shouldRun = !groupFilter || describeStack.includes(groupFilter);
    if (shouldRun) {
        console.log(`${indent}📂 ${name}`);
    }
    fn();
    describeStack.pop();
}

export function test(name, fn) {
    const shouldRun = !groupFilter || describeStack.includes(groupFilter);
    if (!shouldRun) return;
    const indent = ' '.repeat(describeStack.length);
    try {
        fn();
        console.log(`${indent}✅ PASSED: ${name}`);
    } catch (e) {
        console.error(`${indent}❌ FAILED: ${name} - ${e.message}`);
    }
}

export { assert };
