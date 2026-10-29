# 롤 챔피언 맞추기

힌트를 골라 리그 오브 레전드 챔피언을 맞추는 게임입니다.

- 한 판에 랜덤 챔피언 10명 출제
- 16가지 힌트 중 챔피언마다 최대 8개 공개
- 챔피언당 정답 기회 1회, 마지막에 맞춘 개수 표시

## 개발

```bash
npm install
npm run dev
```

## 챔피언 데이터 갱신

새 패치나 신규 챔피언이 나오면 아래 명령으로 `src/data/champions.json`을 다시 생성합니다.

```bash
npm run fetch-data
```

| 항목 | 출처 |
| --- | --- |
| 이름, 칭호, 자원, 사거리, 스킨 수, 역할군, CC기 보유 스킬 수 | Riot Data Dragon |
| 출시일 / 패치, 근거리·원거리, 주요 라인, 피해 유형, 성별(대명사) | League of Legends Wiki (CC BY-SA) |
| 지역(소속) | Riot Universe |
| 종족 | `scripts/species.json` (수동 분류) |

- 신규 챔피언은 `scripts/species.json`에 종족을 추가해야 합니다. 누락되면 스크립트가 경고를 출력합니다.
- 자동 수집 값이 틀린 경우 `scripts/overrides.json`에 챔피언 ID별로 덮어쓸 값을 적습니다.
- CC기 보유 스킬 수는 Q/W/E/R 툴팁의 CC 표기(`<status>` 태그)와 키워드로 자동 계산합니다.

## 배포

Vercel에 저장소를 연결하면 별도 설정 없이 배포됩니다.
