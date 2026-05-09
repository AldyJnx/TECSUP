import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../pages/login_page.dart';
import '../pages/home_shell.dart';
import '../pages/home_page.dart';
import '../pages/products_list_page.dart';
import '../pages/product_register_page.dart';
import '../pages/profile_page.dart';

class AppRouter {
  static GoRouter create(AuthProvider auth) => GoRouter(
        initialLocation: '/login',
        refreshListenable: auth,
        redirect: (context, state) {
          final loggedIn = auth.isLoggedIn;
          final onLogin = state.matchedLocation == '/login';
          if (!loggedIn && !onLogin) return '/login';
          if (loggedIn && onLogin) return '/home';
          return null;
        },
        routes: [
          GoRoute(
            path: '/login',
            builder: (context, state) => const LoginPage(),
          ),
          ShellRoute(
            builder: (context, state, child) => HomeShell(
              location: state.matchedLocation,
              child: child,
            ),
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomePage(),
                routes: [
                  GoRoute(
                    path: 'products',
                    builder: (context, state) => const ProductsListPage(),
                    routes: [
                      GoRoute(
                        path: 'new',
                        builder: (context, state) =>
                            const ProductRegisterPage(),
                      ),
                    ],
                  ),
                  GoRoute(
                    path: 'profile',
                    builder: (context, state) => const ProfilePage(),
                  ),
                ],
              ),
            ],
          ),
        ],
      );
}
