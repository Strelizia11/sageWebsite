import type { ReactNode } from "react";

export function SealOrbit({ children }: { children: ReactNode }) {
  return (
    <div className="seal-orbit">
      <span className="seal-ripple" aria-hidden="true" />
      <span className="seal-ripple seal-ripple-two" aria-hidden="true" />
      <span className="seal-ripple seal-ripple-three" aria-hidden="true" />
      {children}
    </div>
  );
}
