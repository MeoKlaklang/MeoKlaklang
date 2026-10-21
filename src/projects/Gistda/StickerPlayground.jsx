import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

import styles from "./StickerPlayground.module.css";

const { Engine, Bodies, Body, Composite } = Matter;

export default function StickerPlayground({ stickers = [] }) {
	const stageRef = useRef(null);
	const imageRefs = useRef([]);
	const engineRef = useRef(null);
	const bodiesRef = useRef([]);
	const dragRef = useRef(null);
	const animationRef = useRef(null);

	const [visible, setVisible] = useState(false);
	const [dimensions, setDimensions] = useState({
		width: 1000,
		height: 560,
	});

	/* =====================================
     ACTIVATE WHEN VISIBLE
  ===================================== */

	useEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.unobserve(stage);
				}
			},
			{ threshold: 0.15 },
		);

		observer.observe(stage);

		return () => observer.disconnect();
	}, []);

	/* =====================================
     PHYSICS WORLD
  ===================================== */

	useEffect(() => {
		if (!visible || stickers.length === 0) return;

		const stage = stageRef.current;
		if (!stage) return;

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (reducedMotion) return;

		let disposed = false;

		function cleanupPhysics() {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;

			dragRef.current = null;

			if (engineRef.current) {
				Composite.clear(engineRef.current.world, false);
				Engine.clear(engineRef.current);
				engineRef.current = null;
			}

			bodiesRef.current = [];
		}

		function initialisePhysics() {
			cleanupPhysics();

			const width = stage.clientWidth;
			const height = stage.clientHeight;

			if (width < 10 || height < 10) return;

			setDimensions({ width, height });

			const engine = Engine.create();
			engine.gravity.y = 1.1;

			engineRef.current = engine;

			// Size of the large stickers.
			const diameter = Math.max(64, Math.min(185, width / 4.7));

			const radius = diameter / 2;

			stage.style.setProperty("--sticker-size", `${diameter}px`);

			// Curved surface:
			// high at the edges, lower in the middle.
			function curveY(x) {
				const normalized = (x - width / 2) / (width / 2);

				return height * (0.22 + 0.6 * (1 - normalized * normalized));
			}

			const boundaries = [];
			const segmentCount = 38;

			// Build the curved collision surface
			// from small static segments.
			for (let i = 0; i < segmentCount; i++) {
				const x1 = (i / segmentCount) * width;
				const x2 = ((i + 1) / segmentCount) * width;

				const y1 = curveY(x1);
				const y2 = curveY(x2);

				const dx = x2 - x1;
				const dy = y2 - y1;

				const length = Math.hypot(dx, dy);
				const angle = Math.atan2(dy, dx);

				const segment = Bodies.rectangle((x1 + x2) / 2, (y1 + y2) / 2, length + 4, 9, {
					isStatic: true,
					angle,
					restitution: 0.55,
					friction: 0.45,
					render: { visible: false },
				});

				boundaries.push(segment);
			}

			// Invisible side walls.
			boundaries.push(Bodies.rectangle(-20, height / 2, 40, height * 3, { isStatic: true }), Bodies.rectangle(width + 20, height / 2, 40, height * 3, { isStatic: true }));

			// Circular sticker bodies.
			const bodies = stickers.map((_, index) => {
				const x = Math.max(radius + 8, Math.min(width - radius - 8, width * ((index + 0.5) / stickers.length)));

				const y = -80 - index * 56;

				return Bodies.circle(x, y, radius, {
					restitution: 0.64,
					friction: 0.24,
					frictionStatic: 0.65,
					frictionAir: 0.012,
					density: 0.0008,
					slop: 0.03,
				});
			});

			bodiesRef.current = bodies;

			Composite.add(engine.world, [...boundaries, ...bodies]);

			let previousTime = 0;

			function animate(time) {
				if (disposed || !engineRef.current) return;

				if (!previousTime) previousTime = time;

				const delta = Math.min(33, Math.max(8, time - previousTime));

				previousTime = time;

				Engine.update(engine, delta);

				bodies.forEach((body, index) => {
					const element = imageRefs.current[index];
					if (!element) return;

					const x = body.position.x - radius;
					const y = body.position.y - radius;

					const rotation = (body.angle * 180) / Math.PI;

					element.style.transform = `
            translate3d(${x}px, ${y}px, 0)
            rotate(${rotation}deg)
          `;
				});

				animationRef.current = requestAnimationFrame(animate);
			}

			animationRef.current = requestAnimationFrame(animate);
		}

		initialisePhysics();

		const resizeObserver = new ResizeObserver(() => {
			if (!disposed) initialisePhysics();
		});

		resizeObserver.observe(stage);

		return () => {
			disposed = true;
			resizeObserver.disconnect();
			cleanupPhysics();
		};
	}, [visible, stickers.length]);

	/* =====================================
     DRAG INTERACTION
  ===================================== */

	function handlePointerDown(event, index) {
		const body = bodiesRef.current[index];

		if (!body || !stageRef.current) return;

		event.preventDefault();

		event.currentTarget.setPointerCapture(event.pointerId);

		Body.setStatic(body, true);

		dragRef.current = {
			body,
			index,
			pointerId: event.pointerId,
			lastX: event.clientX,
			lastY: event.clientY,
			velocityX: 0,
			velocityY: 0,
		};
	}

	function handlePointerMove(event) {
		const drag = dragRef.current;

		if (!drag || drag.pointerId !== event.pointerId) {
			return;
		}

		const stage = stageRef.current;
		if (!stage) return;

		const rect = stage.getBoundingClientRect();
		const radius = drag.body.circleRadius;

		const x = Math.max(radius, Math.min(rect.width - radius, event.clientX - rect.left));

		const y = Math.max(radius, Math.min(rect.height - radius, event.clientY - rect.top));

		drag.velocityX = event.clientX - drag.lastX;
		drag.velocityY = event.clientY - drag.lastY;

		drag.lastX = event.clientX;
		drag.lastY = event.clientY;

		Body.setPosition(drag.body, { x, y });
		Body.setVelocity(drag.body, { x: 0, y: 0 });
	}

	function releaseSticker(event) {
		const drag = dragRef.current;

		if (!drag || drag.pointerId !== event.pointerId) {
			return;
		}

		Body.setStatic(drag.body, false);

		Body.setVelocity(drag.body, {
			x: Math.max(-12, Math.min(12, drag.velocityX)),
			y: Math.max(-12, Math.min(12, drag.velocityY)),
		});

		dragRef.current = null;
	}

	/* =====================================
     RESTART ANIMATION
  ===================================== */

	function restart() {
		const engine = engineRef.current;
		if (!engine) return;

		const width = stageRef.current.clientWidth;

		bodiesRef.current.forEach((body, index) => {
			const radius = body.circleRadius;
			const x = Math.max(radius + 8, Math.min(width - radius - 8, width * ((index + 0.5) / stickers.length)));

			Body.setStatic(body, false);

			Body.setPosition(body, {
				x,
				y: -80 - index * 56,
			});

			Body.setVelocity(body, { x: 0, y: 0 });
			Body.setAngularVelocity(body, 0);
			Body.setAngle(body, 0);
		});
	}

	return (
		<div className={styles.playground}>
			<div className={styles.playgroundHeader}>
				<span>GRAB · DRAG · DROP</span>

				<button type="button" onClick={restart} disabled={!visible} className={styles.resetButton}>
					<span aria-hidden="true">↻</span>
					Replay
				</button>
			</div>

			<div ref={stageRef} className={`${styles.stage} ${visible ? styles.stageVisible : ""}`} aria-label="Interactive space sticker playground">
				{/* The visible curved line. */}
				<svg className={styles.curve} width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} preserveAspectRatio="none" aria-hidden="true">
					<path
						d={`
              M 0 ${dimensions.height * 0.22}
              Q ${dimensions.width / 2} ${dimensions.height * 1.42}
                ${dimensions.width} ${dimensions.height * 0.22}
            `}
					/>
				</svg>

				{stickers.map((src, index) => (
					<div
						key={src}
						ref={(element) => {
							imageRefs.current[index] = element;
						}}
						className={styles.sticker}
						style={{
							"--index": index,
						}}
						onPointerDown={(event) => handlePointerDown(event, index)}
						onPointerMove={handlePointerMove}
						onPointerUp={releaseSticker}
						onPointerCancel={releaseSticker}
					>
						<img src={src} alt={`Space sticker ${index + 1}`} draggable="false" />
					</div>
				))}
			</div>

			<p className={styles.instruction}>Pick up a sticker, move it around and let it fall.</p>
		</div>
	);
}
