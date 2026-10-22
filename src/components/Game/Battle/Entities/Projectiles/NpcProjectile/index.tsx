import { ProjectileSprite } from "@/components/Game/Battle/Projectile";

type Props = {
  projectiles: Projectile[];
  groundY: number;
  /** Projéteis transformados em bomba pela Killer Queen (sprite escondido). */
  hiddenIds?: Set<string>;
};

export function NpcProjectile({ projectiles, groundY, hiddenIds }: Props) {
  if (projectiles.length === 0) return null;

  return (
    <>
      {projectiles.map((p) =>
        hiddenIds?.has(p.id) ? null : (
          <ProjectileSprite key={p.id} projectile={p} groundY={groundY} />
        ),
      )}
    </>
  );
}
