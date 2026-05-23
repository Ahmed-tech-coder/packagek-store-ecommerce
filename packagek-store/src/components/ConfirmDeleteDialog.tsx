import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface ConfirmDeleteDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  trigger?: React.ReactNode;
}

export function ConfirmDeleteDialog({
  title = "تأكيد الحذف",
  description = "هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع بعد ذلك.",
  onConfirm,
  trigger,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center space-y-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-destructive">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الحذف...
              </>
            ) : (
              "تأكيد الحذف"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
