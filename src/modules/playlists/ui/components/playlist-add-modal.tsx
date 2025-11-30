import { ResponsiveModal } from "@/components/responsive-modal";

interface PlaylistAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlaylistAddModal = ({
  open,
  onOpenChange,
}: PlaylistAddModalProps) => {
  return (
    <ResponsiveModal
      title="Add to playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2"></div>
    </ResponsiveModal>
  );
};
