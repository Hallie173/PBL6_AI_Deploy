export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      userID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "userID",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: "email",
      },
      displayName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "display_name",
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "avatar",
      },
    },
    {
      tableName: "Users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return User;
};
