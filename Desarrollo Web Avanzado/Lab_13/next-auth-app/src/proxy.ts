import { withAuth } from "next-auth/middleware";

// En Next.js 16 el antiguo "middleware" se llama ahora "proxy".
// withAuth protege las rutas y redirige a /signIn si no hay sesion.
export default withAuth({
  pages: {
    signIn: "/signIn",
  },
});

export const config = { matcher: ["/dashboard", "/profile"] };
