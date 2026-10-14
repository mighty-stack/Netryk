import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CircleAlert, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import Logo from '../../components/Logo';
import { Button, Card, Spinner } from '../../components/ui';
import { useVerifyPaymentQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';

// Paystack sends the customer here with ?reference=. The server (not this page) decides whether it was paid.
export default function PaymentComplete() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const { token } = useSelector((s) => s.auth);
  const { data, error, isFetching, refetch } = useVerifyPaymentQuery(reference, { skip: !reference || !token });

  let body;
  if (!reference) body = <Result icon={CircleAlert} tone="text-red-700" title="No payment reference" text="Open this page from the payment link, or find your shipment in your account." />;
  else if (!token) body = <Result icon={CircleAlert} tone="text-amber-700" title="Sign in to confirm" text="Sign in to see the result of your payment." action={<Link to="/login" state={{ from: `/payment/complete?reference=${reference}` }}><Button>Sign in</Button></Link>} />;
  else if (isFetching) body = <Spinner label="Confirming your payment" />;
  else if (error) body = <Result icon={CircleAlert} tone="text-red-700" title="We could not confirm it yet" text={errorMessage(error)} action={<Button onClick={refetch}>Check again</Button>} />;
  else if (data.payment.status === 'success') body = <Result icon={CheckCircle2} tone="text-green-700" title="Payment received" text="Your booking is confirmed. We will assign a driver shortly." action={<Link to={`/app/shipments/${data.shipment.id}`}><Button>View shipment</Button></Link>} />;
  else if (data.payment.status === 'flagged') body = <Result icon={Clock} tone="text-amber-700" title="Payment under review" text="We received a payment that needs a manual check. Contact support with your tracking ID. You will not be charged twice." action={<Link to={`/app/shipments/${data.shipment.id}`}><Button variant="ghost">View shipment</Button></Link>} />;
  else body = <Result icon={CircleAlert} tone="text-red-700" title="Payment not completed" text="No money was taken, or it has not cleared yet. You can try again from your shipment." action={<Link to={`/app/shipments/${data.shipment.id}`}><Button>Back to shipment</Button></Link>} />;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="mb-8 flex justify-center" aria-label="Netryk home"><Logo /></Link>
        <Card>{body}</Card>
      </div>
    </div>
  );
}

function Result({ icon: Icon, tone, title, text, action }) {
  return (
    <div className="py-4">
      <Icon className={`mx-auto size-12 ${tone}`} aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-muted">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
