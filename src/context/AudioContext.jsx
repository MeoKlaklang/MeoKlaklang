import { createContext, useContext, useEffect, useRef, useState } from "react";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
	const audioRef = useRef(null);
	const introPausedRef = useRef(false);

	const [muted, setMuted] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		const audio = new Audio("/sounds/theme-song.mp3");

		audio.loop = true;
		audio.volume = 0.1;
		audio.muted = false;
		audio.preload = "auto";

		audioRef.current = audio;

		function onPlay() {
			setIsPlaying(true);
		}

		function onPause() {
			setIsPlaying(false);
		}

		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);

		// Browser may block autoplay with sound
		audio.play().catch(() => {
			setIsPlaying(false);
		});

		return () => {
			audio.pause();
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audioRef.current = null;
		};
	}, []);

	async function toggleSound() {
		const audio = audioRef.current;
		if (!audio) return;

		if (muted) {
			audio.muted = false;
			setMuted(false);

			if (!introPausedRef.current) {
				try {
					await audio.play();
				} catch {
					// Autoplay may be blocked
				}
			}

			return;
		}

		// If audio was blocked, use the click to start it
		if (audio.paused && !introPausedRef.current) {
			try {
				await audio.play();
			} catch {
				// User can try again
			}
			return;
		}

		audio.muted = true;
		setMuted(true);
	}

	function pausePlayback() {
		introPausedRef.current = true;
		audioRef.current?.pause();
	}

	async function resumePlayback() {
		introPausedRef.current = false;

		const audio = audioRef.current;
		if (!audio) return;

		try {
			await audio.play();
		} catch {
			// Music stays available via the sound button
		}
	}

	return (
		<AudioContext.Provider
			value={{
				muted,
				isPlaying,
				toggleSound,
				pausePlayback,
				resumePlayback,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	const context = useContext(AudioContext);

	if (!context) {
		throw new Error("useAudio must be used inside AudioProvider");
	}

	return context;
}
