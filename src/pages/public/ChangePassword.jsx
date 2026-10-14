import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthLayout from './AuthLayout';
import { PasswordForm } from '../shared/Profile';
import { HOME } from '../../components/ProtectedRoute';

export default function ChangePassword() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  return (
    <AuthLayout title="Choose a new password" subtitle={user.mustChangePassword ? 'You signed in with a temporary password. Set your own to continue.' : 'Update your password.'}>
      <PasswordForm forced={user.mustChangePassword} onDone={(u) => navigate(HOME[u.role], { replace: true })} />
    </AuthLayout>
  );
}
