import { redirect } from 'next/navigation';

// The spec lists /signup; /register is the canonical implementation.
export default function SignupPage() {
  redirect('/register');
}
