import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          {isSuccess ? (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-destructive" />
          )}
          <CardTitle className="mt-4">
            {isSuccess ? 'Email vérifié !' : 'Échec de la vérification'}
          </CardTitle>
          <CardDescription>
            {isSuccess
              ? 'Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter à votre compte.'
              : "Le lien de vérification est invalide ou a expiré. Vous pouvez demander un nouveau lien."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to={isSuccess ? '/login' : '/resend-verification'}>
              {isSuccess ? 'Se connecter' : "Renvoyer l'email"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}