import React, { useEffect } from "react";
import { isDev } from "src/api/endpoints";
import useAuth from "src/state/auth";
import usePath from "src/state/path";

type RouteProps = {
  path: string;
  children: React.ReactNode;
};

const Route = (props: RouteProps) => {
  const p = usePath();
  useEffect(() => {
    p.register(props.path);
  }, []);
  return p.path === props.path ? <>{props.children}</> : null;
};

const ProtectedRoute = (props: RouteProps) => {
  const p = usePath();
  const a = useAuth();
  useEffect(() => {
    p.register(props.path);
  }, []);
  if (!a.token || a.user.AccountID === "") return <Navigate to="/login" />;
  return p.path === props.path ? <>{props.children}</> : null;
};

const ProtectedRouteUserLevel = (
  props: RouteProps & {
    level: number;
  }
) => {
  const p = usePath();
  const a = useAuth();

  useEffect(() => {
    p.register(props.path);
  }, []);
  if (!a.token || a.user.AccountID === "") return <Navigate to="/login" />;
  if (a.user.Role < props.level && isDev === false) return <Navigate to="/" />;
  return p.path === props.path ? <>{props.children}</> : null;
};

const Link = (props: { to: string; children: React.ReactNode }) => {
  const p = usePath();
  return (
    <span
      onClick={() => {
        p.set(props.to);
      }}
    >
      {props.children}
    </span>
  );
};

const Navigate = (props: { to: string }) => {
  const p = usePath();
  useEffect(() => {
    p.set(props.to);
  }, []);
  return null;
};

const NoRoute = () => {
  const p = usePath();

  useEffect(() => {
    const isRouteRegistered = p.registered.has(p.path);
    if (!isRouteRegistered) {
      p.set("/login");
    }
  }, [p]);

  return null;
};

export default Route;
export { Link, ProtectedRoute, NoRoute, ProtectedRouteUserLevel };
