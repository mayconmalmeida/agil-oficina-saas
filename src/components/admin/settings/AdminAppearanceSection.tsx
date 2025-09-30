
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface AdminAppearanceSectionProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function AdminAppearanceSection({ theme, onThemeToggle }: AdminAppearanceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Configurações de aparência do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tema</Label>
          <p className="text-sm text-muted-foreground">
            O sistema utiliza apenas o tema claro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
