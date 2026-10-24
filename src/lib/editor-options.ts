import type { Field } from "./schema";
import type { Row } from "./domain";
export function fieldChoices(
  field: Field,
  options: Record<string, Row[]>,
): Row[] {
  if (field.type === "media")
    return (options.media_assets || []).filter((x) =>
      String(x.mime).startsWith("image/"),
    );
  return field.relation ? options[field.relation] || [] : [];
}
