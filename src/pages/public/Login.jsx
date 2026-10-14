import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import AuthLayout from './AuthLayout';
import { Alert, Button, FInput } from '../../components/ui';
import { HOME } from '../../components/ProtectedRoute';
import { useLoginMutation } from '../../app/api';
import { setSession } from '../../features/auth/authSlice';
import { errorMessage } from '../../lib/errors';

const schema = Yup.object({ email: Yup.string().email('Enter a valid email').required('Email is required'), password: Yup.string().required('Password is required') });

export default function Login() {
  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loc = useLocation();
  const [error, setError] = useState('');

  const submit = async (values) => {
    setError('');
    try {
      const { user, token } = await login(values).unwrap();
      dispatch(setSession({ user, token }));
      navigate(user.mustChangePassword ? '/change-password' : loc.state?.from || HOME[user.role], { replace: true });
    } catch (e) {
      setError(errorMessage(e, 'Could not sign in.'));
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to book and track shipments." footer={<>New to Netryk? <Link to="/register" className="font-semibold text-ink underline">Create an account</Link></>}>
      <Formik initialValues={{ email: '', password: '' }} validationSchema={schema} onSubmit={submit}>
        {({ isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            <Alert>{error}</Alert>
            <FInput name="email" label="Email" type="email" autoComplete="email" />
            <FInput name="password" label="Password" type="password" autoComplete="current-password" />
            <Button type="submit" loading={isSubmitting} className="w-full">Sign in</Button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
