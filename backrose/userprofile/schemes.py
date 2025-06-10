from drf_spectacular.utils import extend_schema

LOGIN_SCHEMA = extend_schema(
    summary="User authentication",
    description="User authentication using email and password. Sets authentication cookies.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "email": {
                    "type": "string",
                    "format": "email",
                    "description": "User email address",
                    "example": "user@example.com",
                },
                "password": {
                    "type": "string",
                    "description": "User password",
                    "example": "password123",
                },
            },
            "required": ["email", "password"],
        }
    },
    responses={
        200: {
            "description": "Successfully authenticated",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "user": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "integer"},
                                    "username": {"type": "string"},
                                    "email": {"type": "string", "format": "email"},
                                    "app_header": {"type": "string"},
                                    "image": {
                                        "type": "string",
                                        "format": "uri",
                                        "nullable": True,
                                    },
                                },
                            },
                            "detail": {"type": "string"},
                        },
                    },
                    "example": {
                        "user": {
                            "id": 1,
                            "username": "fancy_username",
                            "email": "fancy@example.com",
                            "app_header": "fancy header",
                            "image": "http://fancy_example.com/media/images/userphoto/avatar.jpg",
                        },
                        "detail": "Успешная авторизация",
                    },
                }
            },
        },
        401: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {"detail": {"type": "string"}},
                    },
                    "example": {"detail": "Неверные учетные данные"},
                }
            },
        },
    },
    tags=["Authentication"],
)

REFRESH_SCHEMA = extend_schema(
    summary="Refresh access token",
    description="Refresh access token using refresh token from httpOnly cookie",
    request=None,
    responses={
        200: {
            "description": "Token refreshed successfully",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {"detail": {"type": "string"}},
                    },
                    "example": {"detail": "Token refreshed successfully"},
                }
            },
        },
        401: {
            "description": "Invalid or expired refresh token",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {"detail": {"type": "string"}},
                    },
                    "example": {
                        "detail": "Недействительный или истекший refresh токен"
                    },
                }
            },
        },
    },
    tags=["Authentication"],
)

LOGOUT_SCHEMA = extend_schema(
    summary="User logout",
    description="Logout user by blacklisting refresh token and clearing authentication cookies",
    request=None,
    responses={
        200: {
            "description": "Successfully logged out",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {"detail": {"type": "string"}},
                    },
                    "example": {"detail": "Успешный выход из системы"},
                }
            },
        }
    },
    tags=["Authentication"],
)

REGISTER_SCHEMA = extend_schema(
    summary="User registration",
    description="Register new user with email, username and password. Profile is created automatically",
    responses={
        201: {
            "description": "User registered successfully",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {"message": {"type": "string"}},
                    },
                    "example": {
                        "message": "User registered successfully. Please log in."
                    },
                }
            },
        },
        400: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "email": {"type": "array", "items": {"type": "string"}},
                            "username": {"type": "array", "items": {"type": "string"}},
                            "password": {"type": "array", "items": {"type": "string"}},
                        },
                    },
                    "example": {
                        "email": ["User with this Email already exists."],
                        "username": [
                            "Ensure this field has no more than 100 characters."
                        ],
                        "password": ["Пароли не совпадают"],
                    },
                }
            },
        },
    },
    tags=["Authentication"],
)

USER_GET_SCHEMA = extend_schema(
    summary="Get current user information",
    description="Retrieve current authenticated user information including profile data",
    responses={
        200: {
            "description": "User information retrieved successfully",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer"},
                            "username": {"type": "string"},
                            "email": {"type": "string", "format": "email"},
                            "app_header": {"type": "string"},
                            "image": {
                                "type": "string",
                                "format": "uri",
                                "nullable": True,
                            },
                        },
                    },
                    "example": {
                        "id": 1,
                        "username": "fancy_username",
                        "email": "fancy@example.com",
                        "app_header": "fancy header",
                        "image": "http://fancy_example.com/media/images/userphoto/avatar.jpg",
                    },
                }
            },
        },
        401: {
            "description": "Authentication credentials not provided",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {"detail": {"type": "string"}},
                    },
                    "example": {
                        "detail": "Authentication credentials were not provided."
                    },
                }
            },
        },
    },
    tags=["Users"],
)

USER_PATCH_SCHEMA = extend_schema(
    summary="Update user and profile data",
    description="Partially update current user data (username) and profile data (app_header, image). Email cannot be changed through this endpoint",
    request={
        "multipart/form-data": {
            "type": "object",
            "properties": {
                "username": {
                    "type": "string",
                    "maxLength": 100,
                    "description": "Username (max 100 characters)",
                    "example": "new_username",
                },
                "app_header": {
                    "type": "string",
                    "maxLength": 1000,
                    "description": "Application header in user profile (max 1000 characters)",
                    "example": "fancy header",
                },
                "image": {
                    "type": "string",
                    "format": "binary",
                    "description": "fancy image (jpg, png, jpeg)",
                },
            },
        }
    },
    responses={
        200: {
            "description": "User updated successfully",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer"},
                            "username": {"type": "string"},
                            "email": {"type": "string", "format": "email"},
                            "app_header": {"type": "string"},
                            "image": {
                                "type": "string",
                                "format": "uri",
                                "nullable": True,
                            },
                        },
                    },
                    "example": {
                        "id": 1,
                        "username": "fancy_username",
                        "email": "fancy@example.com",
                        "app_header": "Personal Dashboard",
                        "image": "http://fancy_example.com/media/images/userphoto/new_avatar.jpg",
                    },
                }
            },
        },
        400: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "username": {"type": "array", "items": {"type": "string"}},
                            "app_header": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "image": {"type": "array", "items": {"type": "string"}},
                        },
                    },
                    "example": {
                        "username": [
                            "Ensure this field has no more than 100 characters."
                        ],
                        "app_header": [
                            "Ensure this field has no more than 1000 characters."
                        ],
                        "image": ["Upload a valid image."],
                    },
                }
            },
        },
        401: {
            "description": "Authentication credentials not provided",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {"detail": {"type": "string"}},
                    },
                    "example": {
                        "detail": "Authentication credentials were not provided."
                    },
                }
            },
        },
    },
    tags=["Users"],
)
