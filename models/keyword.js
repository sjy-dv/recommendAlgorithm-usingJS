module.exports = (sequelize, DataTypes) => {
  const Keywords = sequelize.define(
    "Keywords",
    {
      idx: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      keywords: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      comment: "키워드 테이블",
    }
  );
  return Keywords;
};
