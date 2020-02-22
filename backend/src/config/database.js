module.exports = {
  dialect: 'postgres', // Tipo do banco (postgres)
  host: 'localhost',
  username: 'postgres',
  password: 'fastfeet',
  database: 'fastfeet', // Nome da database
  define: {
    timestamps: true,
    underscored: true,
    underscoredAdd: true,
  },
};
