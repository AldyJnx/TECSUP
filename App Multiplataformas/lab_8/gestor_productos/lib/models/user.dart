class AppUser {
  final String email;
  final DateTime loginAt;

  const AppUser({required this.email, required this.loginAt});

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        email: json['email'] as String,
        loginAt: DateTime.parse(json['loginAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'email': email,
        'loginAt': loginAt.toIso8601String(),
      };
}
