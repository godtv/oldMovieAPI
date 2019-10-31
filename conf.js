module.exports = {
    db: {
        host:       'localhost',
        user:       'root',
        password:   '',
        database:   'test'
    },
    port: 8000,
    // 自訂加密密碼的加鹽
    salt: '@2#!A9x?4',
    // JWT 自訂私鑰
    secret: 't5p@666',
    // JWT 加上多少時間過期 (UNIX 時間戳)
    increaseTime: 100000
};
