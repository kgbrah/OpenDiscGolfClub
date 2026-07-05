import type { MemberGate } from "../config"

export function memberGateMatches(
  gate: MemberGate,
  passwordInput: string,
  codePhraseInput: string,
): boolean {
  const passwordMatches = passwordInput === gate.password
  const phraseMatches = gate.codePhrase
    ? codePhraseInput.trim().toLowerCase() === gate.codePhrase.trim().toLowerCase()
    : true

  return passwordMatches && phraseMatches
}
