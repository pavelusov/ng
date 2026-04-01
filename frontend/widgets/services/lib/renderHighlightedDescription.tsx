"use client";

import { Box } from "@mui/material";
import type { MainServiceItem } from "@/widgets/services/model/mainServices";

export function renderHighlightedDescription(item: MainServiceItem) {
  const highlight = item.highlight;
  if (!highlight) return item.description;

  const idx = item.description.indexOf(highlight);
  if (idx === -1) return item.description;

  const before = item.description.slice(0, idx);
  const after = item.description.slice(idx + highlight.length);

  return (
    <>
      {before}
      <Box
        component="span"
        sx={{
          color: (theme) => theme.palette[item.paletteColor].main,
          fontWeight: 900,
        }}
      >
        {highlight}
      </Box>
      {after}
    </>
  );
}

