from __future__ import annotations
def calculate_garden_stage(completed: int, total: int) -> int:
    """
    Calculate the garden growth stage (0-4) based on milestone completion.
      0 – seed      (<10%)
      1 – sprout    (10-29%)
      2 – sapling   (30-59%)
      3 – young tree(60-89%)
      4 – full tree (>=90%)
    """
    if total == 0:
        return 0
    pct = completed / total
    if pct < 0.10:
        return 0
    if pct < 0.30:
        return 1
    if pct < 0.60:
        return 2
    if pct < 0.90:
        return 3
    return 4
