export default (sequelize, DataTypes) => {
  const AlertEvidence = sequelize.define(
    "AlertEvidence",
    {
      evidenceID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      alertID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      sessionID: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      sequenceIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: "AlertEvidence",
      timestamps: false,
    }
  );

  return AlertEvidence;
};
