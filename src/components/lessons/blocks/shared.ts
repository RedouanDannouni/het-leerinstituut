import type { Asset, AssetKind, Block } from "@/lib/lessons/types";

export interface BlockEditorProps<B extends Block = Block> {
  block: B;
  onChange: (block: B) => void;
  /** Opent de mediabibliotheek/upload en geeft het gekozen asset terug. */
  onRequestAsset?: (kinds: AssetKind[], apply: (asset: Asset) => void) => void;
}

export interface BlockStudentProps<B extends Block = Block> {
  block: B;
}
