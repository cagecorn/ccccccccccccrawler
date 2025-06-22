import { Projectile } from '../src/entities.js';

console.log("--- Running Projectile Tests ---");

// 테스트를 위한 간단한 'assertion' 함수
function assertEquals(a, b, message) {
    if (a !== b) {
        throw new Error(`Assertion failed: ${message}. Expected ${b}, but got ${a}.`);
    }
}

try {
    const config = {
        x: 0, y: 0,
        target: { x: 1000, y: 1000 },
        speed: 2,
        acceleration: 0.2,
    };
    const proj = new Projectile(config);
    
    // 초기 속도 확인
    assertEquals(proj.speed, 2, "초기 속도");

    // update를 한 번 호출
    proj.update();
    
    // 가속도가 적용되어 속도가 증가했는지 확인
    assertEquals(proj.speed, 2.2, "1프레임 후 속도");

    // update를 네 번 더 호출
    for (let i = 0; i < 4; i++) {
        proj.update();
    }

    // 총 5번의 가속이 적용되었는지 확인 (2 + 0.2 * 5 = 3)
    // 자바스크립트 부동소수점 오차를 피하기 위해 toFixed 사용
    assertEquals(parseFloat(proj.speed.toFixed(1)), 3.0, "5프레임 후 속도");

    console.log("✅ PASSED: 투사체 가속도 테스트");

} catch (e) {
    console.error(`❌ FAILED: 투사체 가속도 테스트 - ${e.message}`);
}
