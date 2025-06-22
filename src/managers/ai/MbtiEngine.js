export class MbtiEngine {
    constructor(eventManager) {
        if (!eventManager) {
            throw new Error("MbtiEngine requires an EventManager");
        }
        this.eventManager = eventManager;
        this.cooldown = 120; // 팝업이 너무 자주 뜨지 않도록 조절 (프레임 단위, 2초)
        console.log("[MbtiEngine] Initialized");
    }

    /**
     * 유닛의 행동과 MBTI를 분석하여 특성 발동 이벤트를 발생시킵니다.
     * @param {object} entity - AI 유닛
     * @param {object} action - AI가 결정한 행동
     */
    process(entity, action) {
        if (!entity || !action || !entity.properties?.mbti) {
            return;
        }

        // 쿨다운 체크
        if (entity._mbtiCooldown > 0) {
            entity._mbtiCooldown--;
            return;
        }

        const mbti = entity.properties.mbti;
        let traitToPublish = null;

        // 각 MBTI 차원별로 특성 발동 조건 확인
        switch (action.type) {
            case 'attack':
            case 'skill':
                if (action.target?.isFriendly === false) { // 적을 대상으로 한 공격/스킬
                    if (mbti.includes('T')) traitToPublish = 'T'; // 논리적, 공격적 판단
                    else if (mbti.includes('F')) traitToPublish = 'F'; // 감정적, 관계 중심 판단 (약한 적을 먼저)
                } else if (action.target?.isFriendly === true) { // 아군을 대상으로 한 스킬 (힐, 버프)
                    if (mbti.includes('F')) traitToPublish = 'F'; // 관계, 조화를 중시
                }

                if (!traitToPublish && mbti.includes('S')) traitToPublish = 'S'; // 감각적, 현재의 구체적인 행동
                break;

            case 'move':
                if (action.target) { // 특정 목표(적)를 향해 이동
                    if (mbti.includes('J')) traitToPublish = 'J'; // 계획적, 목표 지향적 움직임
                } else { // 목표 없이 배회
                    if (mbti.includes('P')) traitToPublish = 'P'; // 탐색적, 즉흥적 움직임
                }
                break;

            case 'idle':
            case 'flee':
                if (mbti.includes('I')) traitToPublish = 'I'; // 내향적, 혼자 있거나 후퇴
                break;
        }

        // E/I는 별도 조건으로 한 번 더 체크 (주변 유닛 수)
        if (!traitToPublish && action.context?.allies) {
            if (action.context.allies.length > 3 && mbti.includes('E')) {
                traitToPublish = 'E'; // 외향적, 많은 아군과 함께 있을 때 활성화
            }
        }

        if (traitToPublish) {
            this.eventManager.publish('ai_mbti_trait_triggered', {
                entity: entity,
                trait: traitToPublish
            });
            entity._mbtiCooldown = this.cooldown; // 쿨다운 설정
        }
    }
}
