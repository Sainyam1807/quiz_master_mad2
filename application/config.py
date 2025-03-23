class Config():
    DEBUG = False   # debug is a variable
    SQLALCHEMY_TRACK_MOADIFICATIONS = True   # variable


class LocalDevelopmentConfig(Config):  # inheriting the config class
    # database configuration
    SQLALCHEMY_DATABASE_URI = "sqlite:///quizmasterv2.sqlite3"
    DEBUG = True   # overriding the variable DEBUG

    # security configurations
    SECRET_KEY="this-is-secretkey"  # hashes user credentials in sessions
    SECURITY_PASSWORD_HASH="bcrypt"  # bcrypt is the mechanism for encrypting or hashing password
    SECURITY_PASSWORD_SALT="this-is-password-salt" # helps in encrypting / hashing the password  || works as a key for hashing password
    WTF_CSRF_ENABLED= False  # related to the forms info that it is coming from the same application form
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "authentication-token"  # it is a key for authentication token in postman