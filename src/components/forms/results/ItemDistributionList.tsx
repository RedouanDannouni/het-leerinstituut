import type { ItemStat } from "@/lib/forms/results-dashboard";
import type { ScaleVariant } from "@/lib/forms/types";
import { nl } from "./helpers";
import { DistributionStrip } from "./DistributionStrip";
import { HighSdBadge } from "./HighSdBadge";

interface ItemDistributionListProps {
  items: ItemStat[];
  scale: ScaleVariant;
}

interface ItemGroup {
  key: string;
  label: string;
  items: ItemStat[];
}

function groupItems(items: ItemStat[]): ItemGroup[] {
  const groups: ItemGroup[] = [];
  const index = new Map<string, ItemGroup>();
  for (const item of items) {
    let group = index.get(item.groupKey);
    if (!group) {
      group = { key: item.groupKey, label: item.groupLabel, items: [] };
      index.set(item.groupKey, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

/** Per item de werkelijke verdeling over de schaalpunten — de grootste analytische winst. */
export function ItemDistributionList({ items, scale }: ItemDistributionListProps) {
  return (
    <div className="item-dist">
      {groupItems(items).map((group) => (
        <div className="item-dist__group" key={group.key}>
          <h4 className="item-dist__group-title">{group.label}</h4>
          {group.items.map((item) => (
            <div className="item-dist__row" key={item.column}>
              <p className="item-dist__text">
                <span className="item-dist__nr">{item.nr}.</span> {item.text}
                {item.stat.highSd ? <HighSdBadge /> : null}
              </p>
              <div className="item-dist__viz">
                <DistributionStrip distribution={item.stat.distribution} scale={scale} showPercentages />
                <span className="item-dist__mean">
                  gem {nl(item.stat.mean)} · n {item.stat.n}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
