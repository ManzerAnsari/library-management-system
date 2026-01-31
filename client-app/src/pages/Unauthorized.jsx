import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold text-foreground">Unauthorized</h1>
      <p className="text-muted-foreground">You don’t have permission to view this page.</p>
      <Link to="/" className="text-primary underline">Back to Home</Link>
    </div>
  );
}
