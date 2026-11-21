import type { Props } from "./types";
import { BestiaryArtwork } from "./Artwork";
import { BestiaryList } from "./List";
import { BestiaryDetail } from "./Detail";


export function BestiaryCard({
  npcType,
  name,
  encountered,
  kills,
  npcClass,
  location,
  description,
  attacks,
  dropItems,
  linkedTitles,
  isSelected,
  baseNpcType,
  isAlfa = false,
  variant = "list",
  index = 0,
  onSelect,
}: Props) {

  const artwork = (
    <BestiaryArtwork
      npcType={npcType}
      baseNpcType={baseNpcType}
      name={name}
      encountered={encountered}
      isAlfa={isAlfa}
      variant={variant}
      index={index}
    />
  );

  if (variant === "list") {
    return (
      <BestiaryList
        artwork={artwork}
        name={name}
        encountered={encountered}
        kills={kills}
        npcClass={npcClass}
        npcType={npcType}
        location={location}
        isSelected={isSelected}
        index={index}
        onSelect={onSelect}
      />
    );
  }

  return (
    <BestiaryDetail
      artwork={artwork}
      name={name}
      encountered={encountered}
      kills={kills}
      npcClass={npcClass}
      npcType={npcType}
      location={location}
      description={description}
      attacks={attacks}
      dropItems={dropItems}
      linkedTitles={linkedTitles}
    />
  );
}
