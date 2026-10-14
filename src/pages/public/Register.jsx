import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import AuthLayout from './AuthLayout';
import { Alert, Button, FInput } from '../../components/ui';
import { useRegisterMutation } from '../../app/api';
import { setSession } from '../../features/auth/authSlice';
import { applyServerErrors, errorMessage } from '../../lib/errors';

const schema = Yup.object({
  fullName: Yup.string().trim().min(2, 'Enter your full name').required('Full name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirm: Yup.string().oneOf([Yup.ref('password')], 'Passwords do not match').required('Confirm your password'),
});

export default function Register() {
  const [register] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const submit = async ({ confirm, ...values }, { setFieldError }) => {
    setError('');
    try {
      const { user, token } = await register(values).unwrap();
      dispatch(setSession({ user, token }));
      navigate('/app', { replace: true });
    } catch (e) {
      if (!applyServerErrors(e, setFieldError)) setError(errorMessage(e, 'Could not create your account.'));
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Customer accounts only. Drivers are added by Netryk." footer={<>Already registered? <Link to="/login" className="font-semibold text-ink underline">Sign in</Link></>}>
      <Formik initialValues={{ fullName: '', email: '', phone: '', password: '', confirm: '' }} validationSchema={schema} onSubmit={submit}>
        {({ isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            <Alert>{error}</Alert>
            <FInput name="fullName" label="Full name" autoComplete="name" />
            <FInput name="email" label="Email" type="email" autoComplete="email" />
            <FInput name="phone" label="Phone number" type="tel" autoComplete="tel" hint="For example 0803 123 4567" />
            <FInput name="password" label="Password" type="password" autoComplete="new-password" hint="At least 8 characters" />
            <FInput name="confirm" label="Confirm password" type="password" autoComplete="new-password" />
            <Button type="submit" loading={isSubmitting} className="w-full">Create account</Button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
