import BaseIdeaCard, { type BaseIdeaCardProps } from "./BaseIdeiaCard";

export default function IdeaResultCard(
  props: Readonly<
    Omit<BaseIdeaCardProps, "density" | "clampLines" | "actions" | "showMeta">
  >
) {
  return (
    <BaseIdeaCard
      density="comfortable"
      clampLines={null}
      actions="full"
      metaMode="full"
      {...props}
    />
  );
}
