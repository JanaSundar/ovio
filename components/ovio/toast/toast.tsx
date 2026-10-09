"use client";

import type { ComponentType } from "react";
import { toast, Toaster, type ExternalToast, type ToasterProps } from "sonner";
import { OvioProvider, useWorld, type World } from "@/components/shared/world-provider";
import { MinimalToast } from "./worlds/minimal";
import { CraftToast } from "./worlds/craft";
import { RetroToast } from "./worlds/retro";
import { ToyToast } from "./worlds/toy";

export type ToastKind = "success" | "error" | "info";

export type ToastAction = { label: string; onClick: () => void };

export type OvioToastOptions = Pick<ExternalToast, "id" | "duration" | "toasterId"> & {
  description?: string;
  /** A button on the toast; pressing it also dismisses the toast. */
  action?: ToastAction;
};

/** Everything a world needs to draw one toast. Sonner owns stacking, timing and swipe. */
export type ToastWorldProps = {
  kind: ToastKind;
  title: string;
  description?: string;
  action?: ToastAction;
  dismiss: () => void;
};

const VIEWS = {
  minimal: MinimalToast,
  craft: CraftToast,
  retro: RetroToast,
  toy: ToyToast,
} satisfies Record<World, ComponentType<ToastWorldProps>>;

function OvioToast(props: ToastWorldProps) {
  const View = VIEWS[useWorld()] ?? VIEWS.minimal;
  return <View {...props} />;
}

function show(kind: ToastKind, title: string, options: OvioToastOptions = {}) {
  const { description, action, ...rest } = options;
  return toast.custom(
    (id) => (
      <OvioToast
        kind={kind}
        title={title}
        description={description}
        action={
          action && {
            label: action.label,
            onClick: () => {
              toast.dismiss(id);
              action.onClick();
            },
          }
        }
        dismiss={() => toast.dismiss(id)}
      />
    ),
    { duration: kind === "error" ? 8000 : 4000, ...rest },
  );
}

/** Shows a toast in the world of the OvioToaster that renders it. Returns its id. */
export const ovioToast = {
  success: (title: string, options?: OvioToastOptions) => show("success", title, options),
  error: (title: string, options?: OvioToastOptions) => show("error", title, options),
  info: (title: string, options?: OvioToastOptions) => show("info", title, options),
  dismiss: (id?: string | number) => toast.dismiss(id),
};

export type OvioToasterProps = Omit<
  ToasterProps,
  "theme" | "richColors" | "invert" | "icons" | "toastOptions" | "closeButton"
> & { variant?: World };

/** Where toasts appear. Mount it once; toasts take its world (variant, then the provider). */
export function OvioToaster({ variant, position = "bottom-right", ...props }: OvioToasterProps) {
  return (
    <OvioProvider world={useWorld(variant)}>
      <Toaster position={position} {...props} />
    </OvioProvider>
  );
}
