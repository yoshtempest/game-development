import {
  npcPathPets,
  npcPathProjectile,
  playerProjectilePath,
} from "@/utils/paths";

export const spriteMap: Record<string, string> = {
  dish: npcPathProjectile("/dish.svg"),
  "goat-idle": npcPathPets("/goat/default.svg"),
  "goat-walk": npcPathPets("/goat/walk.svg"),
  staff: npcPathProjectile("/staff.svg"),
  spear: npcPathProjectile("/spear.svg"),
  spoon: npcPathProjectile("/spoon.svg"),
  knife: npcPathProjectile("/knife.svg"),
  paper: npcPathProjectile("/paper.svg"),
  burst: npcPathProjectile("/burst.svg"),
  burstExplosion: npcPathProjectile("/burstExplosion.svg"),
  blueSphere: playerProjectilePath("/blueSphere.svg"),
  redSphere: playerProjectilePath("/redSphere.svg"),
  purpleSphere: playerProjectilePath("/purpleSphere.svg"),
  energyAttack: playerProjectilePath("/energyAttack.svg"),
};
