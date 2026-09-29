// Single source of truth for toasts.
// The mounted <Toaster> (components/_custom/toaster.tsx) listens to
// components/_custom/use-toast, so every consumer must share that store —
// previously this file had its own store and its toasts never rendered.
import { useToast, toast } from "@/components/_custom/use-toast"

export { useToast, toast }
