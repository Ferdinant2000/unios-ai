/**
 * TTS (text-to-speech) через Web Speech API. Только браузер.
 */

export function speakText(text: string, lang: "ru" | "uz" | "en" = "ru"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang =
    lang === "uz"
      ? "uz-UZ"
      : lang === "en"
        ? "en-US"
        : "ru-RU";
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}