import { useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Card, FInput, FSelect, PageHeader } from '../../components/ui';
import { useChangePasswordMutation, useUpdateMeMutation } from '../../app/api';
import { setSession, setUser } from '../../features/auth/authSlice';
import { applyServerErrors, errorMessage } from '../../lib/errors';
import { STATES } from '../../lib/states';

export function PasswordForm({ onDone, forced = false }) {
  const [change] = useChangePasswordMutation();
  const dispatch = useDispatch();
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const schema = Yup.object({
    currentPassword: Yup.string().required('Required'),
    newPassword: Yup.string().min(8, 'At least 8 characters').required('Required'),
    confirm: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords do not match').required('Required'),
  });
  const submit = async ({ confirm, ...values }, { resetForm, setFieldError }) => {
    setMsg({ kind: '', text: '' });
    try {
      const { user, token } = await change(values).unwrap();
      dispatch(setSession({ user, token })); // the old token stops working once the password changes
      resetForm();
      setMsg({ kind: 'ok', text: 'Password changed.' });
      onDone?.(user);
    } catch (e) {
      if (!applyServerErrors(e, setFieldError)) setMsg({ kind: 'error', text: errorMessage(e) });
    }
  };
  return (
    <Formik initialValues={{ currentPassword: '', newPassword: '', confirm: '' }} validationSchema={schema} onSubmit={submit}>
      {({ isSubmitting }) => (
        <Form className="space-y-4" noValidate>
          <Alert kind={msg.kind || 'error'}>{msg.text}</Alert>
          <FInput name="currentPassword" label={forced ? 'Temporary password' : 'Current password'} type="password" autoComplete="current-password" />
          <FInput name="newPassword" label="New password" type="password" autoComplete="new-password" />
          <FInput name="confirm" label="Confirm new password" type="password" autoComplete="new-password" />
          <Button type="submit" variant="dark" loading={isSubmitting}>Change password</Button>
        </Form>
      )}
    </Formik>
  );
}

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const [update] = useUpdateMeMutation();
  const dispatch = useDispatch();
  const [msg, setMsg] = useState({ kind: '', text: '' });

  const initial = { fullName: user.fullName, phone: user.phone, street: user.address?.street ?? '', city: user.address?.city ?? '', state: user.address?.state ?? '' };
  const schema = Yup.object({ fullName: Yup.string().min(2).required('Required'), phone: Yup.string().required('Required') });

  const submit = async ({ street, city, state, ...rest }, { setFieldError }) => {
    setMsg({ kind: '', text: '' });
    const address = { ...(street && { street }), ...(city && { city }), ...(state && { state }) };
    try {
      const r = await update({ ...rest, ...(Object.keys(address).length && { address }) }).unwrap();
      dispatch(setUser(r.user));
      setMsg({ kind: 'ok', text: 'Profile saved.' });
    } catch (e) {
      if (!applyServerErrors(e, setFieldError)) setMsg({ kind: 'error', text: errorMessage(e) });
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title="Profile" />
      <Card>
        <p className="mb-5 text-sm text-muted">Signed in as <span className="font-medium text-ink">{user.email}</span></p>
        <Formik initialValues={initial} validationSchema={schema} onSubmit={submit}>
          {({ isSubmitting }) => (
            <Form className="space-y-4" noValidate>
              <Alert kind={msg.kind || 'error'}>{msg.text}</Alert>
              <FInput name="fullName" label="Full name" />
              <FInput name="phone" label="Phone number" type="tel" />
              <FInput name="street" label="Street address" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FInput name="city" label="City" />
                <FSelect name="state" label="State" options={STATES} />
              </div>
              <Button type="submit" variant="dark" loading={isSubmitting}>Save changes</Button>
            </Form>
          )}
        </Formik>
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-extrabold">Change password</h2>
        <PasswordForm />
      </Card>
    </div>
  );
}
