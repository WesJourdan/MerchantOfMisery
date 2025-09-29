import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import {
  GRID_COLS,
  GRID_ROWS,
  MOVE_RANGE,
  STEP_DURATION,
  TILE_SIZE,
  areAdjacent,
  boardFromPoint,
  clampLog,
  computeMovementPath,
  findPath,
  tileKey,
  tileToWorld,
  wait,
} from "./HellmarchTactics.logic";

const Unit = ({ color, isActive, label, tile, hp, maxHp }) => {
  const [x, , z] = tileToWorld(tile);

  return (
    <group position={[x, 0.5, z]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.32, 1, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <Html center distanceFactor={12} position={[0, 0.8, 0]}>
        <div className="flex flex-col items-center text-xs font-medium text-slate-100">
          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/70 shadow">{label}</span>
          <span className="mt-1 px-2 py-0.5 rounded bg-black/60 border border-slate-800 shadow text-[10px]">
            HP {hp}/{maxHp}
          </span>
        </div>
      </Html>
      {isActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
          <ringGeometry args={[0.36, 0.42, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.65} />
        </mesh>
      )}
    </group>
  );
};

Unit.propTypes = {
  color: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  label: PropTypes.string.isRequired,
  tile: PropTypes.shape({ row: PropTypes.number, col: PropTypes.number }).isRequired,
  hp: PropTypes.number.isRequired,
  maxHp: PropTypes.number.isRequired,
};

const PathIndicator = ({ path }) => (
  <group>
    {path.map((tile, index) => {
      const [x, , z] = tileToWorld(tile);
      const isFinal = index === path.length - 1;
      return (
        <mesh key={`${tile.row}-${tile.col}-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[0.92 * TILE_SIZE, 0.92 * TILE_SIZE]} />
          <meshBasicMaterial
            color={isFinal ? "#f97316" : "#38bdf8"}
            transparent
            opacity={isFinal ? 0.45 : 0.3}
          />
        </mesh>
      );
    })}
  </group>
);

PathIndicator.propTypes = {
  path: PropTypes.arrayOf(PropTypes.shape({ row: PropTypes.number, col: PropTypes.number })).isRequired,
};

const HellmarchTactics = ({ heroName }) => {
  const [units, setUnits] = useState({
    player: { row: GRID_ROWS - 2, col: Math.floor(GRID_COLS / 2), hp: 14, maxHp: 14 },
    enemy: { row: 1, col: Math.floor(GRID_COLS / 2) + 1, hp: 12, maxHp: 12 },
  });
  const [turn, setTurn] = useState("player");
  const [hoverTile, setHoverTile] = useState(null);
  const [plannedPath, setPlannedPath] = useState([]);
  const [log, setLog] = useState(() => clampLog([
    "Commander, issue orders with a click.",
    "Each hero may stride up to three tiles per turn.",
  ]));

  const unitsRef = useRef(units);
  const turnRef = useRef(turn);
  const resolvingRef = useRef(false);

  useEffect(() => {
    unitsRef.current = units;
  }, [units]);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  const pushLog = useCallback((entry) => {
    setLog((prev) => clampLog([...prev, entry]));
  }, []);

  const moveUnit = useCallback(async (unitKey, steps) => {
    for(const step of steps) {
      setUnits((prev) => ({
        ...prev,
        [unitKey]: { ...prev[unitKey], row: step.row, col: step.col },
      }));
      await wait(STEP_DURATION);
    }
  }, []);

  const resolveEnemyTurn = useCallback(async () => {
    const playerAlive = unitsRef.current.player?.hp > 0;
    const enemy = unitsRef.current.enemy;
    if(!playerAlive || !enemy) {
      resolvingRef.current = false;
      setTurn(playerAlive ? "player" : "defeated");
      return;
    }

    await wait(STEP_DURATION);

    const player = unitsRef.current.player;

    if(areAdjacent(enemy, player)) {
      const dmg = 2 + Math.floor(Math.random() * 3);
      pushLog(`Enemy strikes ${heroName} for ${dmg} damage!`);
      setUnits((prev) => ({
        ...prev,
        player: { ...prev.player, hp: Math.max(0, prev.player.hp - dmg) },
      }));
      await wait(STEP_DURATION);
      if(unitsRef.current.player.hp <= 0) {
        pushLog(`${heroName} falls. Retreat!`);
        resolvingRef.current = false;
        setTurn("defeated");
        return;
      }
    } else {
      const blocked = new Set([tileKey(player)]);
      const path = findPath(enemy, player, blocked);
      if(path && path.length > 1) {
        const steps = path.slice(1, MOVE_RANGE + 1);
        await moveUnit("enemy", steps);
      }

      if(unitsRef.current.enemy && areAdjacent(unitsRef.current.enemy, unitsRef.current.player)) {
        const dmg = 2 + Math.floor(Math.random() * 2);
        pushLog(`Enemy slashes ${heroName} for ${dmg} damage!`);
        setUnits((prev) => ({
          ...prev,
          player: { ...prev.player, hp: Math.max(0, prev.player.hp - dmg) },
        }));
        await wait(STEP_DURATION);
        if(unitsRef.current.player.hp <= 0) {
          pushLog(`${heroName} falls. Retreat!`);
          resolvingRef.current = false;
          setTurn("defeated");
          return;
        }
      }
    }

    resolvingRef.current = false;
    setTurn("player");
  }, [heroName, moveUnit, pushLog]);

  const handleTileClick = useCallback(async (tile) => {
    if(!tile || turnRef.current !== "player" || resolvingRef.current) return;
    if(unitsRef.current.player?.hp <= 0) return;

    const player = unitsRef.current.player;
    const enemy = unitsRef.current.enemy;

    const path = computeMovementPath(player, tile, enemy);
    const steps = path ? path.slice(1, MOVE_RANGE + 1) : [];
    const targetingEnemy = enemy && tileKey(tile) === tileKey(enemy);

    if(steps.length === 0 && !(targetingEnemy && areAdjacent(player, enemy))) {
      if(!targetingEnemy) return;
    }

    resolvingRef.current = true;
    setPlannedPath([]);

    if(steps.length) {
      await moveUnit("player", steps);
    }

    const currentEnemy = unitsRef.current.enemy;
    if(targetingEnemy && currentEnemy && areAdjacent(unitsRef.current.player, currentEnemy)) {
      const dmg = 3 + Math.floor(Math.random() * 3);
      pushLog(`${heroName} strikes for ${dmg} damage!`);
      setUnits((prev) => {
        if(!prev.enemy) return prev;
        const hp = Math.max(0, prev.enemy.hp - dmg);
        return {
          ...prev,
          enemy: hp <= 0 ? null : { ...prev.enemy, hp },
        };
      });
      await wait(STEP_DURATION);
      if(!unitsRef.current.enemy) {
        pushLog("Enemy defeated. The path is clear.");
        resolvingRef.current = false;
        setTurn("player");
        return;
      }
    }

    setTurn("enemy");
    await resolveEnemyTurn();
  }, [computeMovementPath, heroName, moveUnit, pushLog, resolveEnemyTurn]);

  const handleTileHover = useCallback((tile) => {
    setHoverTile(tile);
    if(!tile || turnRef.current !== "player" || resolvingRef.current) {
      setPlannedPath([]);
      return;
    }
    const player = unitsRef.current.player;
    const enemy = unitsRef.current.enemy;
    const path = computeMovementPath(player, tile, enemy);
    if(path && path.length > 1) {
      setPlannedPath(path.slice(1, MOVE_RANGE + 1));
    } else {
      setPlannedPath([]);
    }
  }, [computeMovementPath]);

  const hoverWorld = useMemo(() => (hoverTile ? tileToWorld(hoverTile) : null), [hoverTile]);

  const playerUnit = units.player;
  const enemyUnit = units.enemy;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/40">
      <div className="relative h-[420px] rounded-t-xl overflow-hidden">
        {/*
          The encounter board renders inside the same react-three-fiber Canvas that powers
          the hero 3D preview, so the tactics layer can reuse lighting, materials, and
          camera controls established for the existing Three.js scene.
        */}
        <Canvas camera={{ position: [6, 9, 6], fov: 42 }} shadows>
          <color attach="background" args={["#0f172a"]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 3]} intensity={1.1} castShadow />
          <group position={[0, 0, 0]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
              onPointerMove={(event) => handleTileHover(boardFromPoint(event.point))}
              onPointerOut={() => handleTileHover(null)}
              onClick={(event) => {
                event.stopPropagation();
                const tile = boardFromPoint(event.point);
                handleTileClick(tile);
              }}
            >
              <planeGeometry args={[GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE]} />
              <meshStandardMaterial color="#1e293b" transparent opacity={0.25} />
            </mesh>
            <gridHelper
              args={[GRID_COLS * TILE_SIZE, GRID_COLS, "#38bdf8", "#1e3a8a"]}
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0.01, 0]}
            />
            {plannedPath.length > 0 && <PathIndicator path={plannedPath} />}
            {hoverWorld && (
              <mesh position={[hoverWorld[0], 0.015, hoverWorld[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.94 * TILE_SIZE, 0.94 * TILE_SIZE]} />
                <meshBasicMaterial color="#facc15" transparent opacity={0.18} />
              </mesh>
            )}
            {playerUnit && (
              <Unit
                color="#38bdf8"
                isActive={turn === "player"}
                label={heroName}
                tile={playerUnit}
                hp={playerUnit.hp}
                maxHp={playerUnit.maxHp}
              />
            )}
            {enemyUnit && (
              <Unit
                color="#f87171"
                isActive={turn === "enemy"}
                label="Grim Raider"
                tile={enemyUnit}
                hp={enemyUnit.hp}
                maxHp={enemyUnit.maxHp}
              />
            )}
          </group>
          <OrbitControls enablePan={false} minPolarAngle={0.9} maxPolarAngle={1.2} />
        </Canvas>
        <div className="absolute inset-x-0 top-0 flex justify-between p-3 text-xs text-slate-200 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-transparent">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded bg-slate-900/70 px-2 py-1 border border-slate-700/70">
              <span className="font-semibold text-sky-300">{heroName}</span>
              <span>HP {playerUnit.hp}/{playerUnit.maxHp}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded bg-slate-900/60 px-2 py-1 border border-slate-800/80">
              <span className="uppercase tracking-wide text-[10px] text-slate-400">Turn</span>
              <span className="font-semibold text-amber-300">
                {turn === "player" && "Player"}
                {turn === "enemy" && "Enemy"}
                {turn === "defeated" && "Defeated"}
              </span>
            </div>
          </div>
          <div className="space-y-1 text-right">
            {enemyUnit ? (
              <div className="inline-flex items-center gap-2 rounded bg-slate-900/70 px-2 py-1 border border-rose-700/70">
                <span className="font-semibold text-rose-300">Grim Raider</span>
                <span>HP {enemyUnit.hp}/{enemyUnit.maxHp}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded bg-emerald-900/70 px-2 py-1 border border-emerald-700/70 text-emerald-200">
                <span>Enemy routed</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="text-xs text-slate-300 leading-relaxed">
          <p>Click any tile within range to move. Click the foe to engage in melee.</p>
          <p className="mt-1 text-slate-400">Movement is constrained to a three-tile stride per turn.</p>
          <p className="mt-2 text-slate-500">
            The simulation rides on the hero detail page&apos;s 3D viewport, so geometry and
            lighting behave exactly like the main experience.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 h-32 overflow-y-auto text-xs text-slate-200 space-y-1">
          {log.map((entry, index) => (
            <div key={`${entry}-${index}`} className="font-mono">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

HellmarchTactics.propTypes = {
  heroName: PropTypes.string,
};

HellmarchTactics.defaultProps = {
  heroName: "Hero",
};

export default HellmarchTactics;
