[대규모 패치 - 미시 세계 시스템 구축]



미시세계란? 아이템, 장비들 같이 게임의 겉으로 잘 드러나지 않지만 게임에 영향을 미치는 그들만이 가지게 되는 생태계를 말함.

메인 시스템(거시 세계)와 달리 독자적인 시스템과 엔진을 가지게 될 것임.



- 필요한 것 : 미세세계를 담을 폴더.

미시세계 게임 엔진

미시세계 아이템 ai 매니저

미시세계 턴 매니저

미시세계 아이템 스탯 매니저

기타 등등 필요한 매니저와 문서, 테스트들.



-앞으로 바뀔 점 : 검과 활, 바이올린 활은 더 이상 단순히 [melee ai] [ranged ai]로 나뉘지 않음.(시스템 혼란을 위해서 밀리, 레인지드 ai 코드 자체는 유지)

각각의 무기에 맞는 ai가 할당될 것. 검=검 ai, 활 = 활 ai, 창 = 창 ai



이는 플레이어, 용병, 몬스터 모두 해당됨.



-왜? 앞으로는 '무기 숙련도'라는 시스템을 패치할 것.



[무기 숙련도]

플레이어,용병,몬스터는 모두 무기 숙련도라는 시스템이 있음.

자신이 어떤 무기에 얼마나 숙달되었는지를 나타내는 수치.(ui안에 모든 무기 항목이 들어있음.)

검 숙련도 1레벨, 이런 식으로 표기.

해당 태그를 가진 무기의 쌓인 경험치도 실시간으로 보여줌.

해당 무기의 경험치를 쌓는 조건, 그 무기를 들고 공격을 한 횟수.(미시세계 턴 매니저?)

숙련도가 높은 무기를 사용할 수록, 그 무기를 이용한 여러가지 기술을 쓸 수 있음.

이 기술은 유닛이 쓰는 기술과 다름. 마나가 들지 않음.

[아이템]이 주체가 되어 쓰는 기술이라고 이해하면 편함.



이렇게 생각하면 됨.



거시세계 = 주체: 플레이어, 용병, 몬스터

미시세계 = 주체 : 장비 아이템, 소모 아이템.



가령 숙련도 1레벨 검으로 사용할 수 있는 가장 기본적인 스킬은, 패링. 낮은 확률로 적의 공격을 쳐냄.

쿨타임이 있음. 30턴. 그리고 이 쿨타임은 플레이어의 쿨타임이 아니라 '무기'의 쿨타임임.

즉, 무기가 주체가 되어 그 기술을 쓰고, 그 쿨타임을 갖는 것.

이를 미시세계 쿨타임이라 부르겠음.



버프형 아티팩트를 사용하면 해당 아티팩트에 쿨타임이 생김. 역시 미시세계 쿨타임임.

소모품 인벤토리 안의 펫은 맵상에서 사망시 쿨타임이 생김. 역시 미시세계 쿨타임.



미시세계에서는 해당 무기가 주체가 되어, 특정 ai를 가짐. 레벨과 경험치를 가지며, 기술과 쿨타임을 가짐. 해당 무기를 쓰는 유닛은 해당 무기의 '수단'이 되는 셈.





무기 창을 사용할 경우 [창 ai]대로 움직이게 됨. 창의 긴 사거리를 통해서 적을 거리를 두며 공격하는 ai와 창의 1레벨 숙련도 기술을 가짐. 1레벨 기술은 '돌진'. 따라서 [무기]가 내킬때마다 해당 유닛은 자신의 의지와 상관없이 적을 향해 돌진하는 ai를 가지게 됨. 이런 느낌임.

각 무기의 ai와 1레벨 숙련도 스킬은 대충 이러함.



검 : 통상적인 근접 ai - 패링(낮은 확률로 공격 무효화)

단검 : 통상적인 근접 ai -백스탭(치명타 높음)

활 : 통상적인 원거리 ai -충전후 발사(더 높은 데미지)

창 : 근접 + 카이팅 ai -돌진

바이올린 활 : 통상적인 원거리 ai - 음파화살

에스톡 : 빠른 이동력을 통해서 적을 찌르고 도망치고, 찌르고 도망치는 히트 앤 런 ai - 돌진

채찍 : 창과 비슷한 중거리 유지 ai - 끌어당기기(대상을 앞으로 당김)



이외에도 아이템이 아이템만의 미시세계 스탯을 갖는 등의 시스템으로 확장해나갈 생각.

---


이 시스템 좀 구현해줘. 일명 [미시세계 전투]야. 일단 미시세계에서의 스탯은 이래.



장비의 내구도 = hp

장비의 무게 = 공격력

장비의 강인함 = 방어력



모든 무기와 방어구는 저 세가지 스탯을 가지고 있음. 두 객체가 싸울 때, 미시세계에서는 저 스탯을 기반으로 힘겨루기가 발생함. 가령 A와 B가 전투를 한다면, A와 B가 가진 장비들 사이에서는 보이지 않는 전투가 발생함. 무기가 방어구를 공격하고, 방어구가 방어함. 그 결과는 이러함.



먼저 내구도가 다 깎인 쪽이 무기일 경우 - 유닛에게서 무기가 튕겨져나감. 무장해제 됨.(전투로그 기록) 맵에 드랍됨.(줏을 수 있음.)

먼저 내구도가 다 깎인 쪽이 방어구일 경우 - 유닛의 방어구가 파괴됨(해당 특수효과와 전투로그).



여기서 좀 까다로운 지점은, A가 B,C와 동시에 대결을 벌인다면, A와 B의 대결 따로, A와 C의 대결이 [독립된 사건]이어야 한다는 점. 두 전투의 데미지가 겹칠 수 있다면 무장해제나 방어구 파괴가 너무 쉽게 일어날듯.



또한 [미시세계의 위계질서]도 있어.



일반 무기는 레어 방어구를 파괴할 수 없음.(반대도 마찬가지

레어 방어구는 유니크 무기를 무장해제할 수 없음.(반대도 마찬가지



이처럼 한 단계 더 높은 등급의 장비에 대해서는 무장해제나 방어구 파괴를 할 수 없음.

---


# Dungeon Crawler Game

This project is a lightweight browser-based dungeon crawler. It lets players explore levels, battle enemies and gather loot directly in the browser.

## Playing

Open `index.html` in a modern web browser to start the game. The player now begins with every available skill already learned, so no class selection is required.

```bash
npx http-server
```

Running a small HTTP server from the project directory is recommended because some browsers block
ES module loading when opening the file directly via `file://`. You can still open `index.html`
without a server, but you may need to adjust browser settings to permit local module imports.

### Dungeon Generation
Each floor is carved from a depth-first search maze. Corridors span seven tiles,
and the exit is placed on a randomly chosen cell that the algorithm visited.

### Monster Progression

As you descend the dungeon, tougher monsters appear on each floor.

- **Floors 1-2** – Goblins, Goblin Archers, Goblin Wizards and Zombies.
- **Floors 3-4** – Skeletons, Skeleton Mages and Orcs (with Orc Archers).
- **Floors 5-6** – Trolls begin to appear alongside Orcs and Skeleton Mages.
- **Floors 7-8** – Dark Mages join the mix with Trolls and Orcs.
- **Floors 9-10** – Demon Warriors lead groups of Dark Mages and Orcs.
- **Beyond floor 10** – ELEMENTAL_GOLEM and other high-level foes may appear.

The full roster of monsters appears on progressively higher floors as defined in
`getMonsterPoolForFloor` in [src/mechanics.js](src/mechanics.js):

- **SLIME** – A weak blob that slowly slides toward the player.
- **KOBOLD** – Crafty scavenger that often attacks in packs.
- **GARGOYLE** – Stone guardian with tough defenses.
- **BANSHEE** – Ethereal spirit whose wail saps life.
- **MINOTAUR** – Brutish beast that charges headfirst.
- **LICH** – Undead sorcerer capable of strong magic.
- **DRAGON_WHELP** – Young dragon with a small but fiery breath.
- **ELEMENTAL_GOLEM** – Massive construct empowered by elemental forces.

### Controls

- Use the arrow keys or on-screen arrows to move your character.
- Press `Z` (or `F`) or click **Attack** to strike the nearest monster.
- Number keys `1`-`9` open the details of each hired mercenary.
- Use the BGM buttons at the top of the page to switch tracks or mute the background music.
- Additional actions such as **Heal**, **Recall**, **Skill1** and **Skill2** are available via the action buttons. You can also use `X` for **Skill1**, `C` for **Skill2**, `V` for **Ranged** attack and `A` to recall your mercenaries.

### Audio

The game uses the Web Audio API for sound effects and plays background music through the `bgm-player` element.
At the top of the page are three BGM controls:
- **prev-bgm** – play the previous track
- **toggle-bgm** – mute or unmute music
- **next-bgm** – play the next track

Audio is not initialized until you interact with the page. The first click or key press runs `initializeAudio()` which starts the sound engine and begins playback.
When tests run under jsdom, audio initialization is skipped so no sound plays.

### Hiring Mercenaries

Click the buttons in the *Hire Mercenary* panel to recruit warriors, archers, healers or wizards. Each mercenary costs gold and appears near the player. You may have up to five mercenaries at a time; when full you will be prompted to replace an existing ally.

### Shop and Skill System

Spend collected gold in the shop to purchase items. Bought gear is placed in your inventory and can boost your stats when equipped. All skills are unlocked from the start and can be assigned to the **Skill1** and **Skill2** slots.
When defining skills, include a numeric `cooldown` property. Passive or always-available skills should set it to `0`.

The newly added **Teleport** skill lets you mark your current position and return to it later. Use it once to save your location, again to warp back and a third time to return to where you warped from.

### Mercenary Skills

Each mercenary receives one random skill upon hiring. Using that skill costs the
mercenary's mana, and the skill's name and icon show up in the combat log when
activated. You can see the assigned skill and its mana cost in the mercenary's
detail panel and in the side list by their portrait. Open a mercenary's detail
panel with the corresponding number key (`1`-`9`) or by clicking their portrait
in the UI.

### Bard Mercenaries

Bards are support units that join with songs ready to boost the party. Each bard
comes with one of two skill sets:

- **Heal** + **Guardian Hymn**
- **Heal** + **Courage Hymn**

These hymns play `auraActivateMinor` or `auraActivateMajor` sound cues when
activated, letting you know their protective or offensive effects are in play.

### Summoner Mercenaries

Summoners command undead minions to fight for you. They know the **Summon Skeleton** skill
and can control up to two minions at a time.

### Mercenary Traits

*This system has been removed.* Mercenaries no longer receive random traits or related bonuses.

### Mercenary Affinity (호감도 시스템)

Mercenaries and revived monsters track an *affinity* value that measures their
loyalty to the party.

- Newly hired mercenaries start with **50** affinity.
- Revived monsters start with **30** affinity.
- Affinity rises by **0.01** each turn a unit stays in your party and caps at **200**.
- When a mercenary dies they lose **5** affinity. If their affinity drops to zero
  they permanently leave your party.

You can view a unit's current affinity by opening their detail window. The value
appears near the top of the stats panel.

#### Food and Cooking

Food items increase affinity. Simple drops like **Bread** provide small bonuses
(+3 affinity), while cooked dishes from the **Crafting** tab grant larger
amounts. For example, combining Bread, Meat and Lettuce into a **Sandwich** yields
**+3** affinity and fullness.

Ingredient items and cooking recipes drop randomly during exploration and are
stored as crafting materials rather than in your main inventory.

### Elite Monsters and Auras

Each dungeon floor now contains at least one **elite** monster. Elites boast higher stats and randomly receive an aura skill that benefits nearby allies. When an elite is revived as a mercenary, it keeps this aura skill. Elites display a red glow and the "엘리트" prefix. Champions glow yellow, and superior monsters glow blue.

#### Superior Rank

Superior elites are a planned upgrade to normal elites. They carry two aura skills and gain strength through a star-based system. They are not yet part of the regular dungeon spawns.

### Incubators

Incubators let you hatch monster eggs into powerful allies. Place an egg from your inventory into an empty slot to start the process. Each egg shows how many turns remain until hatching. At the start of every turn the counter decreases. When an egg reaches zero, the hatched superior is moved to the waiting list. Recruit them from there to add the new mercenary to your party.

### Loot

Recipe scrolls may drop from monsters or appear in dungeons. Picking one up automatically adds the recipe to your known list. Duplicate scrolls are ignored once learned.

### Monster Farming

You can now cultivate monsters for equipment. Bury a defeated foe on a farm tile to start growing loot. The monster slowly decomposes over a set number of turns. Using fertilizer items reduces this time or improves the drop quality. When the growth is complete, harvest the plot to receive equipment influenced by the planted monster.

### Equipment Enhancement

Gear can be leveled up using materials like **iron** and **bone**. Each enhancement level adds **+1** to attack and defense, **+0.5** to other non-resistance stats, and **+0.01** to resistance stats. Press the **강화** button beside an item in your inventory to spend the materials and apply the upgrade. Players now begin the game with **100** iron and **100** bone so you can enhance equipment right away.
Each attempt has a 20% chance to fail, which still consumes the materials but does not increase the item's level.

### Disassembling Gear

Equipment can be broken down for extra materials. Click the **분해** button next to a weapon, armor or accessory to dismantle it. You gain both **iron** and **bone** equal to the item's base level plus its enhancement level. The item is removed from your inventory after disassembly.

### Leeching and Vampirism Bonuses

Some equipment suffixes grant special `killHealth` or `killMana` modifiers. Gear with the **Leeching** suffix restores health to whoever lands the killing blow, while the **Vampirism** suffix replenishes mana on a kill. These bonuses provide a steady trickle of recovery as you defeat enemies.

### Special Tiles

Dungeon floors contain several interactive tiles:

- **Treasure Chests** scatter 1–5 random items around them when opened.
- **Mines** grant large amounts of **iron**.
- **Trees** provide plenty of **wood**.
- **Bone Piles** yield lots of **bone**.
- **Temples** come in three colors and either fully heal the party, restore fullness or raise affinity by 10. Each temple disappears after use.
- **Graves** present a risky challenge. Accepting it spawns monsters but rewards high level items, materials and gold.

### Map Items and Altars

Map items occasionally drop from monsters and chests. Each map lists a modifier that alters the next floor, such as boosting treasure or increasing monster spawns. Every five floors a glowing map altar appears in the dungeon. Stand on the altar and activate a map from your inventory to apply its modifier – maps only work when used while positioned on these altars.

## Development

Install dependencies with:

```bash
npm install
```

The core `gameState` object used throughout the game is created in
[`src/state.js`](src/state.js) and is attached to the global object so
other modules such as `src/mechanics.js` can access it directly.

## Testing

The test suite relies on development dependencies such as **jsdom**. Ensure they
are installed by running:

```bash
npm install
```

You can simply run `npm test` as well – the `pretest` script in
`package.json` automatically installs all dependencies before executing the test
runner. After installation the test runner
automatically locates all files ending with `*.test.js` in the `tests` folder
and executes them sequentially.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Pull requests and issues are welcome. Please follow common open source etiquette when proposing changes.
