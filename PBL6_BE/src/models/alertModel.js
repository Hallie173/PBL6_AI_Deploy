export default (sequelize, DataTypes) => {
  const Alert = sequelize.define(
    "Alert",
    {
      alertID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      alert_type: {
        type: DataTypes.ENUM("fire", "fall"),
        allowNull: false,
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      snapshot_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("pending", "sent"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "Alerts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return Alert;
};
