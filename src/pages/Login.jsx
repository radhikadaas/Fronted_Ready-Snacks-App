import AuthForm from "../components/AuthForm";
import { useSearchParams } from "react-router-dom";

function Login() {
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/";

  return (
    <div className="pt-6">
      <AuthForm redirectTo={redirectTo} />
    </div>
  );
}

export default Login;
