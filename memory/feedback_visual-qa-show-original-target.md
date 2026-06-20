---
name: feedback_visual-qa-show-original-target
description: 시각 QA를 사용자에게 제시할 때 항상 원본 타깃(레퍼런스)을 우리 결과와 나란히 제공
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d859a40f-a644-4f66-ac0c-ebcdd908c525
---

사용자가 육안으로 시각 QA를 할 때는 **원본 타깃/레퍼런스 이미지를 우리 산출물과 나란히** 제공한다. 비교 대상 없이 우리 결과만 주지 말 것. (경로 제시 + 가능하면 동시에 열기.)

**Why:** 사용자는 "원본과 같은 패밀리로 읽히는가"를 레퍼런스 대비로만 판단한다. 결과만 보면 절대 평가가 어렵고, ppt-lab-rebuild 첫 글로우 라운드처럼 "특색이 약하다"를 놓친다. 실제로 원본 preview.png를 같이 줬더니 사용자가 "좋다"고 명시 피드백.

**How to apply:** 렌더/목업 검수 보고 시 ① 우리 결과(컨택트시트·낱장 PNG) ② 원본 타깃(예: design-diversity `design-packs/<slug>/preview.png`, 디자인 레퍼런스, 직전 버전) 둘 다 절대경로(Windows `C:\...`)로 제시하고, `powershell.exe Start-Process`로 동시에 띄운다. 가능하면 표(우리 vs 원본)나 나란히 배치로.

관련: [[feedback_always-report-visual-qa-needed]] · [[feedback_first-pass-ui-quality]] · [[feedback_korean-linebreak-visual-qa]]
