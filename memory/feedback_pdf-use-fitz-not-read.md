---
name: feedback_pdf-use-fitz-not-read
description: PDF 텍스트 추출 시 Read 도구 대신 PyMuPDF(fitz)를 바로 사용할 것 — 스킬에 명시된 방법을 우선
type: feedback
---

PDF 교과서/기출 텍스트 추출은 Read 도구가 아니라 PyMuPDF(`fitz`)로 바로 수행한다.

**Why:** Read 도구로 PDF를 열면 poppler-utils가 필요하고, 설치 시도 + 실패 + 재시도로 시간 낭비. eastasia-worksheet 스킬은 처음부터 `fitz`를 사용하도록 설계되어 있고, 항상 잘 작동해왔다.

**How to apply:** PDF 작업 시 Read 도구 시도 없이 곧바로 Python fitz 스크립트로 텍스트 추출. 특히 eastasia-worksheet, exam-analyzer 등 PDF 기반 스킬에서는 반드시 스킬에 명시된 추출 방법을 따른다.
