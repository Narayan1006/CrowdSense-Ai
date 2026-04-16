// Voice Service — Web Speech API wrappers
// Works in Chrome, Edge, and modern browsers without any API key

export const isSpeechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
export const isTTSSupported = 'speechSynthesis' in window;

let currentUtterance = null;

/**
 * Starts speech recognition and returns a Promise<string> with the transcript.
 * @param {string} language - 'en-US' or 'hi-IN'
 */
export function startListening(language = 'en-US') {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported in this browser'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = event => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      // If no result was returned, resolve with empty string
    };

    recognition.start();
  });
}

/**
 * Speaks text aloud using browser TTS.
 * @param {string} text - Text to speak
 * @param {string} language - 'en-US' or 'hi-IN'
 */
export function speak(text, language = 'en-US') {
  if (!isTTSSupported) return;

  // Stop any current speech
  stopSpeaking();

  // Strip markdown symbols for cleaner speech
  const cleanText = text
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/🚪|🎫|🍕|🚻|🆘|🏥|👮|📍|📊|🚗|🚇|🔍|📞|🟢|🟡|🔴|👋|✅|⚠️|😊/g, '')
    .replace(/\n+/g, '. ')
    .trim();

  currentUtterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance.lang = language;
  currentUtterance.rate = 0.95;
  currentUtterance.pitch = 1.0;
  currentUtterance.volume = 1.0;

  // Try to find a suitable voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang === language && v.name.includes('Google'))
    || voices.find(v => v.lang === language)
    || voices.find(v => v.lang.startsWith(language.split('-')[0]));
  if (preferredVoice) currentUtterance.voice = preferredVoice;

  window.speechSynthesis.speak(currentUtterance);
}

export function stopSpeaking() {
  if (isTTSSupported) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return isTTSSupported && window.speechSynthesis.speaking;
}
