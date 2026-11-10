import { AppWindow } from "lucide-react";
import storageCapacity from "@/assets/ugsci-apps/storage-capacity.svg";
import wellborePressure from "@/assets/ugsci-apps/wellbore-pressure.svg";
import documentForms from "@/assets/ugsci-apps/document-forms.svg";
import uproject from "@/assets/ugsci-apps/uproject.svg";
import ulit from "@/assets/ugsci-apps/ulit.svg";
import uideas from "@/assets/ugsci-apps/uideas.svg";

export const ugsciAppIconUrls: ReadonlyMap<string, string> = new Map([
  ["storage-capacity", storageCapacity],
  ["wellbore-pressure", wellborePressure],
  ["document-forms", documentForms],
  ["uproject", uproject],
  ["ulit", ulit],
  ["uideas", uideas],
]);

/** Original UGSci-Mono app artwork, tinted with the surrounding theme. */
export function UgsciAppIcon({
  appId,
  size = 24,
}: {
  appId: string;
  size?: number;
}) {
  const source = ugsciAppIconUrls.get(appId);
  if (!source) return <AppWindow size={size} strokeWidth={1.75} />;
  return (
    <span
      aria-hidden="true"
      data-ugsci-app-icon={appId}
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: size,
        height: size,
        backgroundColor: "currentColor",
        maskImage: `url(${JSON.stringify(source)})`,
        WebkitMaskImage: `url(${JSON.stringify(source)})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
